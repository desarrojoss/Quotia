import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Quote } from "@/lib/types";

// Sin perfil de negocio / auth todavía (llega en el fin de semana 4).
// Reemplazar por los datos reales del negocio cuando exista ese modelo.
const BUSINESS_PLACEHOLDER = {
  nombre: "Tu Negocio",
  correo: "contacto@tunegocio.com",
};

function formatMoney(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "USD" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: "#1f2937",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  businessName: { fontSize: 16, fontWeight: 700, color: "#111827" },
  muted: { color: "#6b7280" },
  title: { fontSize: 20, fontWeight: 700, color: "#111827" },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    color: "#6b7280",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  table: { borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 6,
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 6,
    backgroundColor: "#f9fafb",
    fontWeight: 700,
  },
  colDescripcion: { flex: 4 },
  colCantidad: { flex: 1, textAlign: "right" },
  colPrecio: { flex: 1.5, textAlign: "right" },
  colSubtotal: { flex: 1.5, textAlign: "right" },
  totals: { alignSelf: "flex-end", width: 220, marginTop: 12 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalsRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#111827",
  },
  totalLabelFinal: { fontSize: 12, fontWeight: 700 },
  totalValueFinal: { fontSize: 12, fontWeight: 700 },
  notes: {
    marginTop: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    fontSize: 8,
    color: "#6b7280",
  },
});

export function QuotePdf({ quote }: { quote: Quote }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.businessName}>{BUSINESS_PLACEHOLDER.nombre}</Text>
            <Text style={styles.muted}>{BUSINESS_PLACEHOLDER.correo}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.title}>Cotización</Text>
            <Text style={styles.muted}>{formatDate(quote.fechaCreacion)}</Text>
            <Text style={styles.muted}>#{quote.id}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Cliente</Text>
          <Text>{quote.cliente.nombre}</Text>
          <Text style={styles.muted}>{quote.cliente.correo}</Text>
          {quote.cliente.empresa && (
            <Text style={styles.muted}>{quote.cliente.empresa}</Text>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.colDescripcion}>Descripción</Text>
            <Text style={styles.colCantidad}>Cant.</Text>
            <Text style={styles.colPrecio}>Precio unit.</Text>
            <Text style={styles.colSubtotal}>Subtotal</Text>
          </View>
          {quote.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colDescripcion}>{item.descripcion}</Text>
              <Text style={styles.colCantidad}>{item.cantidad}</Text>
              <Text style={styles.colPrecio}>{formatMoney(item.precioUnitario)}</Text>
              <Text style={styles.colSubtotal}>
                {formatMoney(item.cantidad * item.precioUnitario)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text style={styles.muted}>Subtotal</Text>
            <Text>{formatMoney(quote.subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.muted}>
              Impuestos ({quote.impuestoPorcentaje}%)
            </Text>
            <Text>{formatMoney(quote.impuestos)}</Text>
          </View>
          <View style={styles.totalsRowFinal}>
            <Text style={styles.totalLabelFinal}>Total</Text>
            <Text style={styles.totalValueFinal}>{formatMoney(quote.total)}</Text>
          </View>
        </View>

        {quote.notas && (
          <View style={styles.notes}>
            <Text style={styles.sectionLabel}>Condiciones / Notas</Text>
            <Text>{quote.notas}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
