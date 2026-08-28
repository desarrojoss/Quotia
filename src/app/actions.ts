"use server";

import { requireSession } from "@/lib/auth-server";
import { db } from "@/lib/firebase-admin";
import { getQuoteById } from "@/lib/quotes";
import { getStripe } from "@/lib/stripe";
import type { Quote, QuoteItem } from "@/lib/types";

export interface CreateQuoteInput {
  nombre: string;
  correo: string;
  empresa?: string;
  items: QuoteItem[];
  impuestoPorcentaje: number;
  notas?: string;
}

export interface CreateQuoteResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function createQuote(
  input: CreateQuoteInput
): Promise<CreateQuoteResult> {
  await requireSession();

  const items = input.items.filter((i) => i.descripcion.trim() !== "");

  if (!input.nombre.trim() || !input.correo.trim() || items.length === 0) {
    return { ok: false, error: "Faltan datos requeridos." };
  }

  const subtotal = items.reduce(
    (sum, i) => sum + i.cantidad * i.precioUnitario,
    0
  );
  const impuestos = subtotal * (input.impuestoPorcentaje / 100);
  const total = subtotal + impuestos;

  const quote: Omit<Quote, "id"> = {
    cliente: {
      nombre: input.nombre.trim(),
      correo: input.correo.trim(),
      ...(input.empresa?.trim() ? { empresa: input.empresa.trim() } : {}),
    },
    items,
    impuestoPorcentaje: input.impuestoPorcentaje,
    subtotal,
    impuestos,
    total,
    ...(input.notas?.trim() ? { notas: input.notas.trim() } : {}),
    estado: "borrador",
    fechaCreacion: new Date().toISOString(),
  };

  try {
    const ref = await db.collection("quotes").add(quote);
    return { ok: true, id: ref.id };
  } catch (err) {
    console.error("createQuote failed", err);
    return { ok: false, error: "No se pudo guardar la cotización." };
  }
}

export interface CreatePaymentLinkResult {
  ok: boolean;
  url?: string;
  error?: string;
}

export async function createPaymentLink(
  quoteId: string,
  origin: string
): Promise<CreatePaymentLinkResult> {
  await requireSession();

  const quote = await getQuoteById(quoteId);
  if (!quote) {
    return { ok: false, error: "Cotización no encontrada." };
  }
  if (quote.stripeCheckoutUrl) {
    return { ok: true, url: quote.stripeCheckoutUrl };
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(quote.total * 100),
            product_data: {
              name: `Cotización #${quote.id}`,
              description: `${quote.cliente.nombre} — ${quote.items.length} ítem(s)`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: quote.cliente.correo,
      metadata: { quoteId: quote.id },
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=cancelled`,
    });

    if (!session.url) {
      return { ok: false, error: "Stripe no devolvió una URL de pago." };
    }

    await db.collection("quotes").doc(quote.id).update({
      stripeCheckoutUrl: session.url,
      estado: "enviada",
    });

    return { ok: true, url: session.url };
  } catch (err) {
    console.error("createPaymentLink failed", err);
    return { ok: false, error: "No se pudo generar el link de pago." };
  }
}
