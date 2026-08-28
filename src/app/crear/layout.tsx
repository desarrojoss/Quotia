import { requireSession } from "@/lib/auth-server";

export default async function CrearLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return children;
}
