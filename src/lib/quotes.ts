import { db } from "@/lib/firebase-admin";
import type { Quote } from "@/lib/types";

export async function getQuoteById(id: string): Promise<Quote | null> {
  const snap = await db.collection("quotes").doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as Omit<Quote, "id">) };
}

export async function listQuotes(): Promise<Quote[]> {
  const snap = await db.collection("quotes").orderBy("fechaCreacion", "desc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Quote, "id">) }));
}
