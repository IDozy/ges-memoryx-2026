import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";



function toDate(v: unknown) {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const status = (searchParams.get("status") ?? "").trim(); // ACTIVO | RETIRADO | ""
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(5, Number(searchParams.get("pageSize") ?? "10")));
  const skip = (page - 1) * pageSize;

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

  const [total, items] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({
      where,
      orderBy: [{ lastNameFather: "asc" }, { lastNameMother: "asc" }, { firstName: "asc" }],
      skip,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    items,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  // validación mínima
  const firstName = String(body.firstName ?? "").trim();
  const lastNameFather = String(body.lastNameFather ?? "").trim();
  const lastNameMother = String(body.lastNameMother ?? "").trim();

  if (!firstName || !lastNameFather || !lastNameMother) {
    return NextResponse.json(
      { message: "firstName, lastNameFather y lastNameMother son obligatorios" },
      { status: 400 }
    );
  }


  const genderMap: Record<string, "M" | "F"> = {
    MASCULINO: "M",
    FEMENINO: "F",
    M: "M",
    F: "F",
  };


  const genderNormalized = body.gender ? genderMap[String(body.gender).toUpperCase()] : undefined;

  const created = await prisma.student.create({
    data: {
      firstName,
      lastNameFather,
      lastNameMother,
      phone: body.phone ? String(body.phone).trim() : null,
      tutor: body.tutor ? String(body.tutor).trim() : null,
      birthDate: toDate(body.birthDate),
      gender: genderNormalized, // "M" | "F" si usas enum
      grade: body.grade ? String(body.grade).trim() : null,
      school: body.school ? String(body.school).trim() : null,
      address: body.address ? String(body.address).trim() : null,
      pickupPerson: body.pickupPerson ? String(body.pickupPerson).trim() : null,
      status: body.status ?? "ACTIVO",
    },
  });

  return NextResponse.json(created, { status: 201 });
}
