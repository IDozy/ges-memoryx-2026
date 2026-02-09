import { NextResponse } from "next/server";
import { prisma } from "@/src/shared/db/prisma";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  if (!id) return NextResponse.json({ message: "Falta id" }, { status: 400 });

  const level = await prisma.actividad.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      tipo: true,
      cicloId: true,
      createdAt: true,
      estudiantes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,              // id de StudentActividad (para borrar rápido)
          createdAt: true,       // fecha de asignación
          student: {
            select: {
              id: true,
              firstName: true,
              lastNameFather: true,
              lastNameMother: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!level) return NextResponse.json({ message: "Nivel no encontrado" }, { status: 404 });

  return NextResponse.json({ level });
}
