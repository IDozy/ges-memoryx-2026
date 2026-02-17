import type { EstadoPago, PagoItem, PagoMes } from "./types";

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function money(n: number) {
  return `S/. ${n.toFixed(2)}`;
}

export function sumPagos(m: PagoMes) {
  return m.pagos.reduce((a, p) => a + p.amount, 0);
}

export function estadoMes(m: PagoMes): EstadoPago {
  if (m.noRegistrado) return "NO_REGISTRADO";
  const sum = sumPagos(m);
  if (sum <= 0) return "NO_PAGO";
  if (sum >= m.total) return "PAGADO";
  return "PENDIENTE";
}

export function buildMes(total: number, pagos: PagoItem[] = [], noRegistrado = false): PagoMes {
  return { total, pagos, noRegistrado };
}

export function formatDateDMY(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const y = d.getFullYear();
  return `${day}/${m}/${y}`;
}
