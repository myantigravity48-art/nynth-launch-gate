import { Router, type IRouter } from "express";
import { randomBytes } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../lib/firebase.js";
import { resend, FROM_EMAIL } from "../lib/resendClient.js";
import { renderUnlockEmail, renderBroadcastEmail } from "../lib/emailTemplate.js";
import {
  CreateCollectionBody,
  GetCollectionParams,
  ListSignupsParams,
  SendUnlockEmailsParams,
  SendBroadcastEmailParams,
  SendBroadcastEmailBody,
  CreateCollectionResponse,
  GetCollectionResponse,
  ListCollectionsResponse,
  ListSignupsResponse,
  SendUnlockEmailsResponse,
  SendBroadcastEmailResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// ── helpers ──────────────────────────────────────────────────────────────────

function slugParam(raw: string | string[]): string {
  return Array.isArray(raw) ? raw[0]! : raw;
}

function tsToIso(value: unknown): string {
  try {
    let date: Date;
    if (value instanceof Timestamp) date = value.toDate();
    else if (value instanceof Date) date = value;
    else if (typeof value === "number") date = new Date(value);
    else if (typeof value === "string" && value.trim()) date = new Date(value);
    else return "";
    return Number.isFinite(date.getTime()) ? date.toISOString() : "";
  } catch {
    return "";
  }
}

function generatePassword(): string {
  return randomBytes(6).toString("hex").toUpperCase();
}

// ── GET /collections ──────────────────────────────────────────────────────────

router.get("/collections", async (req, res): Promise<void> => {
  const snap = await db().collection("collections").get();

  const results = await Promise.all(
    snap.docs.map(async (doc) => {
      const data = doc.data();
      const signupsSnap = await doc.ref.collection("signups").get();
      return {
        id: doc.id,
        name: data["name"] as string,
        launchDatetime: tsToIso(data["launchDatetime"]),
        status: data["status"] as "locked" | "live",
        signupCount: signupsSnap.size,
      };
    }),
  );

  res.json(ListCollectionsResponse.parse(results));
});

// ── POST /collections ─────────────────────────────────────────────────────────

router.post("/collections", async (req, res): Promise<void> => {
  const parsed = CreateCollectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, slug, launchDatetime } = parsed.data;

  const docRef = db().collection("collections").doc(slug);
  const existing = await docRef.get();
  if (existing.exists) {
    res.status(409).json({ error: "A collection with that slug already exists" });
    return;
  }

  const launchTs = Timestamp.fromDate(new Date(launchDatetime));
  await docRef.set({ name, launchDatetime: launchTs, status: "locked" });

  const created = {
    id: slug,
    name,
    launchDatetime: launchTs.toDate().toISOString(),
    status: "locked" as const,
  };

  res.status(201).json(CreateCollectionResponse.parse(created));
});

// ── GET /collections/:slug ────────────────────────────────────────────────────

router.get("/collections/:slug", async (req, res): Promise<void> => {
  const params = GetCollectionParams.safeParse({ slug: slugParam(req.params["slug"]!) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const doc = await db().collection("collections").doc(params.data.slug).get();
  if (!doc.exists) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  const data = doc.data()!;
  res.json(
    GetCollectionResponse.parse({
      id: doc.id,
      name: data["name"],
      launchDatetime: tsToIso(data["launchDatetime"]),
      status: data["status"],
    }),
  );
});

// ── GET /collections/:slug/signups ────────────────────────────────────────────

router.get("/collections/:slug/signups", async (req, res): Promise<void> => {
  const params = ListSignupsParams.safeParse({ slug: slugParam(req.params["slug"]!) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const colRef = db().collection("collections").doc(params.data.slug);
  const colDoc = await colRef.get();
  if (!colDoc.exists) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  // Fetch without orderBy so Firestore doesn't silently drop docs whose
  // createdAt field is missing or stored as a non-Timestamp type (common in
  // manually-seeded collections). We sort in memory instead.
  const snap = await colRef.collection("signups").get();
  const signups = snap.docs
    .map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        collectionId: params.data.slug,
        email: d["email"] as string,
        password: (d["password"] as string | null) ?? null,
        unlocked: d["unlocked"] as boolean,
        createdAt: tsToIso(d["createdAt"]),
      };
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  res.json(ListSignupsResponse.parse(signups));
});

// ── POST /collections/:slug/send-unlock-emails ────────────────────────────────

router.post("/collections/:slug/send-unlock-emails", async (req, res): Promise<void> => {
  const params = SendUnlockEmailsParams.safeParse({ slug: slugParam(req.params["slug"]!) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { slug } = params.data;
  const colRef = db().collection("collections").doc(slug);

  const [colDoc, signupsSnap] = await Promise.all([
    colRef.get(),
    colRef.collection("signups").where("unlocked", "==", false).get(),
  ]);

  if (!colDoc.exists) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  const collectionName = colDoc.data()!["name"] as string;
  const unlockUrl = `https://nynthworld.com/${slug}`;

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const signupDoc of signupsSnap.docs) {
    const email = signupDoc.data()["email"] as string;
    const password = generatePassword();

    try {
      // Write password + unlocked flag first
      await signupDoc.ref.update({ password, unlocked: true });

      // Send email
      const html = renderUnlockEmail({ collectionName, password, unlockUrl });
      const { error: sendError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `${collectionName} is live — your unlock code`,
        html,
      });

      if (sendError) {
        // Roll back the unlock state on send failure
        await signupDoc.ref.update({ password: null, unlocked: false });
        failed++;
        errors.push(`${email}: ${sendError.message}`);
      } else {
        sent++;
      }
    } catch (err) {
      req.log.error({ err, email }, "Failed to send unlock email");
      failed++;
      errors.push(`${email}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  req.log.info({ slug, sent, failed }, "Unlock email batch complete");
  res.json(SendUnlockEmailsResponse.parse({ sent, failed, errors }));
});

export default router;
