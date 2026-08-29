import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// El service account completo va en una sola variable base64 (en vez de
// project id / email / private key sueltos) para que copiar-pegar en la UI de
// Vercel (o en cualquier .env) no pueda romper los saltos de línea de la
// clave privada — base64 no tiene caracteres especiales que escapar.
//
// Inicialización perezosa: si esto corriera a nivel de módulo y la env var
// estuviera mal, el cold start entero de la función fallaría con un 500 en
// blanco (sin stack visible). Como función, el error queda contenido dentro
// del primer request que la dispare y sí es capturable con try/catch ahí.
function getApp() {
  if (getApps().length) return getApps()[0];

  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ?? "", "base64").toString("utf8") ||
      "{}"
  );

  return initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
  });
}

export function getDb() {
  return getFirestore(getApp());
}

export function getAuthAdmin() {
  return getAuth(getApp());
}
