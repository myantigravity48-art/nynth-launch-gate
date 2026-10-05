// Vercel's catch-all API function exposes the existing Express router under
// /api/* while leaving the client-side app fallback to page routes.
import app from "@workspace/api-server";

export default app;
