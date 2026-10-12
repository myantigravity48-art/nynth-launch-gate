import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createHash, timingSafeEqual } from "node:crypto";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "";
const COOKIE_NAME = "lg_admin";
const hashPassword = (password: string) => createHash("sha256").update(password).digest("hex");
const adminCookieValue = ADMIN_PASSWORD ? hashPassword(ADMIN_PASSWORD) : null;

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!adminCookieValue) {
    next();
    return;
  }
  if (req.method === "GET" && req.path === "/healthz") {
    next();
    return;
  }
  const cookieOk = req.cookies?.[COOKIE_NAME] && safeEqual(String(req.cookies[COOKIE_NAME]), adminCookieValue);
  const authHeader = req.headers["authorization"];
  const bearerOk = authHeader?.startsWith("Bearer ") && safeEqual(authHeader.slice(7), ADMIN_PASSWORD);
  if (cookieOk || bearerOk) {
    next();
    return;
  }
  res.status(401).json({ error: "Unauthorized" });
}

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.post("/api/login", (req, res) => {
  if (!adminCookieValue) {
    res.status(400).json({ error: "ADMIN_PASSWORD is not configured" });
    return;
  }
  const password = typeof req.body?.["password"] === "string" ? req.body["password"] : "";
  if (!password || !safeEqual(password, ADMIN_PASSWORD)) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  res.cookie(COOKIE_NAME, adminCookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    maxAge: 12 * 60 * 60 * 1000,
  });
  res.json({ ok: true });
});

app.use("/api", requireAdmin, router);

if (!ADMIN_PASSWORD) {
  logger.warn("ADMIN_PASSWORD is not set — API auth is DISABLED");
}

export default app;
