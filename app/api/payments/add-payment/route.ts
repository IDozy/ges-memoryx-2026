import { NextResponse } from "next/server";
import { prisma } from "@/src/shared/db/prisma";

export const runtime = "nodejs";

const VALID_METHODS = new Set(["CASH", "YAPE", "PLIN", "TRANSFER", "DEPOSIT", "CREDIT_CARD", "DEBIT_CARD", "OTHER"]);

export async function POST(req: Request) {
  const body = await req.json();

  const studentId = String(body.studentId ?? "").trim();
  const cycleId = String(body.cycleId ?? "").trim();
  const year = Number(body.year);
  const month = Number(body.month); // 1..12
  const amount = Number(body.amount);
  const dateStr = String(body.date ?? "").trim();

  // ✅ nuevo nombre: paymentMethod
  const methodRaw = String(body.paymentMethod ?? body.paymentType ?? "CASH").trim().toUpperCase();
  const paymentMethod = VALID_METHODS.has(methodRaw) ? (methodRaw as any) : null;

  // ✅ requerido por Receipt (en tu schema: issuedBy NOT NULL)
  const issuedBy = String(body.issuedBy ?? "").trim();

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
  if (!paymentMethod) {
    return NextResponse.json({ message: "paymentMethod inválido" }, { status: 400 });
  }
  if (!issuedBy) {
    return NextResponse.json({ message: "issuedBy es requerido para emitir boleta" }, { status: 400 });
  }

  const date = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ message: "date inválida (YYYY-MM-DD)" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // ✅ mes debe existir (Payment pre-creado)
      const payment = await tx.payment.findUnique({
        where: { studentId_cycleId_month_year: { studentId, cycleId, month, year } },
        select: { id: true, total: true },
      });

      if (!payment) {
        throw new Error("MES_NO_REGISTRADO");
      }

      // ✅ crear detalle
      await tx.paymentDetail.create({
        data: {
          paymentId: payment.id,
          amount,
          date,
          paymentMethod, // ✅ nuevo
        },
      });

      // ✅ recalcular totalPaid
      const agg = await tx.paymentDetail.aggregate({
        where: { paymentId: payment.id },
        _sum: { amount: true },
      });

      const totalPaid = Number(agg._sum.amount ?? 0);

      // ✅ status nuevo
      const status =
        totalPaid <= 0 ? "UNPAID" :
        totalPaid >= Number(payment.total) ? "PAID" :
        "PARTIAL";

      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          totalPaid,
          status,
          balance: Number(payment.total) - totalPaid, // tu schema tiene balance
          paidDate: status === "PAID" ? new Date() : null,
        },
        include: {
          details: { orderBy: { date: "asc" } }, // ✅ antes paid
        },
      });

      let receipt: { id: string; correlativo: number; receiptNo: string | null } | null = null;

      if (updated.status === "PAID") {
        receipt = await tx.receipt.upsert({
          where: { paymentId: updated.id },
          create: {
            paymentId: updated.id,
            studentId,
            cycleId,
            month,
            year,
            concept: updated.concept,
            total: updated.total,
            totalPaid: updated.totalPaid,

            issuedBy, // ✅ obligatorio
            paymentsJson: updated.details.map((p) => ({
              date: p.date.toISOString().slice(0, 10),
              amount: Number(p.amount),
              paymentMethod: p.paymentMethod,
              reference: p.reference ?? null,
            })),
          },
          update: {
            concept: updated.concept,
            total: updated.total,
            totalPaid: updated.totalPaid,
            issuedBy, // lo puedes mantener igual o no actualizarlo
            paymentsJson: updated.details.map((p) => ({
              date: p.date.toISOString().slice(0, 10),
              amount: Number(p.amount),
              paymentMethod: p.paymentMethod,
              reference: p.reference ?? null,
            })),
          },
          select: { id: true, correlativo: true, receiptNo: true },
        });

        // ✅ generar receiptNo si aún está null
        if (!receipt.receiptNo) {
          const prefix = "REC";
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

    console.error("[PAYMENT_DETAIL_POST]", e);
    return NextResponse.json(
      { message: e?.message ?? "Error al registrar abono" },
      { status: 500 }
    );
  }
}
