"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutIcon, SpinnerIcon } from "@/components/icons";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      title="Cerrar sesión"
      className="btn-icon"
    >
      {loading ? <SpinnerIcon className="h-4 w-4" /> : <LogoutIcon className="h-4 w-4" />}
    </button>
  );
}
