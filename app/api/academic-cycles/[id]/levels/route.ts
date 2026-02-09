import { NextResponse } from "next/server";
import { prisma } from "@/src/shared/db/prisma";

export const runtime = "nodejs";

type Body = {
  nombre?: string;
  tipo?: "NIVEL" | "TALLER";
  gradeLevel?: string; // opcional
  createDefaultSection?: boolean; // opcional (default true)
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

    // validar ciclo
    const ciclo = await prisma.academicCycle.findUnique({
      where: { id },
      select: { id: true, year: true },
    });
    if (!ciclo) {
      return NextResponse.json({ message: "Ciclo no encontrado" }, { status: 404 });
    }

    const courseType = tipo === "TALLER" ? "WORKSHOP" : "REGULAR";

    // code único mínimo: CRS-YYYY-xxxxxx (basado en uuid del course)
    // Creamos primero el course con id autogenerado para usarlo en el code
    const createdCourse = await prisma.course.create({
      data: {
        name: nombre,
        courseType,
        gradeLevel: body.gradeLevel ? String(body.gradeLevel).trim() : "N/A",
        credits: 0,
        status: "ACTIVE",
        cycleId: id,
        // code lo llenamos después para que sea único y bonito
        code: "TEMP",
      },
      select: { id: true, name: true, courseType: true, createdAt: true, cycleId: true },
    });

    const code = `CRS-${ciclo.year}-${createdCourse.id.replace(/-/g, "").slice(-6).toUpperCase()}`;

    const course = await prisma.course.update({
      where: { id: createdCourse.id },
      data: { code },
      select: { id: true, name: true, code: true, courseType: true, createdAt: true },
    });

    // (opcional) crear sección default "A" para matricular y programar sesiones
    const createDefaultSection = body.createDefaultSection ?? true;

    let section: { id: string; name: string; sectionCode: string } | null = null;

    if (createDefaultSection) {
      section = await prisma.classSection.create({
        data: {
          name: "A",
          sectionCode: `SEC-${ciclo.year}-${course.id.replace(/-/g, "").slice(-6).toUpperCase()}`,
          courseId: course.id,
          cycleId: id,
          maxCapacity: 30,
          currentEnrollment: 0,
          status: "ACTIVE",
        },
        select: { id: true, name: true, sectionCode: true },
      });
    }

    // Compat con frontend viejo: actividad {nombre, tipo}
    return NextResponse.json(
      {
        actividad: {
          id: course.id,
          nombre: course.name,
          tipo: tipo, // NIVEL/TALLER
          createdAt: course.createdAt,
          code: course.code,
          section, // si se creó
        },
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("[CYCLE_ACTIVITIES_POST]", e);
    return NextResponse.json(
      { message: e?.message ?? "Error creando actividad" },
      { status: 500 }
    );
  }
}
