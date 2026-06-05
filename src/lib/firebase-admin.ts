// Firebase Admin SDK - solo para uso en el servidor (Server Actions, API Routes)
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminApp: App;

function cleanEnvVar(val: string | undefined): string | undefined {
  if (!val) return val;
  let cleaned = val.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned;
}

function getAdminApp() {
  if (getApps().length > 0) {
    adminApp = getApps()[0];
  } else {
    const projectId = cleanEnvVar(process.env.FIREBASE_PROJECT_ID);
    const clientEmail = cleanEnvVar(process.env.FIREBASE_CLIENT_EMAIL);
    let privateKey = cleanEnvVar(process.env.FIREBASE_PRIVATE_KEY);
    
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
  return adminApp;
}

export const adminDb = getFirestore(getAdminApp());
export const adminAuth = getAuth(getAdminApp());
