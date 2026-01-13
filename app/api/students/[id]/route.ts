import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function toDate(v: unknown) {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

type Ctx = { params: { id: string } } | { params: Promise<{ id: string }> };

async function getId(ctx: Ctx) {
  const params = await (ctx as any).params;
  return params?.id as string | undefined;
}


export async function GET(_: Request, { params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({ where: { id: params.id } });
  if (!student) return NextResponse.json({ message: "No encontrado" }, { status: 404 });
  return NextResponse.json(student);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const id = await getId(ctx);

  if (!id) {
    return NextResponse.json(
      { message: "Falta el parámetro id en la ruta (/api/students/[id])" },
      { status: 400 }
    );
  }
  const body = await req.json();

  const normalizeGender = (g: any) => {
    if (g === undefined) return undefined; // no lo actualiza
    if (g === null || g === "") return null; // si tu schema permite null
    const v = String(g).trim().toUpperCase();

    // AJUSTA según tu enum real:
    if (v === "M" || v === "MASCULINO" || v === "MALE") return "M";
    if (v === "F" || v === "FEMENINO" || v === "FEMALE") return "F";

    // Si no coincide, mejor 400 en vez de 500:
    throw new Error(`Valor inválido de gender: "${g}"`);
  };


  const updated = await prisma.student.update({
    where: { id },
    data: {
      firstName: body.firstName !== undefined ? String(body.firstName).trim() : undefined,
      lastNameFather: body.lastNameFather !== undefined ? String(body.lastNameFather).trim() : undefined,
      lastNameMother: body.lastNameMother !== undefined ? String(body.lastNameMother).trim() : undefined,

      phone: body.phone !== undefined ? (body.phone ? String(body.phone).trim() : null) : undefined,
      tutor: body.tutor !== undefined ? (body.tutor ? String(body.tutor).trim() : null) : undefined,
      birthDate: body.birthDate !== undefined ? toDate(body.birthDate) : undefined,
      gender:  normalizeGender(body.gender),

      grade: body.grade !== undefined ? (body.grade ? String(body.grade).trim() : null) : undefined,
      school: body.school !== undefined ? (body.school ? String(body.school).trim() : null) : undefined,
      address: body.address !== undefined ? (body.address ? String(body.address).trim() : null) : undefined,
      pickupPerson: body.pickupPerson !== undefined ? (body.pickupPerson ? String(body.pickupPerson).trim() : null) : undefined,

      status: body.status !== undefined ? body.status : undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  const params = await (ctx.params as any);
  const id = params?.id;

  if (!id) {
    return NextResponse.json(
      { message: "Falta el parámetro id en la ruta" },
      { status: 400 }
    );
  }

  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}