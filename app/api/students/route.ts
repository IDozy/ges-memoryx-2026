import { NextResponse } from "next/server";
import { prisma } from "@/src/shared/db/prisma";

export const runtime = "nodejs";

function toDate(v: unknown) {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeStudentStatus(v: unknown) {
  const s = String(v ?? "").trim().toUpperCase();
  const map: Record<string, "ACTIVE" | "INACTIVE" | "GRADUATED" | "SUSPENDED" | "WITHDRAWN"> = {
    ACTIVO: "ACTIVE",
    ACTIVE: "ACTIVE",
    INACTIVO: "INACTIVE",
    INACTIVE: "INACTIVE",
    GRADUADO: "GRADUATED",
    GRADUATED: "GRADUATED",
    SUSPENDIDO: "SUSPENDED",
    SUSPENDED: "SUSPENDED",
    RETIRADO: "WITHDRAWN",
    WITHDRAWN: "WITHDRAWN",
  };
  return map[s] ?? "ACTIVE";
}

async function generateStudentCode() {
  const year = new Date().getFullYear();
  // correlativo simple por año (suficiente para tu caso actual)
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const count = await prisma.student.count({
    where: { createdAt: { gte: start, lt: end } },
  });

  return `STU-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const status = (searchParams.get("status") ?? "").trim(); // puede venir ACTIVO/RETIRADO o ACTIVE/WITHDRAWN
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(500, Math.max(5, Number(searchParams.get("pageSize") ?? "10")));
  const skip = (page - 1) * pageSize;

  const where: any = {};

  if (status) where.status = normalizeStudentStatus(status);

  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastNameFather: { contains: q, mode: "insensitive" } },
      { lastNameMother: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({
      where,
      orderBy: [
        { status: "asc" },
        { lastNameFather: "asc" },
        { lastNameMother: "asc" },
        { firstName: "asc" },
      ],
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
  try {
    const body = await req.json();

    const firstName = String(body.firstName ?? "").trim();
    const lastNameFather = String(body.lastNameFather ?? "").trim();
    const lastNameMother = String(body.lastNameMother ?? "").trim();

    if (!firstName || !lastNameFather || !lastNameMother) {
      return NextResponse.json(
        { message: "firstName, lastNameFather y lastNameMother son obligatorios" },
        { status: 400 }
      );
    }

    const genderMap: Record<string, "M" | "F" | "OTHER"> = {
      MASCULINO: "M",
      FEMENINO: "F",
      OTRO: "OTHER",
      M: "M",
      F: "F",
      OTHER: "OTHER",
    };
    const genderNormalized = body.gender
      ? genderMap[String(body.gender).toUpperCase()]
      : undefined;

    const statusNormalized = normalizeStudentStatus(body.status);

    const studentCode = await generateStudentCode();

    const created = await prisma.student.create({
      data: {
        studentCode,
        firstName,
        lastNameFather,
        lastNameMother,
        phone: body.phone ? String(body.phone).trim() : null,
        birthDate: toDate(body.birthDate),
        gender: genderNormalized,
        grade: body.grade ? String(body.grade).trim() : null,
        school: body.school ? String(body.school).trim() : null,
        address: body.address ? String(body.address).trim() : null,
        pickupPerson: body.pickupPerson ? String(body.pickupPerson).trim() : null,
        status: statusNormalized,
        nationality: body.nationality ? String(body.nationality).trim() : null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error("[API_STUDENTS_POST]", e);
    return NextResponse.json(
      { message: e?.message, code: e?.code, meta: e?.meta },
      { status: 500 }
    );
  }
}
