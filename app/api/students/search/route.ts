import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const status = (searchParams.get("status") ?? "ACTIVO").trim(); // ACTIVO | RETIRADO | ""

  const where: any = {};
  if (status) where.status = status;

  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastNameFather: { contains: q, mode: "insensitive" } },
      { lastNameMother: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { tutor: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.student.findMany({
    where,
    orderBy: [{ lastNameFather: "asc" }, { lastNameMother: "asc" }, { firstName: "asc" }],
    take: 30,
    select: {
      id: true,
      firstName: true,
      lastNameFather: true,
      lastNameMother: true,
      status: true,
    },
  });

  return NextResponse.json({ items });
}
