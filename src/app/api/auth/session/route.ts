import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";

const SESSION_COOKIE = "session";
const EXPIRES_IN_MS = 14 * 24 * 60 * 60 * 1000; // 14 días

export async function POST(req: Request) {
  const { idToken } = await req.json();
  if (typeof idToken !== "string" || !idToken) {
    return NextResponse.json({ error: "Falta idToken." }, { status: 400 });
  }

  try {
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: EXPIRES_IN_MS,
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: EXPIRES_IN_MS / 1000,
    });
    return res;
  } catch (err) {
    console.error("createSessionCookie failed", err);
    return NextResponse.json({ error: "Login inválido." }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
