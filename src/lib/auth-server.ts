import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthAdmin } from "@/lib/firebase-admin";

export async function requireSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) redirect("/login");

  try {
    return await getAuthAdmin().verifySessionCookie(session, true);
  } catch {
    redirect("/login");
  }
}
