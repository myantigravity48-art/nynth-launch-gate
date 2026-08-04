import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { logger } from "./logger.js";

let app: App;
let _db: Firestore;

function getApp(): App {
  if (!app) {
    const key = process.env["FIREBASE_SERVICE_ACCOUNT_KEY"];
    if (!key) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY env var is required");
    }

    let serviceAccount: object;
    try {
      serviceAccount = JSON.parse(key);
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON");
    }

    if (getApps().length === 0) {
      app = initializeApp({ credential: cert(serviceAccount as Parameters<typeof cert>[0]) });
      logger.info("Firebase Admin SDK initialized");
    } else {
      app = getApps()[0]!;
    }
  }
  return app;
}

export function db(): Firestore {
  if (!_db) {
    getApp();
    _db = getFirestore();
  }
  return _db;
}
