import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: actividadId } = await ctx.params;
  const body = await req.json();
  const studentId = String(body.studentId ?? "").trim();

  if (!actividadId || !studentId) {
    return NextResponse.json({ message: "actividadId y studentId son requeridos" }, { status: 400 });
  }

  try {
    const created = await prisma.studentActividad.create({
      data: { actividadId, studentId },
      select: { id: true, createdAt: true, studentId: true, actividadId: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    // @@unique([studentId, actividadId]) => si ya existe
    return NextResponse.json(
      { message: "El estudiante ya está asignado a este nivel" },
      { status: 409 }
    );
  }
}
