import { NextResponse } from "next/server";
import { prisma } from "@/src/shared/db/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const studentId = String(body.studentId ?? "").trim();
  const cycleId = String(body.cycleId ?? "").trim();
  const year = Number(body.year);
  const month = Number(body.month); // 1..12
  const total = Number(body.total);

  if (!studentId || !cycleId) {
    return NextResponse.json({ message: "studentId y cycleId son requeridos" }, { status: 400 });
  }
  if (![1,2,3,4,5,6,7,8,9,10,11,12].includes(month)) {
    return NextResponse.json({ message: "month debe ser 1..12" }, { status: 400 });
  }
  if (!Number.isFinite(year) || year < 2000) {
    return NextResponse.json({ message: "year inválido" }, { status: 400 });
  }
  if (!Number.isFinite(total) || total <= 0) {
    return NextResponse.json({ message: "total inválido" }, { status: 400 });
  }

  const payment = await prisma.payment.upsert({
    where: {
      studentId_cycleId_month_year: { studentId, cycleId, month, year },
    },
    create: {
      studentId,
      cycleId,
      month,
      year,
      total,
      status: "NO_PAGO",
      totalPaid: 0,
    },
    update: {
      total,
      // Si estaba NO_REGISTRADO lo activas:
      status: "NO_PAGO",
    },
  });

  return NextResponse.json({ payment }, { status: 201 });
}
