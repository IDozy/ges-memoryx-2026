import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  const where: any = {};
  if (q) {
    where.nombre = { contains: q, mode: "insensitive" };
  }

  const items = await prisma.ciclo.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: { id: true, nombre: true, createdAt: true },
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const body = await req.json();
  const nombre = String(body.nombre ?? "").trim();

  if (!nombre) {
    return NextResponse.json({ message: "nombre es requerido" }, { status: 400 });
  }

  try {
    const created = await prisma.ciclo.create({
      data: { nombre },
      select: { id: true, nombre: true, createdAt: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    // unique constraint (nombre @unique)
    return NextResponse.json(
      { message: "Ya existe un ciclo con ese nombre" },
      { status: 409 }
    );
  }
}
