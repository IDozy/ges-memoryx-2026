import { NextResponse } from "next/server";
import { PrismaStudentRepository } from "@/src/modules/students/infrastructure/student.repo";
import { GetStudentUseCase } from "@/src/modules/students/application/getStudent.usecase";
import { UpdateStudentUseCase } from "@/src/modules/students/application/updateStudent.usecase";

const repo = new PrismaStudentRepository();

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const uc = new GetStudentUseCase(repo);
    const student = await uc.execute(id);
    return NextResponse.json(student);
  } catch (e: any) {
    const msg = String(e?.message ?? "Error");
    const code = msg.toLowerCase().includes("no encontrado") ? 404 : 400;
    return NextResponse.json({ message: msg }, { status: code });
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as any;

    const uc = new UpdateStudentUseCase(repo);
    const updated = await uc.execute(id, body);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error actualizando" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await repo.delete(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error eliminando" }, { status: 400 });
  }
}
