"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createPaymentLink, createQuote } from "../actions";
import { LogoutButton } from "@/components/logout-button";
import type { QuoteItem } from "@/lib/types";

const emptyItem: QuoteItem = { descripcion: "", cantidad: 1, precioUnitario: 0 };

function formatMoney(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "USD" });
}

export default function CrearCotizacionPage() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [items, setItems] = useState<QuoteItem[]>([{ ...emptyItem }]);
  const [impuestoPorcentaje, setImpuestoPorcentaje] = useState(0);
  const [notas, setNotas] = useState("");
  const [status, setStatus] = useState<
    { kind: "idle" } | { kind: "saving" } | { kind: "ok"; id: string } | { kind: "error"; message: string }
  >({ kind: "idle" });
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const { subtotal, impuestos, total } = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.cantidad * i.precioUnitario, 0);
    const impuestos = subtotal * (impuestoPorcentaje / 100);
    return { subtotal, impuestos, total: subtotal + impuestos };
  }, [items, impuestoPorcentaje]);

  function updateItem(index: number, patch: Partial<QuoteItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "saving" });
    setPaymentLink(null);
    setLinkError(null);
    const result = await createQuote({
      nombre,
      correo,
      empresa,
      items,
      impuestoPorcentaje,
      notas,
    });
    if (result.ok && result.id) {
      setStatus({ kind: "ok", id: result.id });
      setNombre("");
      setCorreo("");
      setEmpresa("");
      setItems([{ ...emptyItem }]);
      setImpuestoPorcentaje(0);
      setNotas("");
    } else {
      setStatus({ kind: "error", message: result.error ?? "Error desconocido." });
    }
  }

  async function handleGeneratePaymentLink() {
    if (status.kind !== "ok") return;
    setGeneratingLink(true);
    setLinkError(null);
    const result = await createPaymentLink(status.id, window.location.origin);
    setGeneratingLink(false);
    if (result.ok && result.url) {
      setPaymentLink(result.url);
    } else {
      setLinkError(result.error ?? "Error desconocido.");
    }
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans">
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            <span className="text-cyan-400 font-mono">Quotia</span> — Nueva cotización
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/panel" className="font-mono text-sm text-cyan-400 hover:underline">
              Volver al panel
            </Link>
            <LogoutButton />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="text-sm uppercase tracking-wide text-zinc-400">Cliente</h2>
            <input
              required
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-cyan-400"
            />
            <input
              required
              type="email"
              placeholder="Correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-cyan-400"
            />
            <input
              placeholder="Empresa (opcional)"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-cyan-400"
            />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm uppercase tracking-wide text-zinc-400">Ítems</h2>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  required
                  placeholder="Descripción"
                  value={item.descripcion}
                  onChange={(e) => updateItem(i, { descripcion: e.target.value })}
                  className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-cyan-400"
                />
                <input
                  required
                  type="number"
                  min={0}
                  step="1"
                  placeholder="Cant."
                  value={item.cantidad}
                  onChange={(e) => updateItem(i, { cantidad: Number(e.target.value) })}
                  className="w-20 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-cyan-400"
                />
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Precio"
                  value={item.precioUnitario}
                  onChange={(e) => updateItem(i, { precioUnitario: Number(e.target.value) })}
                  className="w-28 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                  className="px-2 text-zinc-500 hover:text-red-400 disabled:opacity-30"
                  aria-label="Eliminar ítem"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="self-start text-sm text-cyan-400 hover:underline font-mono"
            >
              + agregar ítem
            </button>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm uppercase tracking-wide text-zinc-400">Condiciones / Notas</h2>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-cyan-400"
            />
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              Impuesto (%)
              <input
                type="number"
                min={0}
                step="0.01"
                value={impuestoPorcentaje}
                onChange={(e) => setImpuestoPorcentaje(Number(e.target.value))}
                className="w-24 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-cyan-400"
              />
            </label>
          </section>

          <section className="flex flex-col gap-1 border-t border-zinc-800 pt-4 font-mono text-sm">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Impuestos</span>
              <span>{formatMoney(impuestos)}</span>
            </div>
            <div className="flex justify-between text-lg text-cyan-400 font-semibold">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
          </section>

          <button
            type="submit"
            disabled={status.kind === "saving"}
            className="rounded bg-cyan-500 px-4 py-2 font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
          >
            {status.kind === "saving" ? "Guardando…" : "Guardar cotización"}
          </button>

          {status.kind === "ok" && (
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-3">
                <p className="text-green-400">Cotización guardada (id: {status.id}).</p>
                <a
                  href={`/api/quotes/${status.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-cyan-400 px-3 py-1 font-mono text-cyan-400 hover:bg-cyan-400 hover:text-black"
                >
                  Descargar PDF
                </a>
                {!paymentLink && (
                  <button
                    type="button"
                    onClick={handleGeneratePaymentLink}
                    disabled={generatingLink}
                    className="rounded border border-cyan-400 px-3 py-1 font-mono text-cyan-400 hover:bg-cyan-400 hover:text-black disabled:opacity-50"
                  >
                    {generatingLink ? "Generando…" : "Generar link de pago"}
                  </button>
                )}
                <Link href="/panel" className="font-mono text-cyan-400 hover:underline">
                  Ir al panel →
                </Link>
              </div>
              {paymentLink && (
                <div className="flex items-center gap-3">
                  <input
                    readOnly
                    value={paymentLink}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-300"
                  />
                  <a
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap rounded bg-cyan-500 px-3 py-1.5 font-semibold text-black hover:bg-cyan-400"
                  >
                    Abrir link de pago
                  </a>
                </div>
              )}
              {linkError && <p className="text-red-400">{linkError}</p>}
            </div>
          )}
          {status.kind === "error" && (
            <p className="text-sm text-red-400">{status.message}</p>
          )}
        </form>
      </main>
    </div>
  );
}
