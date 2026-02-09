import { NextResponse } from "next/server";
import { prisma } from "@/src/shared/db/prisma";

type Body = {
  nombre?: string;
  tipo?: "NIVEL" | "TALLER";
};

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
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

    // (opcional pero recomendado) validar que el ciclo exista
    const ciclo = await prisma.ciclo.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!ciclo) {
      return NextResponse.json({ message: "Ciclo no encontrado" }, { status: 404 });
    }

    const created = await prisma.actividad.create({
      data: {
        nombre,
        tipo,      // 👈 ahora viene del body
        cicloId: id,
      },
      select: { id: true, nombre: true, tipo: true, createdAt: true },
    });

    return NextResponse.json({ actividad: created }, { status: 201 });
  } catch (e) {
    console.error("[CYCLE_ACTIVITIES_POST]", e);
    return NextResponse.json({ message: "Error creando actividad" }, { status: 500 });
  }
}
