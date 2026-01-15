"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { AbonarTarget, Estudiante, RegistrarTarget, PagoItem } from "@/src/components/payments/types";
import { MESES, DEFAULT_TOTAL_MES } from "@/src/components/payments/constants";
import { buildMes, estadoMes, sumPagos } from "@/src/components/payments/utils";

import { PagoCell } from "@/src/components/payments/paymentCell";
import { RegistrarMesModal } from "@/src/components/payments/RegisterModalMonth";
import { AbonarModal } from "@/src/components/payments/PayModal";
import { BoletaModal } from "@/src/components/payments/TicketModal";

type CycleItem = { id: string; nombre: string; createdAt: string };

function parseYearFromCycleName(nombre: string) {
  const m = nombre.match(/\b(20\d{2})\b/);
  return m ? Number(m[1]) : new Date().getFullYear();
}

export default function PagosPage() {
  // ✅ ciclos reales
  const [cycles, setCycles] = useState<CycleItem[]>([]);
  const [cycleId, setCycleId] = useState<string>(""); // id real en BD
  const selectedCycle = useMemo(() => cycles.find((c) => c.id === cycleId) ?? null, [cycles, cycleId]);

  // ✅ año (lo derivamos del nombre del ciclo)
  const year = useMemo(() => (selectedCycle ? parseYearFromCycleName(selectedCycle.nombre) : new Date().getFullYear()), [selectedCycle]);

  const [q, setQ] = useState("");
  const [data, setData] = useState<Estudiante[]>([]);

  const [openBoleta, setOpenBoleta] = useState(false);
  const [boletaTarget, setBoletaTarget] = useState<{
    tutor: string;
    estudiante: string;
    mes: string;
    total: number;
    pagos: PagoItem[];
    receiptNo?: string;
  } | null>(null);

  const [openAbonar, setOpenAbonar] = useState(false);
  const [abonarTarget, setAbonarTarget] = useState<AbonarTarget | null>(null);

  const [openRegistrar, setOpenRegistrar] = useState(false);
  const [registrarTarget, setRegistrarTarget] = useState<RegistrarTarget | null>(null);

  const students = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return data;
    return data.filter((s) => s.nombreCompleto.toLowerCase().includes(qq));
  }, [q, data]);

  // ✅ 1) cargar ciclos reales
  async function loadCycles() {
    try {
      const res = await fetch("/api/cycles", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar ciclos");
      const json = await res.json();
      const items: CycleItem[] = json.items ?? [];
      setCycles(items);

      // ✅ setear default (primero)
      if (!cycleId && items.length > 0) {
        setCycleId(items[0].id);
      }
    } catch (e: any) {
      toast.error("Error", { description: e.message });
    }
  }

  useEffect(() => {
    loadCycles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 2) cargar matriz desde API
  async function loadMatrix(searchText: string) {
    if (!cycleId) return; // todavía no cargó ciclos

    const res = await fetch(
      `/api/payments/matrix?cycleId=${encodeURIComponent(cycleId)}&year=${year}&q=${encodeURIComponent(searchText)}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      toast.error("No se pudo cargar pagos");
      return;
    }

    const json = await res.json();
    setData(json.items ?? []);
  }

  // ✅ recarga cuando cambie ciclo o año
  useEffect(() => {
    if (!cycleId) return;
    loadMatrix(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleId, year]);

  // ✅ debounce para búsqueda
  useEffect(() => {
    if (!cycleId) return;
    const t = setTimeout(() => loadMatrix(q), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cycleId, year]);

  function openRegistrarModal(student: Estudiante, mesIndex: number) {
    setRegistrarTarget({
      studentId: student.id,
      studentName: student.nombreCompleto,
      mesIndex,
      mesName: MESES[mesIndex],
      defaultTotal: DEFAULT_TOTAL_MES,
    });
    setOpenRegistrar(true);
  }

  function openAbonarModal(student: Estudiante, mesIndex: number) {
    const mesName = MESES[mesIndex];
    const mes = student.pagosPorMes[mesIndex] ?? buildMes(DEFAULT_TOTAL_MES, [], true);

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

  // ✅ POST /register-month
  async function registrarMes(total: number) {
    if (!registrarTarget) return;
    if (!cycleId) {
      toast.error("No hay ciclo seleccionado");
      return;
    }

    try {
      const res = await fetch("/api/payments/register-month", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: registrarTarget.studentId,
          cycleId,
          year,
          month: registrarTarget.mesIndex + 1,
          total,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al registrar mes");
      }

      toast.success("Mes registrado", {
        description: `${registrarTarget.studentName} • ${registrarTarget.mesName}`,
      });

      setOpenRegistrar(false);
      setRegistrarTarget(null);

      await loadMatrix(q);
    } catch (e: any) {
      toast.error("No se pudo registrar el mes", { description: e.message });
    }
  }

  // ✅ POST /add-payment
  async function registrarAbono(amount: number, date: string) {
    if (!abonarTarget) return;
    if (!cycleId) {
      toast.error("No hay ciclo seleccionado");
      return;
    }

    try {
      const res = await fetch("/api/payments/add-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: abonarTarget.studentId,
          cycleId,
          year,
          month: abonarTarget.mesIndex + 1,
          amount,
          date,
          paymentType: "CASH",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Error al registrar abono");
      }

      toast.success("Abono registrado", {
        description: `${abonarTarget.studentName} • ${abonarTarget.mesName}`,
      });

      setOpenAbonar(false);
      setAbonarTarget(null);

      await loadMatrix(q);
    } catch (e: any) {
      toast.error("No se pudo registrar el abono", { description: e.message });
    }
  }

  async function generarBoleta(student: Estudiante, mesIndex: number) {
    const mesName = MESES[mesIndex];
    const mes = student.pagosPorMes[mesIndex];

    if (!mes) {
      toast.error("No hay datos del mes");
      return;
    }

    const month = mesIndex + 1;

    const r = await fetch(
      `/api/receipts/by-month?studentId=${student.id}&cycleId=${cycleId}&year=${year}&month=${month}`
    );

    const j = await r.json();
    const receiptNo = j.receipt?.receiptNo as string | undefined;

    if (!receiptNo) {
      toast.error("Aún no existe boleta", {
        description: "Completa el pago para generar la boleta.",
      });
      return;
    }

    setBoletaTarget({
      tutor: student.tutor || "—",
      estudiante: student.nombreCompleto,
      mes: mesName,
      total: mes.total,
      pagos: mes.pagos,
      receiptNo,
    });

    setOpenBoleta(true);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lista de Pagos</h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium opacity-80">Ciclo</label>

          <select
            value={cycleId}
            onChange={(e) => setCycleId(e.target.value)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
          >
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          <div className="text-xs opacity-70">Año: {year}</div>
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar estudiante..."
          className="w-full sm:max-w-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
        />

        <div className="text-sm opacity-70 sm:ml-auto">{students.length} estudiante(s)</div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="h-full overflow-auto">
          <div className="relative h-[calc(100dvh-259px)] overflow-x-auto overflow-y-auto">
            <table className="min-w-[1200px] w-full border-separate border-spacing-0 text-sm">
              <thead className="sticky top-0 z-20">
                <tr>
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
                    <td className="sticky left-0 z-10 bg-[var(--color-surface)] px-4 py-4 border-b border-r border-[var(--color-border)] font-medium">
                      {s.nombreCompleto}
                    </td>

                    {MESES.map((_, idx) => {
                      const mes = s.pagosPorMes[idx] ?? buildMes(DEFAULT_TOTAL_MES, [], true);
                      const est = estadoMes(mes);
                      const sum = sumPagos(mes);
                      const pagosCount = mes.pagos.length;

                      return (
                        <td key={idx} className="px-3 py-3 border-b border-r border-[var(--color-border)] align-middle">
                          <PagoCell
                            estado={est}
                            total={mes.total}
                            sum={sum}
                            pagosCount={pagosCount}
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

      {openBoleta && boletaTarget && (
        <BoletaModal
          data={boletaTarget}
          onClose={() => {
            setOpenBoleta(false);
            setBoletaTarget(null);
          }}
        />
      )}
    </div>
  );
}
