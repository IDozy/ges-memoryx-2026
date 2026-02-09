import { NextResponse } from "next/server";
import { prisma } from "@/src/shared/db/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  if (!id) {
    return NextResponse.json(
      { message: "ID no llegó en params" },
      { status: 400 }
    );
  }

  const ciclo = await prisma.academicCycle.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      createdAt: true,

      // antes: actividades → ahora: courses
      courses: {
        select: { id: true, name: true, courseType: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ciclo) {
    return NextResponse.json({ message: "Ciclo no encontrado" }, { status: 404 });
  }

  // Compat con tu frontend viejo (actividades: { nombre, tipo })
  const actividades = ciclo.courses.map((c) => ({
    id: c.id,
    nombre: c.name,
    tipo: c.courseType === "WORKSHOP" ? "TALLER" : "NIVEL",
    createdAt: c.createdAt,
  }));

  return NextResponse.json({
    ciclo: {
      id: ciclo.id,
      name: ciclo.name,
      nombre: ciclo.name, // compat
      createdAt: ciclo.createdAt,
      actividades,        // compat
    },
  });
}
