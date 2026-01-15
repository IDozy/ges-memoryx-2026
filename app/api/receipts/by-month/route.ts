import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const studentId = String(searchParams.get("studentId") ?? "").trim();
  const cycleId = String(searchParams.get("cycleId") ?? "").trim();
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));

  if (!studentId || !cycleId || !Number.isFinite(year) || !Number.isFinite(month)) {
    return NextResponse.json({ message: "Parámetros inválidos" }, { status: 400 });
  }

  // Trae Receipt si existe para ese mes
  const receipt = await prisma.receipt.findUnique({
    where: {
      studentId_cycleId_month_year: { studentId, cycleId, month, year },
    },
    select: {
      id: true,
      correlativo: true,
      receiptNo: true,
      issuedAt: true,
      total: true,
      totalPaid: true,
      paymentId: true,
      month: true,
      year: true,
    },
  });

  return NextResponse.json({ receipt }); // puede ser null
}
