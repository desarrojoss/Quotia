"use client";

import { useMemo, useState } from "react";
import { createPaymentLink } from "@/app/actions";
import type { Quote, QuoteStatus } from "@/lib/types";

const ESTADO_LABEL: Record<QuoteStatus, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  pagada: "Pagada",
};

const ESTADO_CLASS: Record<QuoteStatus, string> = {
  borrador: "bg-zinc-800 text-zinc-300",
  enviada: "bg-cyan-950 text-cyan-400",
  pagada: "bg-green-950 text-green-400",
};

function formatMoney(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "USD" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function QuotesTable({ initialQuotes }: { initialQuotes: Quote[] }) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [filter, setFilter] = useState<QuoteStatus | "todos">("todos");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "todos" ? quotes : quotes.filter((q) => q.estado === filter)),
    [quotes, filter]
  );

  async function handleGenerateLink(id: string) {
    setGeneratingId(id);
    setErrorId(null);
    const result = await createPaymentLink(id, window.location.origin);
    setGeneratingId(null);
    if (result.ok && result.url) {
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, stripeCheckoutUrl: result.url, estado: "enviada" } : q
        )
      );
    } else {
      setErrorId(id);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-400">Estado:</span>
        {(["todos", "borrador", "enviada", "pagada"] as const).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded px-3 py-1 font-mono ${
              filter === value
                ? "bg-cyan-500 text-black"
                : "border border-zinc-700 text-zinc-400 hover:border-cyan-400"
            }`}
          >
            {value === "todos" ? "Todos" : ESTADO_LABEL[value]}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400">
              <th className="px-4 py-3 font-normal">Cliente</th>
              <th className="px-4 py-3 font-normal">Total</th>
              <th className="px-4 py-3 font-normal">Estado</th>
              <th className="px-4 py-3 font-normal">Fecha</th>
              <th className="px-4 py-3 font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((quote) => (
              <tr key={quote.id} className="border-b border-zinc-900 last:border-0">
                <td className="px-4 py-3">
                  <div>{quote.cliente.nombre}</div>
                  <div className="text-xs text-zinc-500">{quote.cliente.correo}</div>
                </td>
                <td className="px-4 py-3 font-mono">{formatMoney(quote.total)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-mono ${ESTADO_CLASS[quote.estado]}`}
                  >
                    {ESTADO_LABEL[quote.estado]}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{formatDate(quote.fechaCreacion)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`/api/quotes/${quote.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded border border-cyan-400 px-2 py-1 font-mono text-xs text-cyan-400 hover:bg-cyan-400 hover:text-black"
                    >
                      PDF
                    </a>
                    {quote.stripeCheckoutUrl ? (
                      <a
                        href={quote.stripeCheckoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-cyan-500 px-2 py-1 font-mono text-xs font-semibold text-black hover:bg-cyan-400"
                      >
                        Link de pago
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleGenerateLink(quote.id)}
                        disabled={generatingId === quote.id}
                        className="rounded border border-cyan-400 px-2 py-1 font-mono text-xs text-cyan-400 hover:bg-cyan-400 hover:text-black disabled:opacity-50"
                      >
                        {generatingId === quote.id ? "Generando…" : "Generar link"}
                      </button>
                    )}
                    {errorId === quote.id && (
                      <span className="text-xs text-red-400">Error al generar el link.</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No hay cotizaciones con este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
