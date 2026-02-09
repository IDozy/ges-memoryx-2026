import { NextResponse } from "next/server";
import { prisma } from "@/src/shared/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const actividadId = (searchParams.get("actividadId") ?? "").trim();

  if (!actividadId) {
    return NextResponse.json({ error: "actividadId es requerido" }, { status: 400 });
  }

  const rows = await prisma.studentActividad.findMany({
    where: { actividadId },
    include: {
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
    orderBy: { createdAt: "asc" },
  });

  // opcional: filtra retirados si quieres
  const students = rows
    .map((r) => r.student)
    .filter((s) => s.status === "ACTIVO");

  return NextResponse.json({ students });
}
