// app/api/attendance/week/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/src/shared/db/prisma";

type AttendanceStatus = "PRESENTE" | "AUSENTE" | "TARDE" | "JUSTIFICADO";
type Cell = { status: AttendanceStatus; markedAt: string | null };


function parseISODateOnly(iso: string) {
    // iso: YYYY-MM-DD
    const d = new Date(`${iso}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime())) throw new Error("Fecha inválida");
    return d;
}

function toISODateOnly(d: Date) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function startOfWeekMonday(anchor: Date) {
    // usando UTC (para evitar cambios raros)
    const day = anchor.getUTCDay(); // 0=Dom..6=Sab
    const diff = day === 0 ? -6 : 1 - day; // lunes
    const start = new Date(anchor);
    start.setUTCDate(anchor.getUTCDate() + diff);
    start.setUTCHours(0, 0, 0, 0);
    return start;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const cycleId = (searchParams.get("cycleId") ?? "").trim();
        const actividadId = (searchParams.get("actividadId") ?? "ALL").trim();
        const date = (searchParams.get("date") ?? "").trim();

        if (!cycleId || !date) {
            return NextResponse.json({ error: "cycleId y date son requeridos" }, { status: 400 });
        }

        const anchor = parseISODateOnly(date);
        const weekStart = startOfWeekMonday(anchor);
        const weekEndExclusive = new Date(weekStart);
        weekEndExclusive.setUTCDate(weekStart.getUTCDate() + 7);

        const days: string[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setUTCDate(weekStart.getUTCDate() + i);
            days.push(toISODateOnly(d));
        }

        // helper: convierte DateTime de session.date a YYYY-MM-DD
        const sessionDay = (d: Date) => toISODateOnly(new Date(d));

        if (actividadId !== "ALL") {
            // 1) validar actividad + ciclo
            const actividad = await prisma.actividad.findFirst({
                where: { id: actividadId, cicloId: cycleId },
                select: { id: true, nombre: true, tipo: true },
            });

            if (!actividad) {
                return NextResponse.json({ error: "Actividad no encontrada en este ciclo" }, { status: 404 });
            }

            // 2) estudiantes inscritos a la actividad
            const sa = await prisma.studentActividad.findMany({
                where: { actividadId },
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastNameFather: true,
                            lastNameMother: true,
                            status: true,
                        },
                    },
                },
                orderBy: { createdAt: "asc" },
            });

            const students = sa
                .map((x) => x.student)
                .filter((s) => s.status === "ACTIVO");

            // 3) sesiones de la semana + records
            const sessions = await prisma.attendanceSession.findMany({
                where: {
                    actividadId,
                    date: { gte: weekStart, lt: weekEndExclusive },
                },
                include: { records: true },
            });

            // 4) grid
            const grid: Record<string, Record<string, Cell | null>> = {};
            for (const s of students) {
                grid[s.id] = {};
                for (const day of days) grid[s.id][day] = null;
            }

            for (const session of sessions) {
                const day = sessionDay(session.date);
                for (const r of session.records) {
                    if (grid[r.studentId] && day in grid[r.studentId]) {
                        grid[r.studentId][day] = {
                            status: r.status as AttendanceStatus,
                            markedAt: (r as any).markedAt ? new Date((r as any).markedAt).toISOString() : null,
                        };
                    }
                }
            }

            return NextResponse.json({
                week: { start: toISODateOnly(weekStart), endExclusive: toISODateOnly(weekEndExclusive), days },
                mode: "ONE",
                actividad,
                students,
                grid,
            });
        }

        // ====== ALL ACTIVIDADES ======
        // 1) actividades del ciclo
        const acts = await prisma.actividad.findMany({
            where: { cicloId: cycleId },
            select: { id: true, nombre: true, tipo: true },
            orderBy: { nombre: "asc" },
        });

        if (acts.length === 0) {
            return NextResponse.json({
                week: { start: toISODateOnly(weekStart), endExclusive: toISODateOnly(weekEndExclusive), days },
                mode: "ALL",
                actividades: [],
                groups: {},
            });
        }

        const actIds = acts.map((a) => a.id);

        // 2) estudiantes por actividad (inscritos)
        const saAll = await prisma.studentActividad.findMany({
            where: { actividadId: { in: actIds } },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastNameFather: true,
                        lastNameMother: true,
                        status: true,
                    },
                },
            },
        });

        // 3) sesiones semana (de todas esas actividades)
        const sessionsAll = await prisma.attendanceSession.findMany({
            where: {
                actividadId: { in: actIds },
                date: { gte: weekStart, lt: weekEndExclusive },
            },
            include: { records: true },
        });

        // 4) arma groups
        const groups: Record<
            string,
            {
                actividad: { id: string; nombre: string; tipo: string };
                students: any[];
                grid: Record<string, Record<string, Cell | null>>;
            }
        > = {};

        for (const a of acts) {
            groups[a.id] = {
                actividad: a,
                students: [],
                grid: {},
            };
        }

        // estudiantes por actividad
        for (const row of saAll) {
            if (row.student.status !== "ACTIVO") continue;
            const g = groups[row.actividadId];
            if (!g) continue;
            // evitar duplicados
            if (!g.grid[row.student.id]) {
                g.students.push(row.student);
                g.grid[row.student.id] = {};
                for (const day of days) g.grid[row.student.id][day] = null;
            }
        }

        // ordena estudiantes
        for (const k of Object.keys(groups)) {
            groups[k].students.sort((a, b) => {
                const an = `${a.lastNameFather} ${a.lastNameMother} ${a.firstName}`.toLowerCase();
                const bn = `${b.lastNameFather} ${b.lastNameMother} ${b.firstName}`.toLowerCase();
                return an.localeCompare(bn);
            });
        }

        // llena grid con records
        for (const session of sessionsAll) {
            const day = sessionDay(session.date);
            const g = groups[session.actividadId];
            if (!g) continue;

            for (const r of session.records) {
                if (g.grid[r.studentId] && day in g.grid[r.studentId]) {
                    g.grid[r.studentId][day] = {
                        status: r.status as AttendanceStatus,
                        markedAt: (r as any).markedAt ? new Date((r as any).markedAt).toISOString() : null,
                    };
                }
            }

        }

        return NextResponse.json({
            week: { start: toISODateOnly(weekStart), endExclusive: toISODateOnly(weekEndExclusive), days },
            mode: "ALL",
            actividades: acts,
            groups,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
    }
}
