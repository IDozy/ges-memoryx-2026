import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

type AttendanceStatus = "PRESENTE" | "AUSENTE" | "TARDE" | "JUSTIFICADO";

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);

    const sessionId = (body?.sessionId ?? "").trim();
    const records = Array.isArray(body?.records) ? body.records : [];

    if (!sessionId || records.length === 0) {
        return NextResponse.json(
            { error: "sessionId y records son requeridos" },
            { status: 400 }
        );
    }

    await prisma.$transaction(
        records.map((r: any) => {
            const studentId = String(r.studentId ?? "").trim();
            const status = String(r.status ?? "").trim() as AttendanceStatus;

            if (!studentId || !status) {
                // si viene algo malo, no revienta todo: ignora
                return prisma.attendanceRecord.findMany({ where: { sessionId }, take: 0 });
            }

            return prisma.attendanceRecord.upsert({
                where: { sessionId_studentId: { sessionId, studentId } },
                create: { sessionId, studentId, status, markedAt: new Date() },
                update: { status, markedAt: new Date() },
            });

        })
    );

    return NextResponse.json({ ok: true });
}
