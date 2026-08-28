import Link from "next/link";
import { listQuotes } from "@/lib/quotes";
import { QuotesTable } from "@/components/quotes-table";
import { LogoutButton } from "@/components/logout-button";

export default async function PanelPage() {
  const quotes = await listQuotes();

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans">
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            <span className="text-cyan-400 font-mono">Quotia</span> — Panel
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/crear"
              className="rounded bg-cyan-500 px-4 py-2 font-semibold text-black hover:bg-cyan-400"
            >
              + Nueva cotización
            </Link>
            <LogoutButton />
          </div>
        </div>

        <QuotesTable initialQuotes={quotes} />
      </main>
    </div>
  );
}
