import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function month1toIndex(m: number) {
  // BD 1..12  => UI 0..11
  return m - 1;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cycleId = String(searchParams.get("cycleId") ?? "").trim();
  const year = Number(searchParams.get("year") ?? new Date().getFullYear());
  const q = (searchParams.get("q") ?? "").trim();

  if (!cycleId) {
    return NextResponse.json({ message: "cycleId es requerido" }, { status: 400 });
  }
  if (!Number.isFinite(year)) {
    return NextResponse.json({ message: "year inválido" }, { status: 400 });
  }

  const whereStudent: any = {};
  if (q) {
    whereStudent.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastNameFather: { contains: q, mode: "insensitive" } },
      { lastNameMother: { contains: q, mode: "insensitive" } },
      { tutor: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  const students = await prisma.student.findMany({
    where: whereStudent,
    orderBy: [
      { status: "asc" }, // ACTIVO primero
      { lastNameFather: "asc" },
      { lastNameMother: "asc" },
      { firstName: "asc" },
    ],
    include: {
      payments: {
        where: { cycleId, year },
        include: { paid: { orderBy: { date: "asc" } } }, // PaymentDetail
      },
    },
  });

  const items = students.map((s) => {
    const nombreCompleto = `${s.lastNameFather} ${s.lastNameMother} ${s.firstName}`.trim();

    const pagosPorMes: Record<number, any> = {};
    // Por defecto: no registrado
    for (let i = 0; i < 12; i++) {
      pagosPorMes[i] = { total: 80, pagos: [], noRegistrado: true }; // puedes ajustar defaultTotal
    }

    for (const p of s.payments) {
      const idx = month1toIndex(p.month);
      pagosPorMes[idx] = {
        total: p.total,
        pagos: p.paid.map((d) => ({
          date: d.date.toISOString().slice(0, 10),
          amount: d.amount,
        })),
        noRegistrado: p.status === "NO_REGISTRADO",
      };
    }

    return {
      id: s.id,
      nombreCompleto,
      tutor: s.tutor ?? "",
      status: s.status, // por si quieres mostrar badge
      pagosPorMes,
    };
  });

  return NextResponse.json({ items });
}
