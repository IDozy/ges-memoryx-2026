import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cycleId = searchParams.get("cycleId");

    if (!cycleId) {
      return NextResponse.json(
        { message: "cycleId es obligatorio" },
        { status: 400 }
      );
    }

    /**
     * Traemos:
     * - Todos los estudiantes que tengan pagos en el ciclo
     * - Sus talleres
     * - Todos sus pagos del ciclo
     */
    const students = await prisma.student.findMany({
      where: {
        payments: {
          some: {
            cycleId,
          },
        },
      },
      include: {
        actividades: {
          include: {
            actividad: true,
          },
        },
        payments: {
          where: { cycleId },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: {
        lastNameFather: "asc",
      },
    });

    const records = students.map((s) => {
      const pagos = s.payments;

      const totalCuota = pagos.reduce((sum, p) => sum + p.total, 0);
      const totalPagado = pagos.reduce((sum, p) => sum + p.totalPaid, 0);

      const estadoPago =
        totalPagado >= totalCuota && totalCuota > 0
          ? "PAGADO"
          : totalPagado > 0
          ? "PENDIENTE"
          : "NO_PAGO";

      const fechaBase =
        pagos[0]?.createdAt ??
        s.actividades[0]?.createdAt ??
        s.createdAt;

      return {
        id: s.id,
        fecha: fechaBase.toISOString().slice(0, 10),

        apellidosNombres: `${s.lastNameFather} ${s.lastNameMother} ${s.firstName}`.trim(),

        grado: s.grade ?? "",
        fNac: s.birthDate ? s.birthDate.toISOString().slice(0, 10) : "",

        talleres: s.actividades.map((a) => a.actividad.nombre),

        tutor: s.tutor ?? "",
        telefono: s.phone ?? "",
        domicilio: s.address ?? "",

        cuota: totalCuota,

        pagoEstado: estadoPago,

        observacion:
          estadoPago === "PAGADO"
            ? "Ciclo cancelado"
            : estadoPago === "PENDIENTE"
            ? "Pagos parciales"
            : "Sin pagos registrados",
      };
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("[API_RECORD_GET]", error);
    return NextResponse.json(
      { message: "Error obteniendo registros del ciclo" },
      { status: 500 }
    );
  }
}
