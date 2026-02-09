import { NextResponse } from "next/server";
import { prisma } from "@/src/shared/db/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  const where: any = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { period: { contains: q, mode: "insensitive" } },
      // si el usuario busca por año en texto
      ...(Number.isFinite(Number(q)) ? [{ year: Number(q) }] : []),
    ];
  }

  const items = await prisma.academicCycle.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      year: true,
      period: true,
      startDate: true,
      endDate: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ items });
}
