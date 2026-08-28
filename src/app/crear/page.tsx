"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createPaymentLink, createQuote } from "../actions";
import { AppHeader } from "@/components/app-header";
import {
  ArrowLeftIcon,
  CheckIcon,
  DownloadIcon,
  ExternalLinkIcon,
  PlusIcon,
  SpinnerIcon,
  TrashIcon,
} from "@/components/icons";
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
    const result = await createQuote({ nombre, correo, empresa, items, impuestoPorcentaje, notas });
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

  if (status.kind === "ok") {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10">
            <CheckIcon className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-white">Cotización guardada</h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Ya está lista para descargar o enviar el link de pago.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3">
            <a href={`/api/quotes/${status.id}/pdf`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost w-full">
              <DownloadIcon className="h-4 w-4" />
              Descargar PDF
            </a>

            {paymentLink ? (
              <div className="flex flex-col gap-2">
                <div className="input-field truncate text-left font-mono text-xs text-zinc-400">
                  {paymentLink}
                </div>
                <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">
                  <ExternalLinkIcon className="h-4 w-4" />
                  Abrir link de pago
                </a>
              </div>
            ) : (
              <button type="button" onClick={handleGeneratePaymentLink} disabled={generatingLink} className="btn btn-primary w-full">
                {generatingLink && <SpinnerIcon className="h-4 w-4" />}
                {generatingLink ? "Generando…" : "Generar link de pago"}
              </button>
            )}
            {linkError && <p className="text-sm text-red-400">{linkError}</p>}
          </div>

          <div className="mt-8 flex w-full flex-col gap-2 border-t border-(--color-border) pt-6 sm:flex-row">
            <Link href="/panel" className="btn btn-ghost flex-1">
              Ir al panel
            </Link>
            <button
              type="button"
              onClick={() => setStatus({ kind: "idle" })}
              className="btn btn-ghost flex-1"
            >
              <PlusIcon className="h-4 w-4" />
              Crear otra
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader>
        <Link href="/panel" className="btn btn-ghost btn-sm">
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Panel</span>
        </Link>
      </AppHeader>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Nueva cotización
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            <section className="card flex flex-col gap-4 p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-zinc-300">Cliente</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cliente-nombre" className="field-label">
                    Nombre
                  </label>
                  <input
                    id="cliente-nombre"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="input-field"
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div>
                  <label htmlFor="cliente-correo" className="field-label">
                    Correo
                  </label>
                  <input
                    id="cliente-correo"
                    required
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="input-field"
                    placeholder="cliente@empresa.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="cliente-empresa" className="field-label">
                    Empresa (opcional)
                  </label>
                  <input
                    id="cliente-empresa"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    className="input-field"
                    placeholder="Nombre de la empresa"
                  />
                </div>
              </div>
            </section>

            <section className="card flex flex-col gap-4 p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-zinc-300">Ítems</h2>
              <div className="flex flex-col gap-3">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 gap-2 rounded-xl border border-(--color-border) p-3 sm:grid-cols-[1fr_72px_100px_36px] sm:items-center sm:gap-3 sm:border-0 sm:p-0"
                  >
                    <input
                      required
                      placeholder="Descripción"
                      value={item.descripcion}
                      onChange={(e) => updateItem(i, { descripcion: e.target.value })}
                      className="input-field"
                    />
                    <div className="grid grid-cols-2 gap-2 sm:contents">
                      <input
                        required
                        type="number"
                        min={0}
                        step="1"
                        placeholder="Cant."
                        value={item.cantidad}
                        onChange={(e) => updateItem(i, { cantidad: Number(e.target.value) })}
                        className="input-field"
                      />
                      <input
                        required
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Precio"
                        value={item.precioUnitario}
                        onChange={(e) => updateItem(i, { precioUnitario: Number(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      disabled={items.length === 1}
                      aria-label="Eliminar ítem"
                      className="btn-icon justify-self-end sm:justify-self-auto"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-(--color-border-strong) py-2.5 text-sm text-zinc-400 transition-colors hover:border-cyan-400/60 hover:text-cyan-300"
              >
                <PlusIcon className="h-4 w-4" />
                Agregar ítem
              </button>
            </section>

            <section className="card flex flex-col gap-4 p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-zinc-300">Condiciones / Notas</h2>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                placeholder="Válido por 15 días, 50% de anticipo, etc."
                className="input-field resize-none"
              />
            </section>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <section className="card flex flex-col gap-4 p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-zinc-300">Resumen</h2>

              <div>
                <label htmlFor="impuesto-porcentaje" className="field-label">
                  Impuesto (%)
                </label>
                <input
                  id="impuesto-porcentaje"
                  type="number"
                  min={0}
                  step="0.01"
                  value={impuestoPorcentaje}
                  onChange={(e) => setImpuestoPorcentaje(Number(e.target.value))}
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-2 border-t border-(--color-border) pt-4 font-mono text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Impuestos</span>
                  <span>{formatMoney(impuestos)}</span>
                </div>
                <div className="flex justify-between border-t border-(--color-border) pt-2 text-base font-semibold text-white">
                  <span>Total</span>
                  <span className="text-cyan-300">{formatMoney(total)}</span>
                </div>
              </div>

              <button type="submit" disabled={status.kind === "saving"} className="btn btn-primary w-full">
                {status.kind === "saving" && <SpinnerIcon className="h-4 w-4" />}
                {status.kind === "saving" ? "Guardando…" : "Guardar cotización"}
              </button>

              {status.kind === "error" && <p className="text-sm text-red-400">{status.message}</p>}
            </section>
          </div>
        </form>
      </main>
    </div>
  );
}
