import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

const VALID_TYPES = new Set(["CASH", "YAPE", "PLIN", "TRANSFER"]);

export async function POST(req: Request) {
  const body = await req.json();

  const studentId = String(body.studentId ?? "").trim();
  const cycleId = String(body.cycleId ?? "").trim();
  const year = Number(body.year);
  const month = Number(body.month); // 1..12
  const amount = Number(body.amount);
  const dateStr = String(body.date ?? "").trim();

  const paymentTypeRaw = String(body.paymentType ?? "CASH").trim().toUpperCase();
  const paymentType = VALID_TYPES.has(paymentTypeRaw) ? (paymentTypeRaw as any) : null;

  if (!studentId || !cycleId) {
    return NextResponse.json({ message: "studentId y cycleId son requeridos" }, { status: 400 });
  }
  if (!Number.isFinite(year) || year < 2000) {
    return NextResponse.json({ message: "year inválido" }, { status: 400 });
  }
  if (!Number.isFinite(month) || month < 1 || month > 12) {
    return NextResponse.json({ message: "month debe ser 1..12" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ message: "amount inválido" }, { status: 400 });
  }
  if (!paymentType) {
    return NextResponse.json({ message: "paymentType inválido" }, { status: 400 });
  }

  const date = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ message: "date inválida (YYYY-MM-DD)" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // ✅ MODO A: el mes debe estar registrado (Payment ya debe existir)
      const payment = await tx.payment.findUnique({
        where: { studentId_cycleId_month_year: { studentId, cycleId, month, year } },
        select: { id: true, total: true },
      });

      if (!payment) {
        // Esto evita crear pagos con total "inventado"
        throw new Error("MES_NO_REGISTRADO");
      }

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

      let receipt: { id: string; correlativo: number; receiptNo: string | null } | null = null;

      if (updated.status === "PAGADO") {
        // crea o actualiza receipt
        receipt = await tx.receipt.upsert({
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
          select: { id: true, correlativo: true, receiptNo: true },
        });

        // ✅ generar receiptNo si aún está null
        if (!receipt.receiptNo) {
          const prefix = "REC"; // luego puedes cambiar a REG/VER leyendo el ciclo
          const receiptNo = `${prefix}-${year}-${String(receipt.correlativo).padStart(6, "0")}`;

          receipt = await tx.receipt.update({
            where: { id: receipt.id },
            data: { receiptNo },
            select: { id: true, correlativo: true, receiptNo: true },
          });
        }
      }

      return { payment: updated, receipt };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    if (e?.message === "MES_NO_REGISTRADO") {
      return NextResponse.json(
        { message: "Mes no registrado. Primero registra el mes para poder abonar." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Error al registrar abono" },
      { status: 500 }
    );
  }
}
