import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function monthRange(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return { start, end, month: d.getMonth() + 1, year: d.getFullYear() };
}

type ActivityItem = {
  id: string;
  type: "STUDENT" | "PAYMENT" | "RECEIPT" | "ENROLL";
  title: string;
  subtitle?: string;
  at: string; // ISO
};

export async function GET() {
  try {
    const now = new Date();
    const { start, end, month, year } = monthRange(now);

    // ========= KPIs =========
    const [
      totalStudents,
      activos,
      retirados,
      totalTalleres,
      totalNiveles,
      pagosPendientesMes,
      ingresosMesAgg,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { status: "ACTIVO" } }),
      prisma.student.count({ where: { status: "RETIRADO" } }),

      prisma.actividad.count({ where: { tipo: "TALLER" } }),
      prisma.actividad.count({ where: { tipo: "NIVEL" } }),

      prisma.payment.count({
        where: {
          month,
          year,
          status: { in: ["NO_PAGO", "PENDIENTE"] },
        },
      }),

      prisma.paymentDetail.aggregate({
        _sum: { amount: true },
        where: {
          date: { gte: start, lt: end },
        },
      }),
    ]);

    const ingresosMes = ingresosMesAgg._sum.amount ?? 0;

    // ========= Actividad reciente =========
    // 1) Estudiantes recientes
    const recentStudents = await prisma.student.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastNameFather: true,
        lastNameMother: true,
        createdAt: true,
      },
    });

    // 2) Abonos recientes
    const recentPayments = await prisma.paymentDetail.findMany({
      take: 5,
      orderBy: { date: "desc" },
      select: {
        id: true,
        amount: true,
        date: true,
        payment: {
          select: {
            student: {
              select: { firstName: true, lastNameFather: true, lastNameMother: true },
            },
            cycle: { select: { nombre: true } },
            month: true,
            year: true,
          },
        },
      },
    });

    // 3) Boletas recientes
    const recentReceipts = await prisma.receipt.findMany({
      take: 5,
      orderBy: { issuedAt: "desc" },
      select: {
        id: true,
        receiptNo: true,
        correlativo: true,
        issuedAt: true,
        totalPaid: true,
        student: { select: { firstName: true, lastNameFather: true, lastNameMother: true } },
      },
    });

    // 4) Inscripciones recientes (StudentActividad)
    const recentEnrolls = await prisma.studentActividad.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        student: { select: { firstName: true, lastNameFather: true, lastNameMother: true } },
        actividad: { select: { nombre: true, tipo: true } },
      },
    });

    const activity: ActivityItem[] = [
      ...recentStudents.map((s) => ({
        id: s.id,
        type: "STUDENT" as const,
        title: `Nuevo estudiante: ${s.lastNameFather} ${s.lastNameMother} ${s.firstName}`.trim(),
        subtitle: "Registro creado",
        at: s.createdAt.toISOString(),
      })),

      ...recentPayments.map((p) => {
        const st = p.payment.student;
        return {
          id: p.id,
          type: "PAYMENT" as const,
          title: `Abono: S/ ${p.amount.toFixed(2)} — ${st.lastNameFather} ${st.lastNameMother} ${st.firstName}`.trim(),
          subtitle: `${p.payment.cycle.nombre} • ${p.payment.month}/${p.payment.year}`,
          at: p.date.toISOString(),
        };
      }),

      ...recentReceipts.map((r) => {
        const st = r.student;
        const code = r.receiptNo ?? `#${String(r.correlativo).padStart(6, "0")}`;
        return {
          id: r.id,
          type: "RECEIPT" as const,
          title: `Boleta emitida ${code} — S/ ${r.totalPaid.toFixed(2)}`,
          subtitle: `${st.lastNameFather} ${st.lastNameMother} ${st.firstName}`.trim(),
          at: r.issuedAt.toISOString(),
        };
      }),

      ...recentEnrolls.map((e) => {
        const st = e.student;
        return {
          id: e.id,
          type: "ENROLL" as const,
          title: `Inscripción: ${st.lastNameFather} ${st.lastNameMother} ${st.firstName}`.trim(),
          subtitle: `${e.actividad.tipo}: ${e.actividad.nombre}`,
          at: e.createdAt.toISOString(),
        };
      }),
    ]
      .sort((a, b) => (a.at < b.at ? 1 : -1))
      .slice(0, 8);

    return NextResponse.json({
      kpis: {
        students: { total: totalStudents, activos, retirados },
        actividades: { talleres: totalTalleres, niveles: totalNiveles },
        pagos: { pendientesMes: pagosPendientesMes, ingresosMes },
        mesActual: { month, year },
      },
      activity,
    });
  } catch (e) {
    console.error("[API_DASHBOARD_GET]", e);
    return NextResponse.json({ message: "Error cargando dashboard" }, { status: 500 });
  }
}
