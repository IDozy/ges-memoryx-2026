"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type DashboardResponse = {
  kpis: {
    students: { total: number; activos: number; retirados: number };
    actividades: { talleres: number; niveles: number };
    pagos: { pendientesMes: number; ingresosMes: number };
    mesActual: { month: number; year: number };
  };
  activity: { id: string; type: string; title: string; subtitle?: string; at: string }[];
};

function fmtMoney(v: number) {
  return `S/ ${v.toFixed(2)}`;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar dashboard");
      const json = (await res.json()) as DashboardResponse;
      setData(json);
    } catch (e: any) {
      toast.error("Error", { description: e?.message ?? "Intenta nuevamente" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const cards = useMemo(() => {
    const k = data?.kpis;
    return [
      {
        title: "Estudiantes",
        value: k ? String(k.students.total) : "—",
        hint: k ? `Activos: ${k.students.activos} • Retirados: ${k.students.retirados}` : "Registros totales",
      },
      {
        title: "Talleres / Niveles",
        value: k ? `${k.actividades.talleres} / ${k.actividades.niveles}` : "—",
        hint: "Actividades registradas",
      },
      {
        title: "Ingresos del mes",
        value: k ? fmtMoney(k.pagos.ingresosMes) : "—",
        hint: k ? `Mes: ${k.mesActual.month}/${k.mesActual.year}` : "Sumatoria de abonos",
      },
      {
        title: "Pendientes del mes",
        value: k ? String(k.pagos.pendientesMes) : "—",
        hint: "Payments NO_PAGO / PENDIENTE",
      },
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm"
          >
            <div className="text-sm text-zinc-300">{c.title}</div>
            <div className="mt-2 text-3xl font-semibold">{loading ? "—" : c.value}</div>
            <div className="mt-2 text-xs text-zinc-400">{c.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
          <div className="relative h-[calc(100dvh-400px)] overflow-x-auto overflow-y-auto">

            <div className="text-sm font-medium">Actividad reciente</div>

            <div className="mt-3 space-y-2 text-sm text-zinc-300">
              {loading ? (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-3">
                  Cargando actividad...
                </div>
              ) : !data || data.activity.length === 0 ? (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-3">
                  Aún no hay actividad para mostrar.
                </div>
              ) : (
                data.activity.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{a.title}</div>
                        {a.subtitle ? (
                          <div className="mt-0.5 text-xs text-zinc-400">{a.subtitle}</div>
                        ) : null}
                      </div>
                      <div className="text-xs text-zinc-400 whitespace-nowrap">
                        {new Date(a.at).toLocaleString("es-PE")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
          <div className="text-sm font-medium">Acciones rápidas</div>
          <div className="mt-3 space-y-2">
            <a
              className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-3 text-sm hover:opacity-90"
              href="/dashboard/students"
            >
              Ver estudiantes →
            </a>
            <a
              className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-3 text-sm hover:opacity-90"
              href="/dashboard/payments"
            >
              Ver pagos →
            </a>
            <a
              className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-3 text-sm hover:opacity-90"
              href="/dashboard/record"
            >
              Ver registro →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
