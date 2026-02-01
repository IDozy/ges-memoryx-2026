import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function normalizeDay(iso: string) {
  const d = new Date(`${iso}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new Error("Fecha inválida");
  return d;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const actividadId = (searchParams.get("actividadId") ?? "").trim();
  const date = (searchParams.get("date") ?? "").trim();

  if (!actividadId || !date) {
    return NextResponse.json(
      { error: "actividadId y date son requeridos" },
      { status: 400 }
    );
  }

  const day = normalizeDay(date);

  const session = await prisma.attendanceSession.upsert({
    where: { actividadId_date: { actividadId, date: day } },
    create: { actividadId, date: day },
    update: {},
    include: { records: true },
  });

  return NextResponse.json({
    sessionId: session.id,
    records: session.records.map((r) => ({
      studentId: r.studentId,
      status: r.status,
      markedAt: r.markedAt,
    })),
  });
}
