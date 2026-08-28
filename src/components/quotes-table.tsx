"use client";

import { useMemo, useState } from "react";
import { createPaymentLink } from "@/app/actions";
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  SpinnerIcon,
} from "@/components/icons";
import type { Quote, QuoteStatus } from "@/lib/types";

const ESTADO_LABEL: Record<QuoteStatus, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  pagada: "Pagada",
};

const ESTADO_CLASS: Record<QuoteStatus, string> = {
  borrador: "bg-zinc-800/80 text-zinc-300",
  enviada: "bg-cyan-400/10 text-cyan-300",
  pagada: "bg-emerald-400/10 text-emerald-300",
};

const ESTADO_DOT: Record<QuoteStatus, string> = {
  borrador: "bg-zinc-400",
  enviada: "bg-cyan-400",
  pagada: "bg-emerald-400",
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

function EstadoBadge({ estado }: { estado: QuoteStatus }) {
  return (
    <span className={`badge ${ESTADO_CLASS[estado]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ESTADO_DOT[estado]}`} />
      {ESTADO_LABEL[estado]}
    </span>
  );
}

function QuoteActions({
  quote,
  generating,
  copied,
  onGenerate,
  onCopy,
}: {
  quote: Quote;
  generating: boolean;
  copied: boolean;
  onGenerate: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`/api/quotes/${quote.id}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        title="Descargar PDF"
        className="btn-icon"
      >
        <DownloadIcon className="h-4 w-4" />
      </a>
      {quote.stripeCheckoutUrl ? (
        <>
          <a
            href={quote.stripeCheckoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
          >
            <ExternalLinkIcon className="h-3.5 w-3.5" />
            Link de pago
          </a>
          <button type="button" onClick={onCopy} title="Copiar link" className="btn-icon">
            {copied ? (
              <CheckIcon className="h-4 w-4 text-emerald-400" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
          </button>
        </>
      ) : (
        <button type="button" onClick={onGenerate} disabled={generating} className="btn btn-ghost btn-sm">
          {generating && <SpinnerIcon className="h-3.5 w-3.5" />}
          {generating ? "Generando…" : "Generar link"}
        </button>
      )}
    </div>
  );
}

export function QuotesTable({ initialQuotes }: { initialQuotes: Quote[] }) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [filter, setFilter] = useState<QuoteStatus | "todos">("todos");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  async function handleCopy(id: string, url: string) {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1600);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["todos", "borrador", "enviada", "pagada"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-medium transition-colors duration-150 ${
              filter === value
                ? "bg-cyan-400 text-[#032830]"
                : "border border-(--color-border-strong) text-zinc-400 hover:border-cyan-400/50 hover:text-cyan-300"
            }`}
          >
            {value === "todos" ? "Todos" : ESTADO_LABEL[value]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-1 px-6 py-16 text-center">
          <p className="text-sm text-zinc-400">No hay cotizaciones con este filtro.</p>
        </div>
      ) : (
        <>
          {/* Mobile: tarjetas apiladas */}
          <div className="flex flex-col gap-3 md:hidden">
            {filtered.map((quote) => (
              <div key={quote.id} className="card flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{quote.cliente.nombre}</p>
                    <p className="truncate text-xs text-zinc-500">{quote.cliente.correo}</p>
                  </div>
                  <EstadoBadge estado={quote.estado} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-semibold text-white">
                    {formatMoney(quote.total)}
                  </span>
                  <span className="text-xs text-zinc-500">{formatDate(quote.fechaCreacion)}</span>
                </div>
                {errorId === quote.id && (
                  <p className="text-xs text-red-400">Error al generar el link.</p>
                )}
                <QuoteActions
                  quote={quote}
                  generating={generatingId === quote.id}
                  copied={copiedId === quote.id}
                  onGenerate={() => handleGenerateLink(quote.id)}
                  onCopy={() => quote.stripeCheckoutUrl && handleCopy(quote.id, quote.stripeCheckoutUrl)}
                />
              </div>
            ))}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-surface) md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-(--color-border) text-xs text-zinc-500">
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((quote) => (
                  <tr
                    key={quote.id}
                    className="border-b border-(--color-border) last:border-0 hover:bg-white/2"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-white">{quote.cliente.nombre}</div>
                      <div className="text-xs text-zinc-500">{quote.cliente.correo}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-zinc-100">
                      {formatMoney(quote.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <EstadoBadge estado={quote.estado} />
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400">{formatDate(quote.fechaCreacion)}</td>
                    <td className="px-5 py-3.5">
                      <QuoteActions
                        quote={quote}
                        generating={generatingId === quote.id}
                        copied={copiedId === quote.id}
                        onGenerate={() => handleGenerateLink(quote.id)}
                        onCopy={() =>
                          quote.stripeCheckoutUrl && handleCopy(quote.id, quote.stripeCheckoutUrl)
                        }
                      />
                      {errorId === quote.id && (
                        <p className="mt-1 text-xs text-red-400">Error al generar el link.</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
