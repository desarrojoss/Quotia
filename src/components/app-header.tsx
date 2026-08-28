import Link from "next/link";
import { LogoMark } from "@/components/icons";
import { LogoutButton } from "@/components/logout-button";

export function AppHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/6 bg-(--color-bg)/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/panel" className="flex items-center gap-2">
          <LogoMark />
          <span className="font-mono text-base font-semibold tracking-tight text-white">
            Quotia
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {children}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
