// src/components/pdf/ReciboPagoPdf.tsx

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font
} from "@react-pdf/renderer";

Font.registerHyphenationCallback(word => [word]);

type PagoItem = { date: string; amount: number };

type Props = {
  logoUrl?: string; // ej: `${window.location.origin}/logo-memoryx.png`
  fecha: string; // "1/13/2026"
  reciboNro: string; // "1301-1000"
  tutor: string;
  estudiante: string;

  pagoA: string; // "MemoryX"
  jr: string; // "Jr. Mariscal Cáceres N°413"
  cel: string; // "945 379 813"

  servicio: string; // "Mensualidad"
  mes: string; // "Marzo"
  precio: number; // 200

  pagos: PagoItem[]; // parciales
  nota?: string;
};

const PURPLE = "#29008e";
const PURPLE_2 = "#650354";

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingHorizontal: 36,
    paddingBottom: 28,
    fontSize: 11,
    color: "#111",
    fontFamily: "Helvetica",
  },
  logoWrap: { alignItems: "center", marginBottom: 10 },
  logo: { width: 120, height: "auto", marginBottom: 10 },

  line: {
    height: 1,
    backgroundColor: "#111",
    marginVertical: 10,
  },

  row: { flexDirection: "row", justifyContent: "space-between" },
  col: { flexDirection: "column", gap: 4 },

  label: { fontSize: 11, color: "#111" },
  value: { fontSize: 11, color: "#111" },
  muted: { color: "#333" },

  boxRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  boxCol: { flex: 1 },

  table: { marginTop: 10 },
  thRow: {
    flexDirection: "row",
    backgroundColor: PURPLE,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  th: { color: "#fff", fontSize: 10, fontWeight: "bold"},
  tdRow: {
    flexDirection: "row",
    backgroundColor: "#f3f3f3",
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  td: { fontSize: 10, color: "#111" },

  wServicio: { width: "22%" },
  wDesc: { width: "38%" },
  wPrecio: { width: "20%", textAlign: "right" },
  wImporte: { width: "20%", textAlign: "right" },

  sectionTitle: { marginTop: 16, fontSize: 11, fontWeight: "bold"},

  miniTableWrap: { alignItems: "center", marginTop: 8 },
  miniTable: { width: 220 },
  miniThRow: { flexDirection: "row", backgroundColor: PURPLE_2, padding: 6 },
  miniTdRow: { flexDirection: "row", backgroundColor: "#f5f5f5", padding: 6 },
  miniTh: { color: "#fff", fontSize: 10, fontWeight: "bold"},
  miniTd: { fontSize: 10 },
  miniWFecha: { width: "60%" },
  miniWMonto: { width: "40%", textAlign: "right" },

  note: { marginTop: 18, fontSize: 7, color: "#222" },
});

function money(n: number) {
  const isInt = Number.isInteger(n);
  return `S/. ${isInt ? n : n.toFixed(2)}`;
}

export default function ReciboPagoPdf(props: Props) {
  const totalPagado = props.pagos.reduce((a, p) => a + p.amount, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* LOGO */}
        <View style={styles.logoWrap}>
          {props.logoUrl ? <Image src={props.logoUrl} style={styles.logo} /> : null}
        </View>

        <View style={styles.line} />

        {/* FECHA / RECIBO */}
        <View style={styles.row}>
          <Text style={styles.label}>Fecha: {props.fecha}</Text>
          <Text style={styles.label}>Recibo N°: {props.reciboNro}</Text>
        </View>

        <View style={styles.line} />

        {/* DATOS */}
        <View style={styles.boxRow}>
          <View style={styles.boxCol}>
            <Text style={styles.label}>
              Tutor(a): <Text style={styles.value}>{props.tutor}</Text>
            </Text>
            <Text style={styles.label}>
              Cuota de: <Text style={styles.value}>{props.estudiante}</Text>
            </Text>
          </View>

          <View style={styles.boxCol}>
            <Text style={styles.label}>
              Pago a: <Text style={styles.value}>{props.pagoA}</Text>
            </Text>
            <Text style={styles.label}>
              Jr: <Text style={styles.value}>{props.jr}</Text>
            </Text>
            <Text style={styles.label}>
              Cel: <Text style={styles.value}>{props.cel}</Text>
            </Text>
          </View>
        </View>

        {/* TABLA SERVICIO */}
        <View style={styles.table}>
          <View style={styles.thRow}>
            <Text style={[styles.th, styles.wServicio]}>Servicio</Text>
            <Text style={[styles.th, styles.wDesc]}>Descripción</Text>
            <Text style={[styles.th, styles.wPrecio]}>Precio</Text>
            <Text style={[styles.th, styles.wImporte]}>Importe</Text>
          </View>

          <View style={styles.tdRow}>
            <Text style={[styles.td, styles.wServicio]}>{props.servicio}</Text>
            <Text style={[styles.td, styles.wDesc]}>Mes: {props.mes}</Text>
            <Text style={[styles.td, styles.wPrecio]}>{money(props.precio)}</Text>
            <Text style={[styles.td, styles.wImporte]}>{money(props.precio)}</Text>
          </View>
        </View>

        {/* TOTALIDAD */}
        <Text style={styles.sectionTitle}>Totalidad de pagos realizados</Text>

        <View style={styles.miniTableWrap}>
          <View style={styles.miniTable}>
            <View style={styles.miniThRow}>
              <Text style={[styles.miniTh, styles.miniWFecha]}>Fecha</Text>
              <Text style={[styles.miniTh, styles.miniWMonto]}>Monto</Text>
            </View>

            {props.pagos.map((p, i) => (
              <View key={`${p.date}-${i}`} style={styles.miniTdRow}>
                <Text style={[styles.miniTd, styles.miniWFecha]}>{p.date}</Text>
                <Text style={[styles.miniTd, styles.miniWMonto]}>{money(p.amount)}</Text>
              </View>
            ))}

            {/* total pagado */}
            <View style={styles.miniTdRow}>
              <Text style={[styles.miniTd, styles.miniWFecha]} />
              <Text style={[styles.miniTd, styles.miniWMonto]}>{money(totalPagado)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.note}>
          {props.nota ??
            "NOTA: Este recibo es un documento interno generado para fines administrativos y no tiene validez ante la SUNAT como boleta de venta. No constituye un comprobante fiscal."}
        </Text>
      </Page>
    </Document>
  );
}
