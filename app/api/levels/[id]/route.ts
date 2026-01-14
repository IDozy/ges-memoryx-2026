import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params; 
  const body = await req.json();
  const nombre = String(body.nombre ?? "").trim();

  if (!nombre) {
    return NextResponse.json({ message: "nombre es requerido" }, { status: 400 });
  }

  const updated = await prisma.actividad.update({
    where: { id },
    data: { nombre },
    select: { id: true, nombre: true, createdAt: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params; 
  try {
    await prisma.actividad.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { message: "No se pudo eliminar. Puede tener estudiantes asociados." },
      { status: 409 }
    );
  }
}
