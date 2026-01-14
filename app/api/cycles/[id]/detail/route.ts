import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(
  _req: Request,
 ctx: { params: Promise<{ id: string }> }
) {
  const {id} = await ctx.params;

  if (!id) {
    return NextResponse.json(
      { message: "ID no llegó en params", ctx },
      { status: 400 }
    );
  }

  const ciclo = await prisma.ciclo.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      createdAt: true,
      actividades: {
        where: { tipo: "NIVEL" },
        orderBy: { createdAt: "asc" },
        select: { id: true, nombre: true, createdAt: true },
      },
    },
  });

  if (!ciclo) {
    return NextResponse.json({ message: "Ciclo no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ciclo });
}
