import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const studentId = String(body.studentId ?? "").trim();
  const cycleId = String(body.cycleId ?? "").trim();
  const year = Number(body.year);
  const month = Number(body.month); // 1..12
  const amount = Number(body.amount);
  const dateStr = String(body.date ?? "").trim();
  const paymentType = (String(body.paymentType ?? "CASH").trim().toUpperCase() as any);

  if (!studentId || !cycleId) {
    return NextResponse.json({ message: "studentId y cycleId son requeridos" }, { status: 400 });
  }
  if (![1,2,3,4,5,6,7,8,9,10,11,12].includes(month)) {
    return NextResponse.json({ message: "month debe ser 1..12" }, { status: 400 });
  }
  if (!Number.isFinite(year) || year < 2000) {
    return NextResponse.json({ message: "year inválido" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ message: "amount inválido" }, { status: 400 });
  }
  const date = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ message: "date inválida (YYYY-MM-DD)" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    // Debe existir Payment (si no, lo creas con total default o mandas error)
    const payment = await tx.payment.upsert({
      where: {
        studentId_cycleId_month_year: { studentId, cycleId, month, year },
      },
      create: {
        studentId,
        cycleId,
        month,
        year,
        total: 80, // default; mejor: manda total desde front o lee de config
        status: "NO_PAGO",
        totalPaid: 0,
      },
      update: {},
    });

    await tx.paymentDetail.create({
      data: {
        paymentId: payment.id,
        amount,
        date,
        paymentType,
      },
    });

    // recalcular totalPaid
    const agg = await tx.paymentDetail.aggregate({
      where: { paymentId: payment.id },
      _sum: { amount: true },
    });
    const totalPaid = Number(agg._sum.amount ?? 0);

    // status
    const status =
      totalPaid <= 0 ? "NO_PAGO" :
      totalPaid >= payment.total ? "PAGADO" :
      "PENDIENTE";

    const updated = await tx.payment.update({
      where: { id: payment.id },
      data: { totalPaid, status },
      include: { paid: { orderBy: { date: "asc" } } },
    });

    // opcional: si PAGADO, crear receipt si no existe
    if (updated.status === "PAGADO") {
      await tx.receipt.upsert({
        where: { paymentId: updated.id },
        create: {
          paymentId: updated.id,
          studentId,
          cycleId,
          month,
          year,
          total: updated.total,
          totalPaid: updated.totalPaid,
          pagosJson: updated.paid.map((p) => ({
            date: p.date.toISOString().slice(0, 10),
            amount: p.amount,
            paymentType: p.paymentType,
          })),
        },
        update: {
          total: updated.total,
          totalPaid: updated.totalPaid,
          pagosJson: updated.paid.map((p) => ({
            date: p.date.toISOString().slice(0, 10),
            amount: p.amount,
            paymentType: p.paymentType,
          })),
        },
      });
    }

    return updated;
  });

  return NextResponse.json({ payment: result }, { status: 201 });
}
