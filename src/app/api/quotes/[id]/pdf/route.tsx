import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { getQuoteById } from "@/lib/quotes";
import { QuotePdf } from "@/lib/quote-pdf";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const quote = await getQuoteById(id);

  if (!quote) {
    return NextResponse.json({ error: "Cotización no encontrada." }, { status: 404 });
  }

  const buffer = await renderToBuffer(<QuotePdf quote={quote} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="cotizacion-${quote.id}.pdf"`,
    },
  });
}
