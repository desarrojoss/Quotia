import Link from "next/link";
import { listQuotes } from "@/lib/quotes";
import { QuotesTable } from "@/components/quotes-table";
import { AppHeader } from "@/components/app-header";
import { PlusIcon } from "@/components/icons";
import { requireSession } from "@/lib/auth-server";

function formatMoney(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "USD" });
}

export default async function PanelPage() {
  await requireSession();
  const quotes = await listQuotes();

  const totalFacturado = quotes
    .filter((q) => q.estado === "pagada")
    .reduce((sum, q) => sum + q.total, 0);
  const pendienteCobro = quotes
    .filter((q) => q.estado === "enviada")
    .reduce((sum, q) => sum + q.total, 0);

  return (
    <div className="min-h-screen">
      <AppHeader>
        <Link href="/crear" className="btn btn-primary btn-sm sm:px-4 sm:py-2.5 sm:text-sm">
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva cotización</span>
        </Link>
      </AppHeader>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-xs font-medium text-zinc-500">Cotizaciones</p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-white">{quotes.length}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-medium text-zinc-500">Pendiente de cobro</p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-cyan-300">
              {formatMoney(pendienteCobro)}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-medium text-zinc-500">Cobrado</p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-emerald-400">
              {formatMoney(totalFacturado)}
            </p>
          </div>
        </div>

        <QuotesTable initialQuotes={quotes} />
      </main>
    </div>
  );
}
