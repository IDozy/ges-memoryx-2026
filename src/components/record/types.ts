export type RegistroRow = {
  id: string;

  fecha: string; // "2026-01-05" (o dd/mm/aa si prefieres)
  apellidosNombres: string;

  grado: string;
  fNac: string;

  talleres: string[]; // ["Matemática","Caligrafía"]
  tutor: string;
  telefono: string;
  domicilio: string;

  cuota: number; // 80, 100, etc.
  pagoEstado: "PAGADO" | "PENDIENTE" | "NO_PAGO" | "NO_REGISTRADO";

  observacion?: string;
};
