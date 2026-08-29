import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// El service account completo va en una sola variable base64 (en vez de
// project id / email / private key sueltos) para que copiar-pegar en la UI de
// Vercel (o en cualquier .env) no pueda romper los saltos de línea de la
// clave privada — base64 no tiene caracteres especiales que escapar.
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ?? "", "base64").toString("utf8") ||
    "{}"
);

// getApps() guard avoids re-initializing on every warm serverless invocation.
const app =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
  });

export const db = getFirestore(app);
export const auth = getAuth(app);
