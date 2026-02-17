"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";


type CicloDTO = {
    id: string;
    nombre: string;
    actividades: { id: string; nombre: string; tipo: "NIVEL" | "TALLER" }[];
};

type StudentDTO = {
    id: string;
    firstName: string;
    lastNameFather: string;
    lastNameMother: string;
};

type AttendanceStatus = "PRESENTE" | "AUSENTE" | "TARDE" | "JUSTIFICADO";

type Props = { ciclos: CicloDTO[] };

function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}



const STATUS_LABEL: Record<AttendanceStatus, string> = {
    PRESENTE: "P",
    AUSENTE: "A",
    TARDE: "T",
    JUSTIFICADO: "J",
};

const STATUS_STYLE: Record<
    AttendanceStatus,
    { active: string; inactive: string }
> = {
    PRESENTE: {
        active: "bg-green-500/20 text-green-700 ring-green-500",
        inactive: "hover:bg-green-500/10 text-green-600",
    },
    AUSENTE: {
        active: "bg-red-500/20 text-red-700 ring-red-500",
        inactive: "hover:bg-red-500/10 text-red-600",
    },
    TARDE: {
        active: "bg-yellow-400/30 text-yellow-800 ring-yellow-500",
        inactive: "hover:bg-yellow-400/20 text-yellow-700",
    },
    JUSTIFICADO: {
        active: "bg-blue-500/20 text-blue-700 ring-blue-500",
        inactive: "hover:bg-blue-500/10 text-blue-600",
    },
};


export default function AttendanceClient({ ciclos }: Props) {
    const [cycleId, setCycleId] = useState<string>(ciclos[0]?.id ?? "");
    const actividades = useMemo(
        () => ciclos.find((c) => c.id === cycleId)?.actividades ?? [],
        [ciclos, cycleId]
    );

    const [actividadId, setActividadId] = useState<string>(actividades[0]?.id ?? "");
    const [date, setDate] = useState<string>(todayISO());

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [sessionId, setSessionId] = useState<string>("");
    const [students, setStudents] = useState<StudentDTO[]>([]);
    const [records, setRecords] = useState<
        Record<string, { status: AttendanceStatus; markedAt?: string }>
    >({});

    // cuando cambia el ciclo, ajusta la actividad por defecto
    useEffect(() => {
        const first = actividades[0]?.id ?? "";
        setActividadId(first);
    }, [cycleId, actividades]);

    // cargar: estudiantes + crear/obtener sesión + records existentes
    useEffect(() => {
        if (!actividadId || !date) return;

        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                // 1) obtener/crear session del día
                const s = await fetch(
                    `/api/attendance/session?actividadId=${encodeURIComponent(actividadId)}&date=${encodeURIComponent(
                        date
                    )}`,
                    { cache: "no-store" }
                ).then((r) => r.json());

                if (cancelled) return;
                setSessionId(s.sessionId);

                // 2) cargar estudiantes inscritos a esa actividad
                const st = await fetch(
                    `/api/attendance/students?actividadId=${encodeURIComponent(actividadId)}`,
                    { cache: "no-store" }
                ).then((r) => r.json());

                if (cancelled) return;
                setStudents(st.students ?? []);

                // 3) records existentes (si hay)
                const initial: Record<string, { status: AttendanceStatus; markedAt?: string }> = {};

                for (const rec of s.records ?? []) {
                    initial[rec.studentId] = { status: rec.status, markedAt: rec.markedAt };
                }

                // default AUSENTE
                for (const stu of st.students ?? []) {
                    if (!initial[stu.id]) initial[stu.id] = { status: "AUSENTE" };
                }

                setRecords(initial);

            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [actividadId, date]);

    async function saveAll() {
        if (!sessionId) return;

        setSaving(true);
        try {
            const payload = {
                sessionId,
                records: Object.entries(records).map(([studentId, v]) => ({
                    studentId,
                    status: v.status,
                })),
            };

            const res = await fetch("/api/attendance/records", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.text();
                throw new Error(err || "Error guardando asistencia");
            }

            // ✅ TOAST DE ÉXITO
            toast.success("Asistencia guardada correctamente", {
                description: "Los cambios fueron registrados en el sistema.",
            });
        } catch (error: any) {
            // ❌ TOAST DE ERROR
            toast.error("No se pudo guardar la asistencia", {
                description: error?.message ?? "Intenta nuevamente",
            });
        } finally {
            setSaving(false);
        }
    }


    function setStatus(studentId: string, status: AttendanceStatus) {
        setRecords((prev) => ({
            ...prev,
            [studentId]: { status, markedAt: new Date().toISOString() },
        }));
    }


    const actividadLabel =
        actividades.find((a) => a.id === actividadId)?.nombre ?? "Actividad";

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
                            {actividades.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.nombre} ({a.tipo})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs opacity-70">Fecha</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="mt-1 w-full rounded-xl bg-[var(--color-surface)] ring-1 ring-[var(--color-border)] px-3 py-2 text-sm outline-none focus:ring-2"
                        />
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm">
                        <span className="opacity-70">Sesión:</span>{" "}
                        <span className="font-medium">{actividadLabel}</span>
                    </div>

                    <button
                        onClick={saveAll}
                        disabled={saving || loading || !sessionId}
                        className={[
                            "rounded-xl px-4 py-2 text-sm ring-1 transition",
                            "ring-[var(--color-border)]",
                            saving || loading
                                ? "opacity-60"
                                : "hover:bg-[var(--color-muted)]",
                        ].join(" ")}
                    >
                        {saving ? "Guardando..." : "Guardar asistencia"}
                    </button>
                </div>
            </div>

            {/* tabla/lista */}
            <div className="rounded-2xl ring-1 ring-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] p-3">
                    <div className="text-sm font-medium">Estudiantes</div>
                    <div className="text-xs opacity-70">
                        {loading ? "Cargando..." : `${students.length} registros`}
                    </div>
                </div>

                <div className="divide-y divide-[var(--color-border)]">
                    {students.map((s) => {
                        const status = records[s.id]?.status ?? "AUSENTE";
                        const markedAt = records[s.id]?.markedAt;
                        const fullName = `${s.lastNameFather} ${s.lastNameMother}, ${s.firstName}`;

                        return (
                            <div key={s.id} className="flex items-center justify-between p-3">
                                <div>
                                    <div className="text-sm font-medium">{fullName}</div>
                                    <div className="text-xs opacity-70">
                                        Estado: {status}
                                        {markedAt ? (
                                            <>
                                                {" • "}Hora:{" "}
                                                {new Date(markedAt).toLocaleTimeString("es-PE", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {(
                                        ["PRESENTE", "AUSENTE", "TARDE", "JUSTIFICADO"] as AttendanceStatus[]
                                    ).map((st) => {
                                        const active = st === status;
                                        return (
                                            <button
                                                key={st}
                                                onClick={() => setStatus(s.id, st)}
                                                className={[
                                                    "h-9 w-10 rounded-xl text-sm font-semibold ring-1 transition",
                                                    active
                                                        ? STATUS_STYLE[st].active
                                                        : `ring-[var(--color-border)] opacity-80 hover:opacity-100 ${STATUS_STYLE[st].inactive}`,
                                                ].join(" ")}
                                                title={st}
                                            >
                                                {STATUS_LABEL[st]}
                                            </button>

                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {!loading && students.length === 0 && (
                        <div className="p-6 text-center text-sm opacity-70">
                            No hay estudiantes inscritos en esta actividad.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
