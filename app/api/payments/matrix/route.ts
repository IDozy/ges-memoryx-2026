import { NextResponse } from "next/server";
import { prisma } from "@/src/shared/db/prisma";

export const runtime = "nodejs";

function month1toIndex(m: number) {
  return m - 1; // BD 1..12  => UI 0..11
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

  const whereStudent: any = {
    // ✅ solo estudiantes con matrícula en secciones de este ciclo
    sectionEnrollments: {
      some: {
        section: { cycleId },
        status: "ACTIVE", // opcional: solo matrículas activas
      },
    },
  };

  if (q) {
    whereStudent.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastNameFather: { contains: q, mode: "insensitive" } },
      { lastNameMother: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  const students = await prisma.student.findMany({
    where: whereStudent,
    orderBy: [
      { status: "asc" }, // ACTIVE primero normalmente
      { lastNameFather: "asc" },
      { lastNameMother: "asc" },
      { firstName: "asc" },
    ],
    select: {
      id: true,
      firstName: true,
      lastNameFather: true,
      lastNameMother: true,
      status: true,
      phone: true,
      payments: {
        where: { cycleId, year },
        select: {
          month: true,
          total: true,
          status: true,
          details: {
            orderBy: { date: "asc" },
            select: { date: true, amount: true },
          },
        },
      },
    },
  });

  const items = students.map((s) => {
    const nombreCompleto = `${s.lastNameFather} ${s.lastNameMother} ${s.firstName}`.trim();

    const pagosPorMes: Record<number, any> = {};
    for (let i = 0; i < 12; i++) {
      pagosPorMes[i] = { total: 80, pagos: [], noRegistrado: true };
    }

    for (const p of s.payments) {
      const idx = month1toIndex(p.month);
      pagosPorMes[idx] = {
        total: Number(p.total),
        pagos: p.details.map((d) => ({
          date: d.date.toISOString().slice(0, 10),
          amount: Number(d.amount),
        })),
        // ✅ ahora: "no registrado" significa que NO existe Payment.
        // Si existe Payment, entonces ya está registrado:
        noRegistrado: false,
        status: p.status, // por si tu UI lo quiere mostrar
      };
    }

    return {
      id: s.id,
      nombreCompleto,
      status: s.status,
      phone: s.phone ?? "",
      pagosPorMes,
    };
  });

  return NextResponse.json({ items });
}
