"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type CicloDTO = {
    id: string;
    nombre: string;
    actividades: { id: string; nombre: string; tipo: "NIVEL" | "TALLER" }[];
};

type AttendanceStatus = "PRESENTE" | "AUSENTE" | "TARDE" | "JUSTIFICADO";
type DayKey = string; // YYYY-MM-DD
type Cell = { status: AttendanceStatus; markedAt: string | null };


type StudentDTO = {
    id: string;
    firstName: string;
    lastNameFather: string;
    lastNameMother: string;
};

type WeekResponse = {
    week: { start: string; endExclusive: string; days: DayKey[] };
    mode: "ONE" | "ALL";
    actividad?: { id: string; nombre: string; tipo: string } | null;
    actividades?: { id: string; nombre: string; tipo: string }[];

    // ONE
    students?: StudentDTO[];
    grid?: Record<string, Record<DayKey, Cell | null>>;

    // ALL
    groups?: Record<
        string,
        {
            actividad: { id: string; nombre: string; tipo: string };
            students: StudentDTO[];
            grid: Record<string, Record<DayKey, Cell | null>>;
        }
    >;
};

function isoToday() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

const STATUS_TEXT: Record<AttendanceStatus, string> = {
    PRESENTE: "P",
    AUSENTE: "A",
    TARDE: "T",
    JUSTIFICADO: "J",
};

function badgeClass(status: AttendanceStatus | null) {
    if (!status) return "bg-[var(--color-surface)] ring-[var(--color-border)] opacity-60";
    if (status === "PRESENTE") return "bg-green-500/20 text-green-700 ring-green-500";
    if (status === "AUSENTE") return "bg-red-500/20 text-red-700 ring-red-500";
    if (status === "TARDE") return "bg-yellow-400/30 text-yellow-800 ring-yellow-500";
    return "bg-blue-500/20 text-blue-700 ring-blue-500";
}

function formatDayShort(iso: string) {
    // iso "YYYY-MM-DD"
    const d = new Date(`${iso}T00:00:00.000Z`);
    const weekday = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"][d.getUTCDay()];
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${weekday} ${dd}`;
}

export default function AttendanceWeekClient({ ciclos }: { ciclos: CicloDTO[] }) {
    const [cycleId, setCycleId] = useState(ciclos[0]?.id ?? "");
    const actividades = useMemo(
        () => ciclos.find((c) => c.id === cycleId)?.actividades ?? [],
        [ciclos, cycleId]
    );

    // "ALL" para todas
    const [actividadId, setActividadId] = useState<string>("ALL");
    const [anchorDate, setAnchorDate] = useState<string>(isoToday());

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<WeekResponse | null>(null);

    // cuando cambia ciclo, setea ALL y recarga
    useEffect(() => {
        setActividadId("ALL");
    }, [cycleId]);

    async function load() {
        if (!cycleId || !anchorDate) return;

        setLoading(true);
        try {
            const url =
                `/api/attendance/week?cycleId=${encodeURIComponent(cycleId)}` +
                `&actividadId=${encodeURIComponent(actividadId)}` +
                `&date=${encodeURIComponent(anchorDate)}`;

            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) {
                const t = await res.text();
                throw new Error(t.slice(0, 200));
            }
            const json = (await res.json()) as WeekResponse;
            setData(json);
        } catch (e: any) {
            toast.error("No se pudo cargar la semana", {
                description: e?.message ?? "Intenta nuevamente",
            });
            setData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cycleId, actividadId, anchorDate]);

    const days = data?.week?.days ?? [];

    return (
        <div className="space-y-3">
            {/* filtros */}
            <div className="rounded-2xl ring-1 ring-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <div className="grid gap-3 md:grid-cols-3">
                    <div>
                        <label className="text-xs opacity-70">Ciclo</label>
                        <select
                            value={cycleId}
                            onChange={(e) => setCycleId(e.target.value)}
                            className="mt-1 w-full rounded-xl bg-[var(--color-surface)] ring-1 ring-[var(--color-border)] px-3 py-2 text-sm outline-none focus:ring-2"
                        >
                            {ciclos.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs opacity-70">Actividad</label>
                        <select
                            value={actividadId}
                            onChange={(e) => setActividadId(e.target.value)}
                            className="mt-1 w-full rounded-xl bg-[var(--color-surface)] ring-1 ring-[var(--color-border)] px-3 py-2 text-sm outline-none focus:ring-2"
                        >
                            <option value="ALL">Todas las actividades</option>
                            {actividades.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.nombre} ({a.tipo})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs opacity-70">Semana (elige un día)</label>
                        <input
                            type="date"
                            value={anchorDate}
                            onChange={(e) => setAnchorDate(e.target.value)}
                            className="mt-1 w-full rounded-xl bg-[var(--color-surface)] ring-1 ring-[var(--color-border)] px-3 py-2 text-sm outline-none focus:ring-2"
                        />
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs opacity-70">
                        {data?.week?.start
                            ? `Semana: ${data.week.start} → ${data.week.days.at(-1)}`
                            : " "}
                    </div>
                    <div className="text-xs opacity-70">{loading ? "Cargando..." : " "}</div>
                </div>
            </div>

            {/* contenido */}
            {actividadId !== "ALL" ? (
                <WeekTable
                    title={data?.actividad ? `${data.actividad.nombre} (${data.actividad.tipo})` : "Actividad"}
                    days={days}
                    students={data?.students ?? []}
                    grid={data?.grid ?? {}}
                    loading={loading}
                />
            ) : (
                <div className="space-y-3">
                    {data?.groups && Object.keys(data.groups).length > 0 ? (
                        Object.values(data.groups).map((g) => (
                            <WeekTable
                                key={g.actividad.id}
                                title={`${g.actividad.nombre} (${g.actividad.tipo})`}
                                days={days}
                                students={g.students}
                                grid={g.grid}
                                loading={loading}
                            />
                        ))
                    ) : (
                        <div className="rounded-2xl ring-1 ring-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-sm opacity-70">
                            {loading ? "Cargando..." : "No hay datos de asistencia para esa semana."}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function WeekTable({
    title,
    days,
    students,
    grid,
    loading,
}: {
    title: string;
    days: string[];
    students: StudentDTO[];
    grid: Record<string, Record<string, Cell | null>>;
    loading: boolean;
}) {
    return (
        <div className="rounded-2xl ring-1 ring-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-3">
                <div className="text-sm font-medium">{title}</div>
                <div className="text-xs opacity-70">
                    {loading ? "Cargando..." : `${students.length} estudiantes`}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full text-sm">
                    <thead>
                        <tr className="border-b border-[var(--color-border)]">
                            <th className="text-left p-3 w-[360px]">Estudiante</th>
                            {days.map((d) => (
                                <th key={d} className="text-center p-3">
                                    {formatDayShort(d)}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border)]">
                        {students.map((s) => {
                            const fullName = `${s.lastNameFather} ${s.lastNameMother}, ${s.firstName}`;
                            return (
                                <tr key={s.id}>
                                    <td className="p-3">
                                        <div className="font-medium">{fullName}</div>
                                    </td>

                                    {days.map((day) => {
                                        const cell = grid?.[s.id]?.[day] ?? null;
                                        const status = cell?.status ?? null;
                                        const markedAt = cell?.markedAt ?? null;

                                        const timeText = markedAt
                                            ? new Date(markedAt).toLocaleTimeString("es-PE", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            : null;

                                        return (
                                            <td key={day} className="p-3 text-center">
                                                <span
                                                    className={[
                                                        "inline-flex h-10 w-12 flex-col items-center justify-center rounded-xl ring-1 font-semibold leading-none",
                                                        badgeClass(status),
                                                    ].join(" ")}
                                                    title={timeText ? `Registrado: ${timeText}` : "Sin registro"}
                                                >
                                                    <span>{status ? STATUS_TEXT[status] : "—"}</span>
                                                    {timeText ? (
                                                        <span className="text-[10px] font-medium opacity-80">{timeText}</span>
                                                    ) : null}
                                                </span>
                                            </td>
                                        );

                                    })}
                                </tr>
                            );
                        })}

                        {!loading && students.length === 0 && (
                            <tr>
                                <td colSpan={days.length + 1} className="p-6 text-center opacity-70">
                                    No hay estudiantes inscritos / sin datos para esta semana.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* leyenda */}
            <div className="border-t border-[var(--color-border)] p-3 text-xs opacity-70 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2">
                    <span className="inline-flex h-6 w-7 items-center justify-center rounded-lg ring-1 bg-green-500/20 text-green-700 ring-green-500 font-semibold">
                        P
                    </span>
                    Presente
                </span>
                <span className="inline-flex items-center gap-2">
                    <span className="inline-flex h-6 w-7 items-center justify-center rounded-lg ring-1 bg-red-500/20 text-red-700 ring-red-500 font-semibold">
                        A
                    </span>
                    Ausente
                </span>
                <span className="inline-flex items-center gap-2">
                    <span className="inline-flex h-6 w-7 items-center justify-center rounded-lg ring-1 bg-yellow-400/30 text-yellow-800 ring-yellow-500 font-semibold">
                        T
                    </span>
                    Tarde
                </span>
                <span className="inline-flex items-center gap-2">
                    <span className="inline-flex h-6 w-7 items-center justify-center rounded-lg ring-1 bg-blue-500/20 text-blue-700 ring-blue-500 font-semibold">
                        J
                    </span>
                    Justificado
                </span>
            </div>
        </div>
    );
}
