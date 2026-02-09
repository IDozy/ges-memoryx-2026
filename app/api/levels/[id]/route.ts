import { NextResponse } from "next/server";
import { prisma } from "@/src/shared/db/prisma";

type Body = {
  nombre?: string;
  tipo?: "NIVEL" | "TALLER";
};

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    const body = (await req.json().catch(() => ({}))) as Body;
    const nombre = String(body.nombre ?? "").trim();
    const tipo = body.tipo;

    if (!nombre) {
      return NextResponse.json({ message: "nombre es requerido" }, { status: 400 });
    }

    if (tipo !== "NIVEL" && tipo !== "TALLER") {
      return NextResponse.json(
        { message: "tipo es requerido y debe ser NIVEL o TALLER" },
        { status: 400 }
      );
    }

    const updated = await prisma.actividad.update({
      where: { id },
      data: { nombre, tipo },
      select: { id: true, nombre: true, tipo: true, createdAt: true },
    });

    return NextResponse.json({ actividad: updated });
  } catch (e: any) {
    console.error("[ACTIVITY_PATCH]", e);

    // Prisma: record not found
    if (e?.code === "P2025") {
      return NextResponse.json({ message: "Actividad no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ message: "Error actualizando actividad" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    await prisma.actividad.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[ACTIVITY_DELETE]", e);

    // En muchos casos, si hay relaciones (FK) fallará.
    return NextResponse.json(
      { message: "No se pudo eliminar. Puede tener estudiantes asociados." },
      { status: 409 }
    );
  }
}
