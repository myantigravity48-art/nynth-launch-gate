import { Router, type IRouter } from "express";
import { randomBytes } from "node:crypto";
import { CreateCollectionBody, GetCollectionParams, ListSignupsParams, SendBroadcastEmailParams, SendBroadcastEmailBody, SendUnlockEmailsParams, CreateCollectionResponse, GetCollectionResponse, ListCollectionsResponse, ListSignupsResponse, SendUnlockEmailsResponse, SendBroadcastEmailResponse } from "@workspace/api-zod";
import { supabase } from "../lib/supabase.js";
import { resend, FROM_EMAIL } from "../lib/resendClient.js";
import { renderUnlockEmail, renderBroadcastEmail } from "../lib/emailTemplate.js";

const router: IRouter = Router();
const slugParam = (raw: string | string[]) => Array.isArray(raw) ? raw[0] ?? "" : raw;
const errorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);
const collectionFields = "id,name,slug,launch_date,status,password";
type CollectionRow = { id: string; name: string | null; slug: string | null; launch_date: string | null; status: string | null; password: string | null };

function asCollection(row: Record<string, unknown>) {
  return { id: String(row["slug"] ?? ""), name: typeof row["name"] === "string" ? row["name"] : "", launchDatetime: safeIso(row["launch_date"]), status: row["status"] === "live" ? "live" as const : "locked" as const };
}
function safeIso(value: unknown): string {
  try { if (typeof value !== "string" || !value.trim()) return ""; const date = new Date(value); return Number.isFinite(date.getTime()) ? date.toISOString() : ""; } catch { return ""; }
}
function generatePassword() { return randomBytes(4).toString("hex").toUpperCase(); }
async function findCollection(slug: string) {
  return supabase.from("collections").select(collectionFields).eq("slug", slug).maybeSingle();
}
async function sendToSubscribers(subscribers: Array<{ id: string; email: string }>, send: (email: string) => Promise<{ error: string | null }>) {
  let sent = 0; let failed = 0; const errors: string[] = []; const delivered: string[] = [];
  for (const subscriber of subscribers) {
    const email = typeof subscriber.email === "string" ? subscriber.email : "";
    if (!email) { failed++; errors.push(`${subscriber.id}: missing email`); continue; }
    try { const result = await send(email); if (result.error) throw new Error(result.error); sent++; delivered.push(subscriber.id); }
    catch (error) { failed++; errors.push(`${email}: ${errorMessage(error)}`); }
  }
  return { sent, failed, errors, delivered };
}

router.get("/collections", async (_req, res): Promise<void> => {
  const { data, error } = await supabase.from("collections").select(collectionFields).order("launch_date", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as CollectionRow[];
  const counts = new Map<string, number>();
  if (rows.length) {
    const { data: subscribers, error: subscriberError } = await supabase.from("subscribers").select("collection_id").in("collection_id", rows.map((row) => row.id));
    if (subscriberError) throw subscriberError;
    for (const subscriber of (subscribers ?? []) as Array<{ collection_id: string | null }>) { const id = String(subscriber.collection_id ?? ""); counts.set(id, (counts.get(id) ?? 0) + 1); }
  }
  res.json(ListCollectionsResponse.parse(rows.map((row) => ({ ...asCollection(row), signupCount: counts.get(String(row.id)) ?? 0 }))));
});

router.post("/collections", async (req, res): Promise<void> => {
  const parsed = CreateCollectionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { name, slug, launchDatetime } = parsed.data;
  const { data: existing, error: lookupError } = await supabase.from("collections").select("id").eq("slug", slug).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) { res.status(409).json({ error: "A collection with that slug already exists" }); return; }
  const launchDate = new Date(launchDatetime);
  if (!Number.isFinite(launchDate.getTime())) { res.status(400).json({ error: "Invalid launch date" }); return; }
  const password = generatePassword();
  const { data, error } = await supabase.from("collections").insert({ name, slug, launch_date: launchDate.toISOString(), status: "locked", password }).select(collectionFields).single();
  if (error) { if (error.code === "23505") { res.status(409).json({ error: "A collection with that slug already exists" }); return; } throw error; }
  res.status(201).json(CreateCollectionResponse.parse({ ...asCollection(data), password }));
});

router.get("/collections/:slug", async (req, res): Promise<void> => {
  const params = GetCollectionParams.safeParse({ slug: slugParam(req.params["slug"] ?? "") });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const { data, error } = await findCollection(params.data.slug);
  if (error) throw error;
  if (!data) { res.status(404).json({ error: "Collection not found" }); return; }
  res.json(GetCollectionResponse.parse(asCollection(data)));
});

router.get("/collections/:slug/signups", async (req, res): Promise<void> => {
  const params = ListSignupsParams.safeParse({ slug: slugParam(req.params["slug"] ?? "") });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const { data: collection, error: collectionError } = await findCollection(params.data.slug);
  if (collectionError) throw collectionError;
  if (!collection) { res.status(404).json({ error: "Collection not found" }); return; }
  const { data, error } = await supabase.from("subscribers").select("id,email,created_at,notified").eq("collection_id", collection.id).order("created_at", { ascending: true });
  if (error) throw error;
  const signups = ((data ?? []) as Array<{ id: string | null; email: string | null; notified: boolean | null; created_at: string | null }>).map((row) => ({ id: String(row.id ?? ""), collectionId: params.data.slug, email: typeof row.email === "string" ? row.email : "", password: null, unlocked: row.notified === true, createdAt: safeIso(row.created_at) }));
  res.json(ListSignupsResponse.parse(signups));
});

router.post("/collections/:slug/send-unlock-emails", async (req, res): Promise<void> => {
  const params = SendUnlockEmailsParams.safeParse({ slug: slugParam(req.params["slug"] ?? "") });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const { data: collection, error: collectionError } = await findCollection(params.data.slug);
  if (collectionError) throw collectionError;
  if (!collection) { res.status(404).json({ error: "Collection not found" }); return; }
  if (typeof collection.password !== "string" || !collection.password) { res.status(500).json({ error: "Collection has no unlock password" }); return; }
  const { data: pending, error } = await supabase.from("subscribers").select("id,email").eq("collection_id", collection.id).or("notified.is.null,notified.eq.false");
  if (error) throw error;
  const collectionName = typeof collection.name === "string" ? collection.name : "Your collection";
  const url = `https://nynthworld.com/${encodeURIComponent(String(collection.slug ?? params.data.slug))}`;
  const summary = await sendToSubscribers(pending ?? [], async (email) => {
    const result = await resend.emails.send({ from: FROM_EMAIL, to: email, subject: `${collectionName} is live — your unlock code`, html: renderUnlockEmail({ collectionName, password: collection.password as string, unlockUrl: url }) });
    return { error: result.error?.message ?? null };
  });
  let statusError: string | null = null;
  if (summary.delivered.length) {
    const { error: activationError } = await supabase.rpc("activate_collection", { target_collection_id: collection.id });
    if (activationError) {
      statusError = `Emails sent but collection could not be activated. Re-run unlock emails after applying the Supabase migration: ${activationError.message}`;
      summary.errors.push(statusError);
    } else {
      const { error: notifiedError } = await supabase.from("subscribers").update({ notified: true }).in("id", summary.delivered);
      if (notifiedError) { statusError = `Collection activated and emails sent, but subscriber notification state failed to update: ${notifiedError.message}`; summary.errors.push(statusError); }
    }
  }
  res.json(SendUnlockEmailsResponse.parse({ sent: summary.sent, failed: summary.failed, errors: summary.errors }));
});

router.post("/collections/:slug/send-broadcast", async (req, res): Promise<void> => {
  const params = SendBroadcastEmailParams.safeParse({ slug: slugParam(req.params["slug"] ?? "") });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const body = SendBroadcastEmailBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const { data: collection, error: collectionError } = await findCollection(params.data.slug);
  if (collectionError) throw collectionError;
  if (!collection) { res.status(404).json({ error: "Collection not found" }); return; }
  const { data, error } = await supabase.from("subscribers").select("id,email").eq("collection_id", collection.id);
  if (error) throw error;
  const name = typeof collection.name === "string" ? collection.name : "Collection";
  const html = renderBroadcastEmail({ collectionName: name, subject: body.data.subject, body: body.data.body });
  const summary = await sendToSubscribers(data ?? [], async (email) => { const result = await resend.emails.send({ from: FROM_EMAIL, to: email, subject: body.data.subject, html }); return { error: result.error?.message ?? null }; });
  res.json(SendBroadcastEmailResponse.parse({ sent: summary.sent, failed: summary.failed, errors: summary.errors }));
});

export default router;
