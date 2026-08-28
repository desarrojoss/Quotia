"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, LogoMark, SpinnerIcon } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      const signInRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, returnSecureToken: true }),
        }
      );
      const signInData = await signInRes.json();
      if (!signInRes.ok) {
        throw new Error(
          signInData.error?.message === "INVALID_LOGIN_CREDENTIALS"
            ? "Correo o contraseña incorrectos."
            : "No se pudo iniciar sesión."
        );
      }

      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: signInData.idToken }),
      });
      if (!sessionRes.ok) {
        throw new Error("No se pudo iniciar sesión.");
      }

      router.push("/panel");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <LogoMark className="h-10 w-10" />
          <div>
            <h1 className="font-mono text-xl font-semibold tracking-tight text-white">Quotia</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Inicia sesión para gestionar tus cotizaciones
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-6 sm:p-8">
          <div>
            <label htmlFor="email" className="field-label">
              Correo
            </label>
            <input
              id="email"
              required
              type="email"
              autoComplete="email"
              placeholder="tu@negocio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="password" className="field-label">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                required
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-400/20 bg-red-400/6 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary mt-2 w-full">
            {loading && <SpinnerIcon className="h-4 w-4" />}
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
