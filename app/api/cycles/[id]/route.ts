import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function PATCH(req: Request,  ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const nombre = String(body.nombre ?? "").trim();

  if (!nombre) {
    return NextResponse.json({ message: "nombre es requerido" }, { status: 400 });
  }

  try {
    const updated = await prisma.ciclo.update({
      where: { id },
      data: { nombre },
      select: { id: true, nombre: true, createdAt: true },
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { message: "No se pudo actualizar (¿nombre duplicado?)" },
      { status: 409 }
    );
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  // Si ya tienes payments/receipts ligados al ciclo, esto puede fallar por FK.
  // En ese caso, en vez de borrar, podrías "archivar" con un campo isActive.
  try {
    await prisma.ciclo.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { message: "No se pudo eliminar. Puede tener datos relacionados." },
      { status: 409 }
    );
  }
}
