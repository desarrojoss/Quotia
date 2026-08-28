import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/firebase-admin";

// Proxy siempre corre en runtime Node.js (a diferencia del middleware clásico en Edge),
// así que firebase-admin funciona aquí sin trucos.
export const config = {
  matcher: [
    "/((?!login|api/auth/session|api/webhooks/stripe|_next/static|_next/image|favicon.ico).*)",
  ],
};

export async function proxy(req: NextRequest) {
  const cookie = req.cookies.get("session")?.value;
  if (!cookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await auth.verifySessionCookie(cookie, true);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
