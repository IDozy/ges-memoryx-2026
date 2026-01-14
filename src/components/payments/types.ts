export type EstadoPago = "NO_PAGO" | "PENDIENTE" | "PAGADO" | "NO_REGISTRADO";

export type PagoItem = {
  date: string; // YYYY-MM-DD
  amount: number;
};

export type PagoMes = {
  total: number; // total esperado del mes
  pagos: PagoItem[]; // abonos realizados
  noRegistrado?: boolean; // si no aplica/estaba desactivado
};

export type Estudiante = {
  id: string;
  nombreCompleto: string;
  tutor: string;
  pagosPorMes: Record<number, PagoMes>; // 0..11
};

export type AbonarTarget = {
  studentId: string;
  studentName: string;
  mesIndex: number;
  mesName: string;
  total: number;
  sumActual: number;
};

export type RegistrarTarget = {
  studentId: string;
  studentName: string;
  mesIndex: number;
  mesName: string;
  defaultTotal: number;
};
