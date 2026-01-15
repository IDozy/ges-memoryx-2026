"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { RegistroRow } from "@/src/components/record/types";
import RegistroTable from "@/src/components/record/recordTable";

type Cycle = { id: string; nombre: string };

export default function RecordPage() {
    const [data, setData] = useState<RegistroRow[]>([]);
    const [loading, setLoading] = useState(true);

    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [cycleId, setCycleId] = useState<string>("");

  async function loadCycles() {
        try {
            const res = await fetch("/api/cycles", { cache: "no-store" });
            if (!res.ok) throw new Error("No se pudo cargar ciclos");

            const json = await res.json();

            const list = Array.isArray(json)
                ? json
                : Array.isArray(json.items)
                    ? json.items
                    : [];

            setCycles(list);

            if (!cycleId && list.length > 0) {
                setCycleId(list[0].id);
            }
        } catch (e: any) {
            toast.error("Error cargando ciclos", {
                description: e?.message ?? "Intenta nuevamente",
            });
        }
    }


    async function loadRecords(currentCycleId: string) {
        if (!currentCycleId) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/record?cycleId=${currentCycleId}`, {
                cache: "no-store",
            });
            if (!res.ok) throw new Error("No se pudo cargar el registro del ciclo");

            const json = (await res.json()) as RegistroRow[];
            setData(json);
        } catch (e: any) {
            toast.error("Error cargando registros", {
                description: e?.message ?? "Intenta nuevamente",
            });
        } finally {
            setLoading(false);
        }
    }

    // 1) cargar ciclos al entrar
    useEffect(() => {
        loadCycles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2) cargar registros cuando cambia el ciclo
    useEffect(() => {
        if (cycleId) loadRecords(cycleId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cycleId]);

    function onCreate() {
        toast.message("Aquí abrirías tu modal de Nuevo Registro 👌");
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">Registro</h1>

                <select
                    value={cycleId}
                    onChange={(e) => setCycleId(e.target.value)}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                >
                    {cycles.length === 0 ? (
                        <option value="">Sin ciclos</option>
                    ) : (
                        cycles.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nombre}
                            </option>
                        ))
                    )}
                </select>
            </div>

            {loading ? (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm opacity-70">
                    Cargando...
                </div>
            ) : (
                <RegistroTable data={data} onCreate={onCreate} />
            )}
        </div>
    );
}
