export type QuoteStatus = "borrador" | "enviada" | "pagada";

export interface QuoteItem {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export interface QuoteClient {
  nombre: string;
  correo: string;
  empresa?: string;
}

export interface Quote {
  id: string;
  cliente: QuoteClient;
  items: QuoteItem[];
  impuestoPorcentaje: number;
  subtotal: number;
  impuestos: number;
  total: number;
  notas?: string;
  estado: QuoteStatus;
  fechaCreacion: string;
  stripeCheckoutUrl?: string;
}
