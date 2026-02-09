import { NextResponse } from "next/server";
import { prisma } from "@/src/shared/db/prisma";

export const runtime = "nodejs";

function computeStatus(total: number, totalPaid: number) {
  if (totalPaid <= 0) return "UNPAID" as const;
  if (totalPaid >= total) return "PAID" as const;
  return "PARTIAL" as const;
}

export async function POST(req: Request) {
  const body = await req.json();

  const studentId = String(body.studentId ?? "").trim();
  const cycleId = String(body.cycleId ?? "").trim();
  const year = Number(body.year);
  const month = Number(body.month); // 1..12
  const total = Number(body.total);

  const concept = body.concept ? String(body.concept).trim() : "Monthly Fee";
  const dueDate = body.dueDate ? new Date(String(body.dueDate)) : null;

  if (!studentId || !cycleId) {
    return NextResponse.json({ message: "studentId y cycleId son requeridos" }, { status: 400 });
  }
  if (!Number.isFinite(month) || month < 1 || month > 12) {
    return NextResponse.json({ message: "month debe ser 1..12" }, { status: 400 });
  }
  if (!Number.isFinite(year) || year < 2000) {
    return NextResponse.json({ message: "year inválido" }, { status: 400 });
  }
  if (!Number.isFinite(total) || total <= 0) {
    return NextResponse.json({ message: "total inválido" }, { status: 400 });
  }
  if (dueDate && Number.isNaN(dueDate.getTime())) {
    return NextResponse.json({ message: "dueDate inválida (YYYY-MM-DD)" }, { status: 400 });
  }

  const payment = await prisma.$transaction(async (tx) => {
    // 1) mira si ya existe
    const existing = await tx.payment.findUnique({
      where: { studentId_cycleId_month_year: { studentId, cycleId, month, year } },
      select: { id: true, totalPaid: true },
    });

    // 2) si existe, recalculamos usando su totalPaid
    const totalPaid = Number(existing?.totalPaid ?? 0);
    const balance = total - totalPaid;
    const status = computeStatus(total, totalPaid);

    // 3) upsert
    const upserted = await tx.payment.upsert({
      where: { studentId_cycleId_month_year: { studentId, cycleId, month, year } },
      create: {
        studentId,
        cycleId,
        month,
        year,
        concept,
        total,
        totalPaid: 0,
        balance: total,
        status: "UNPAID",
        dueDate,
        paidDate: null,
      },
      update: {
        concept,
        total,
        totalPaid,
        balance,
        status,
        dueDate,
        paidDate: status === "PAID" ? new Date() : null,
      },
    });

    return upserted;
  });

  return NextResponse.json({ payment }, { status: 201 });
}
