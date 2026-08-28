import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-safe a propósito: solo revisa que exista la cookie (sin verificar la
// firma) para redirigir rápido a la mayoría de tráfico no autenticado.
// firebase-admin necesita APIs de Node que no existen en Edge, así que la
// verificación criptográfica real vive en requireSession() (lib/auth-server.ts),
// llamada desde cada página/action/route handler protegidos.
export const config = {
  matcher: [
    "/((?!login|api/auth/session|api/webhooks/stripe|_next/static|_next/image|favicon.ico).*)",
  ],
};

export function proxy(req: NextRequest) {
  if (!req.cookies.has("session")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}
