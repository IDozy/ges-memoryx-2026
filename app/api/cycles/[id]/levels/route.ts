import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const nombre = String(body.nombre ?? "").trim();

  if (!nombre) {
    return NextResponse.json({ message: "nombre es requerido" }, { status: 400 });
  }

  const created = await prisma.actividad.create({
    data: {
      nombre,
      tipo: "NIVEL",
      cicloId: id,
    },
    select: { id: true, nombre: true, createdAt: true },
  });

  return NextResponse.json(created, { status: 201 });
}
