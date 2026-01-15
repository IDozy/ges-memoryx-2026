import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function toDate(v: unknown) {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeGender(g: unknown): "M" | "F" | null | undefined {
  if (g === undefined) return undefined; // no actualiza
  if (g === null || g === "") return null;

  const v = String(g).trim().toUpperCase();

  if (v === "M" || v === "MASCULINO" || v === "MALE") return "M";
  if (v === "F" || v === "FEMENINO" || v === "FEMALE") return "F";

  // mejor 400 que 500
  throw new Error(`Valor inválido de gender: "${g}"`);
}

function normalizeStatus(s: unknown): "ACTIVO" | "RETIRADO" | undefined {
  if (s === undefined) return undefined;
  if (s === null || s === "") return undefined;
  const v = String(s).trim().toUpperCase();
  return v === "RETIRADO" ? "RETIRADO" : "ACTIVO";
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    return NextResponse.json({ message: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(student);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  const body = (await req.json().catch(() => ({}))) as any;

  try {
    const updated = await prisma.student.update({
      where: { id },
      data: {
        firstName:
          body.firstName !== undefined ? String(body.firstName).trim() : undefined,
        lastNameFather:
          body.lastNameFather !== undefined
            ? String(body.lastNameFather).trim()
            : undefined,
        lastNameMother:
          body.lastNameMother !== undefined
            ? String(body.lastNameMother).trim()
            : undefined,

        phone:
          body.phone !== undefined
            ? body.phone
              ? String(body.phone).trim()
              : null
            : undefined,

        tutor:
          body.tutor !== undefined
            ? body.tutor
              ? String(body.tutor).trim()
              : null
            : undefined,

        birthDate: body.birthDate !== undefined ? toDate(body.birthDate) : undefined,

        gender: normalizeGender(body.gender),

        grade:
          body.grade !== undefined
            ? body.grade
              ? String(body.grade).trim()
              : null
            : undefined,

        school:
          body.school !== undefined
            ? body.school
              ? String(body.school).trim()
              : null
            : undefined,

        address:
          body.address !== undefined
            ? body.address
              ? String(body.address).trim()
              : null
            : undefined,

        pickupPerson:
          body.pickupPerson !== undefined
            ? body.pickupPerson
              ? String(body.pickupPerson).trim()
              : null
            : undefined,

        status: normalizeStatus(body.status),
      },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    // normalizeGender lanza Error -> devolvemos 400
    const msg = String(e?.message ?? "Error actualizando");
    const isGender = msg.toLowerCase().includes("gender");
    return NextResponse.json(
      { message: msg },
      { status: isGender ? 400 : 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
