"use client";

import ReciboPagoPdf from "@/src/components/pdf/PaymentReceiptPdf";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";



type EstadoPago = "NO_PAGO" | "PENDIENTE" | "PAGADO" | "NO_REGISTRADO";

type PagoItem = {
  date: string; // YYYY-MM-DD
  amount: number;
};

type PagoMes = {
  total: number; // total esperado del mes
  pagos: PagoItem[]; // abonos realizados
  noRegistrado?: boolean; // si no aplica/estaba desactivado
};

type Estudiante = {
  id: string;
  nombreCompleto: string;
  tutor: string;
  pagosPorMes: Record<number, PagoMes>; // 0..11
};

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function money(n: number) {
  return `S/. ${n.toFixed(2)}`;
}

function sumPagos(m: PagoMes) {
  return m.pagos.reduce((a, p) => a + p.amount, 0);
}

function estadoMes(m: PagoMes): EstadoPago {
  if (m.noRegistrado) return "NO_REGISTRADO";
  const sum = sumPagos(m);
  if (sum <= 0) return "NO_PAGO";
  if (sum >= m.total) return "PAGADO";
  return "PENDIENTE";
}

function buildMes(total: number, pagos: PagoItem[] = [], noRegistrado = false): PagoMes {
  return { total, pagos, noRegistrado };
}

// Demo
const demoData: Estudiante[] = [
  {
    id: uid(),
    nombreCompleto: "Zaid Bolaños Lopez",
    tutor: "Maria",
    pagosPorMes: {
      3: buildMes(80, [{ date: "2025-04-23", amount: 80 }]),
      4: buildMes(80, [{ date: "2025-05-09", amount: 80 }]),
      5: buildMes(80, [{ date: "2025-06-02", amount: 80 }]),
    },
  },
  {
    id: uid(),
    nombreCompleto: "Briana Eugenio Ramos",
    tutor: "Alex",
    pagosPorMes: {
      3: buildMes(80, [{ date: "2025-04-08", amount: 50 }]), // pendiente
      4: buildMes(80, [], true), // no registrado -> ahora se puede registrar
      5: buildMes(80, [], true),
    },
  },
  {
    id: uid(),
    nombreCompleto: "Briana Eugenio Ramos",
    tutor: "Alex",
    pagosPorMes: {
      3: buildMes(80, [{ date: "2025-04-08", amount: 50 }]), // pendiente
      4: buildMes(80, [], true), // no registrado -> ahora se puede registrar
      5: buildMes(80, [], true),
    },
  },
  {
    id: uid(),
    nombreCompleto: "Briana Eugenio Ramos",
    tutor: "Alex",
    pagosPorMes: {
      3: buildMes(80, [{ date: "2025-04-08", amount: 50 }]), // pendiente
      4: buildMes(80, [], true), // no registrado -> ahora se puede registrar
      5: buildMes(80, [], true),
    },
  },
  {
    id: uid(),
    nombreCompleto: "Briana Eugenio Ramos",
    tutor: "Alex",
    pagosPorMes: {
      3: buildMes(80, [{ date: "2025-04-08", amount: 50 }]), // pendiente
      4: buildMes(80, [], true), // no registrado -> ahora se puede registrar
      5: buildMes(80, [], true),
    },
  },
];

type AbonarTarget = {
  studentId: string;
  studentName: string;
  mesIndex: number;
  mesName: string;
  total: number;
  sumActual: number;
};

type RegistrarTarget = {
  studentId: string;
  studentName: string;
  mesIndex: number;
  mesName: string;
  defaultTotal: number;
};

export default function PagosPage() {
  const [cycle, setCycle] = useState("regular 2025");
  const [q, setQ] = useState("");
  const [data, setData] = useState<Estudiante[]>(demoData);
  const [openBoleta, setOpenBoleta] = useState(false);
  const [boletaTarget, setBoletaTarget] = useState<{
    tutor: string;
    estudiante: string;
    mes: string;
    total: number;
    pagos: PagoItem[];
  } | null>(null);


  // Modal ABONAR
  const [openAbonar, setOpenAbonar] = useState(false);
  const [abonarTarget, setAbonarTarget] = useState<AbonarTarget | null>(null);

  // Modal REGISTRAR
  const [openRegistrar, setOpenRegistrar] = useState(false);
  const [registrarTarget, setRegistrarTarget] = useState<RegistrarTarget | null>(null);

  const students = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return data;
    return data.filter((s) => s.nombreCompleto.toLowerCase().includes(qq));
  }, [q, data]);

  function openAbonarModal(student: Estudiante, mesIndex: number) {
    const mesName = MESES[mesIndex];
    const mes = student.pagosPorMes[mesIndex] ?? buildMes(80, [], true);

    // Si está no registrado, en opción 2: abrimos REGISTRAR
    if (mes.noRegistrado) {
      openRegistrarModal(student, mesIndex);
      return;
    }

    const sumActual = sumPagos(mes);

    setAbonarTarget({
      studentId: student.id,
      studentName: student.nombreCompleto,
      mesIndex,
      mesName,
      total: mes.total,
      sumActual,
    });
    setOpenAbonar(true);
  }

  function openRegistrarModal(student: Estudiante, mesIndex: number) {
    setRegistrarTarget({
      studentId: student.id,
      studentName: student.nombreCompleto,
      mesIndex,
      mesName: MESES[mesIndex],
      defaultTotal: 80,
    });
    setOpenRegistrar(true);
  }

  function registrarMes(total: number) {
    if (!registrarTarget) return;

    setData((prev) =>
      prev.map((s) => {
        if (s.id !== registrarTarget.studentId) return s;

        const current = s.pagosPorMes[registrarTarget.mesIndex];
        const merged: PagoMes = {
          total,
          pagos: current?.pagos ?? [],
          noRegistrado: false,
        };

        return {
          ...s,
          pagosPorMes: {
            ...s.pagosPorMes,
            [registrarTarget.mesIndex]: merged,
          },
        };
      })
    );

    toast.success("Mes registrado", {
      description: `${registrarTarget.studentName} • ${registrarTarget.mesName} • Total ${money(total)}`,
    });

    // Cierra registrar
    const studentId = registrarTarget.studentId;
    const mesIndex = registrarTarget.mesIndex;
    setOpenRegistrar(false);
    setRegistrarTarget(null);

    // Abre abonar inmediatamente (opcional pero cómodo)
    const st = data.find((x) => x.id === studentId);
    if (st) {
      // ojo: data aún no se actualizó en este tick, pero es ok porque solo armamos target básico
      setAbonarTarget({
        studentId,
        studentName: st.nombreCompleto,
        mesIndex,
        mesName: MESES[mesIndex],
        total,
        sumActual: 0,
      });
      setOpenAbonar(true);
    }
  }

  function registrarAbono(amount: number, date: string) {
    if (!abonarTarget) return;

    setData((prev) =>
      prev.map((s) => {
        if (s.id !== abonarTarget.studentId) return s;

        const current = s.pagosPorMes[abonarTarget.mesIndex] ?? buildMes(abonarTarget.total, [], false);
        const newPagos = [...current.pagos, { amount, date }];

        return {
          ...s,
          pagosPorMes: {
            ...s.pagosPorMes,
            [abonarTarget.mesIndex]: {
              ...current,
              total: abonarTarget.total,
              pagos: newPagos,
              noRegistrado: false,
            },
          },
        };
      })
    );

    const nuevoAcum = abonarTarget.sumActual + amount;
    toast.success("Abono registrado", {
      description: `${abonarTarget.studentName} • ${abonarTarget.mesName} • ${money(nuevoAcum)} / ${money(abonarTarget.total)}`,
    });

    setOpenAbonar(false);
    setAbonarTarget(null);
  }

  function generarBoleta(student: Estudiante, mesIndex: number) {
    const mesName = MESES[mesIndex];
    const mes = student.pagosPorMes[mesIndex];

    console.log("CLICK BOLETA", student.nombreCompleto, mesName, mes); // ✅ debug

    if (!mes) {
      toast.error("No hay datos del mes");
      return;
    }

    setBoletaTarget({
      tutor: student.tutor || "—",
      estudiante: student.nombreCompleto,
      mes: mesName,
      total: mes.total,
      pagos: mes.pagos,
    });

    setOpenBoleta(true);
  }






  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lista de Pagos</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium opacity-80">Ciclo</label>
          <select
            value={cycle}
            onChange={(e) => setCycle(e.target.value)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
          >
            <option>regular 2025</option>
            <option>verano 2025</option>
            <option>regular 2026</option>
          </select>
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar estudiante..."
          className="w-full sm:max-w-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
        />

        <div className="text-sm opacity-70 sm:ml-auto">
          {students.length} estudiante(s)
        </div>
      </div>

      {/* Matrix */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="h-full overflow-auto">
          <div className="relative h-[calc(100dvh-259px)] overflow-x-auto overflow-y-auto">
            <table className="min-w-[1200px] w-full border-separate border-spacing-0 text-sm">
              <thead className="sticky top-0 z-20 ">
                <tr >
                  <th className="sticky left-0 z-30 bg-[var(--color-muted)] px-4 py-3 text-left text-xs font-semibold border-b border-r border-[var(--color-border)]">
                    Estudiante
                  </th>
                  {MESES.map((m) => (
                    <th
                      key={m}
                      className="bg-[var(--color-muted)] px-4 py-3 text-center text-xs font-semibold border-b border-r border-[var(--color-border)]"
                    >
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="sticky left-0 z-10  bg-[var(--color-surface)]   px-4 py-4 border-b border-r border-[var(--color-border)] font-medium">
                      {s.nombreCompleto}
                    </td>

                    {MESES.map((_, idx) => {
                      const mes = s.pagosPorMes[idx] ?? buildMes(80, [], true);
                      const est = estadoMes(mes);
                      const sum = sumPagos(mes);
                      const pagosCount = mes.pagos.length;
                      const lastPago = mes.pagos[mes.pagos.length - 1];

                      return (
                        <td key={idx} className="px-3 py-3 border-b border-r border-[var(--color-border)] align-middle">
                          <PagoCell
                            estado={est}
                            total={mes.total}
                            sum={sum}
                            pagosCount={pagosCount}
                            lastPago={lastPago}
                            pagos={mes.pagos}
                            onAbonar={() => openAbonarModal(s, idx)}
                            onRegistrar={() => openRegistrarModal(s, idx)}
                            onBoleta={() => generarBoleta(s, idx)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modales */}
      <RegistrarMesModal
        open={openRegistrar}
        target={registrarTarget}
        onClose={() => {
          setOpenRegistrar(false);
          setRegistrarTarget(null);
        }}
        onSubmit={registrarMes}
      />

      <AbonarModal
        open={openAbonar}
        target={abonarTarget}
        onClose={() => {
          setOpenAbonar(false);
          setAbonarTarget(null);
        }}
        onSubmit={registrarAbono}
      />
      {
        openBoleta && boletaTarget && (
          <BoletaModal
            data={boletaTarget}
            onClose={() => {
              setOpenBoleta(false);
              setBoletaTarget(null);
            }}
          />
        )
      }
    </div>


  );


}

/* ---------- Cell UI ---------- */
function PagoCell({
  estado,
  total,
  sum,
  pagosCount,
  lastPago,
  onAbonar,
  onRegistrar,
  onBoleta,
  pagos, // ✅ NUEVO: pasamos lista completa
}: {
  estado: EstadoPago;
  total: number;
  sum: number;
  pagosCount: number;
  lastPago?: PagoItem;
  pagos?: PagoItem[]; // ✅ NUEVO
  onAbonar: () => void;
  onRegistrar: () => void;
  onBoleta: () => void;
}) {
  const badge =
    estado === "PAGADO"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : estado === "PENDIENTE"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
        : estado === "NO_REGISTRADO"
          ? "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300"
          : "bg-blue-500/15 text-blue-700 dark:text-blue-300";

  const label =
    estado === "PAGADO"
      ? "Pagado"
      : estado === "PENDIENTE"
        ? "Pendiente"
        : estado === "NO_REGISTRADO"
          ? "No registrado"
          : "Abonar";

  return (
    <div className="flex items-start justify-center gap-2">
      {/* Botón */}
      {estado === "PAGADO" ? (
        <button
          onClick={onBoleta}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[11px] font-semibold hover:bg-[var(--color-muted)]"
        >
          GENERAR BOLETA
        </button>
      ) : estado === "NO_REGISTRADO" ? (
        <button
          onClick={onRegistrar}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[11px] font-semibold hover:bg-[var(--color-muted)]"
        >
          REGISTRAR
        </button>
      ) : (
        <button
          onClick={onAbonar}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[11px] font-semibold hover:bg-[var(--color-muted)]"
        >
          ABONAR
        </button>
      )}

      {/* Estado + detalle */}
      <div className="min-w-[170px]">
        <div className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] ${badge}`}>
          {label}
        </div>

        {/* ✅ Pagos parciales listados como tu imagen */}
        {estado !== "NO_REGISTRADO" && pagosCount > 0 && (
          <div className="mt-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[11px]">
            <div className="space-y-0.5">
              {(pagos ?? []).slice(0, 5).map((p, i) => (
                <div key={`${p.date}-${i}`} className="tabular-nums opacity-90">
                  {i + 1}° {p.date} - {money(p.amount)}
                </div>
              ))}
              {(pagos ?? []).length > 5 && (
                <div className="opacity-60">+ {(pagos ?? []).length - 5} más</div>
              )}
            </div>

            {/* opcional: total acumulado */}
            <div className="mt-1 flex items-center justify-between border-t border-[var(--color-border)] pt-1 opacity-80">
              <span>Acum.</span>
              <span className="font-medium">
                {money(sum)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-[var(--color-border)] pt-1 opacity-80">
              <span>Deuda Total.</span>
              <span className="font-medium">
                {money(total)}
              </span>
            </div>
          </div>
        )}

        {/* ✅ Si no hay pagos */}
        {estado !== "NO_REGISTRADO" && pagosCount === 0 && (
          <div className="mt-1 text-[11px] opacity-60">
            Sin pagos • {money(0)} / {money(total)}
          </div>
        )}
      </div>
    </div>
  );
}


/* ---------- Registrar Mes Modal ---------- */

function RegistrarMesModal({
  open,
  target,
  onClose,
  onSubmit,
}: {
  open: boolean;
  target: RegistrarTarget | null;
  onClose: () => void;
  onSubmit: (total: number) => void;
}) {
  const [total, setTotal] = useState("");


  useMemo(() => {
    if (!open || !target) return;
    setTotal(String(target.defaultTotal));
  }, [open, target]);

  if (!open || !target) return null;

  function submit() {
    const v = Number(total);
    if (!Number.isFinite(v) || v <= 0) {
      toast.error("Total inválido", { description: "Ingresa un total mayor a 0." });
      return;
    }
    onSubmit(v);
  }



  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Cerrar" />
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl ">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
          <div>
            <div className="text-sm font-semibold">Registrar mes</div>
            <div className="text-xs opacity-70">
              {target.studentName} • {target.mesName}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs hover:bg-[var(--color-muted)]"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="text-sm opacity-80">
            Este mes estaba como <span className="font-medium">No registrado</span>.
            Regístralo para poder cobrar y permitir abonos.
          </div>

          <label className="space-y-1 block">
            <div className="text-xs font-medium opacity-80">Total a cobrar (mes)</div>
            <input
              inputMode="decimal"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
              placeholder="Ej: 80"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] p-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm hover:bg-[var(--color-muted)]"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-medium hover:opacity-80"
          >
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Abonar Modal ---------- */

function AbonarModal({
  open,
  target,
  onClose,
  onSubmit,
}: {
  open: boolean;
  target: AbonarTarget | null;
  onClose: () => void;
  onSubmit: (amount: number, date: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  useMemo(() => {
    if (!open || !target) return;
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
  }, [open, target]);

  if (!open || !target) return null;

  const remaining = Math.max(0, target.total - target.sumActual);

  function submit() {
    const v = Number(amount);
    if (!Number.isFinite(v) || v <= 0) {
      toast.error("Monto inválido", { description: "Ingresa un monto mayor a 0." });
      return;
    }
    if (v > remaining && remaining > 0) {
      toast.message("Monto supera el saldo", {
        description: `Saldo: ${money(remaining)}. Se registrará igual.`,
      });
    }
    onSubmit(v, date);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Cerrar" />
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
          <div>
            <div className="text-sm font-semibold">Abonar</div>
            <div className="text-xs opacity-70">
              {target.studentName} • {target.mesName}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs hover:bg-[var(--color-muted)]"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="opacity-80">Total del mes</span>
              <span className="font-medium">{money(target.total)}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="opacity-80">Pagado</span>
              <span className="font-medium">{money(target.sumActual)}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="opacity-80">Saldo</span>
              <span className="font-medium">{money(remaining)}</span>
            </div>
          </div>

          <label className="space-y-1 block">
            <div className="text-xs font-medium opacity-80">Fecha</div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1 block">
            <div className="text-xs font-medium opacity-80">Monto a abonar</div>
            <input
              inputMode="decimal"
              placeholder={`Ej: ${remaining > 0 ? remaining.toFixed(2) : "10.00"}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            />
            <div className="text-[11px] opacity-70">
              Puedes registrar pagos parciales. Se acumulan automáticamente.
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] p-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm hover:bg-[var(--color-muted)]"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-medium hover:opacity-80"
          >
            Registrar abono
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDateMDY(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const y = d.getFullYear();
  return `${day}/${m}/${y}`;
}

function BoletaModal({
  data,
  onClose,
}: {
  data: {
    tutor: string;
    estudiante: string;
    mes: string;
    total: number;
    pagos: PagoItem[];
  };
  onClose: () => void;
}) {
  const totalPagado = data.pagos.reduce((a, p) => a + p.amount, 0);



  async function download() {
    try {
      const logoUrl = `${window.location.origin}/logo-memoryx.png`; // ✅ pon tu logo en /public/logo-memoryx.png

      const doc = (
        <ReciboPagoPdf
          logoUrl={logoUrl}
          fecha={data.pagos?.[0]?.date ? formatDateMDY(data.pagos[0].date) : formatDateMDY(new Date().toISOString().slice(0, 10))}
          reciboNro={"1301-1000"}
          tutor={data.tutor}
          estudiante={data.estudiante}
          pagoA={"MemoryX"}
          jr={"Jr. Mariscal Cáceres N°413"}
          cel={"945 379 813"}
          servicio={"Mensualidad"}
          mes={data.mes}
          precio={Number(data.total)}
          pagos={data.pagos.map(p => ({ date: formatDateMDY(p.date), amount: p.amount }))}
        />
      );

      console.log("DOC", doc);
      toast.message("Generando PDF...");


      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Recibo-${data.estudiante}-${data.mes}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
      toast.success("PDF descargado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo generar el PDF");
    }
  }





  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
      style={{ isolation: "isolate" }} // ✅ evita stacking context raro
    >
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div className="relative w-full max-w-2xl rounded-xl border border-zinc-300 bg-white text-zinc-900 shadow-2xl">
        <div className="p-6">
          <div className="text-lg font-semibold">Boleta de Pago</div>

          <div className="mt-4 space-y-2 text-sm">
            <div>
              <span className="font-medium">Tutor(a): </span>
              {data.tutor}
            </div>
            <div>
              <span className="font-medium">Estudiante: </span>
              {data.estudiante}
            </div>
            <div>
              <span className="font-medium">Mes: </span>
              {data.mes}
            </div>
            <div className="pt-2">
              <span className="font-medium">Monto Total: </span>
              S/. {data.total}
            </div>
          </div>

          <div className="mt-6 text-sm font-medium">Pagos Parciales:</div>

          <div className="mt-3 max-h-[260px] overflow-auto rounded-lg border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Fecha</th>
                  <th className="px-4 py-2 text-right font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {data.pagos.map((p, i) => (
                  <tr key={`${p.date}-${i}`} className="border-t border-zinc-200">
                    <td className="px-4 py-2">{formatDateMDY(p.date)}</td>
                    <td className="px-4 py-2 text-right">S/. {p.amount}</td>
                  </tr>
                ))}
                <tr className="border-t border-zinc-200 bg-zinc-50">
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2 text-right font-medium">S/. {totalPagado}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={download}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              DESCARGAR PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-md border border-fuchsia-400 px-4 py-2 text-sm font-semibold text-fuchsia-600 hover:bg-fuchsia-50"
            >
              CERRAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


