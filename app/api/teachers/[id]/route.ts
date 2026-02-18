// app/api/teachers/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaTeacherRepository } from "@/src/modules/teachers/infrastructure/teacher.repo";
import { UpdateTeacherUseCase } from "@/src/modules/teachers/application/updateTeacher.usecase";
import { GetTeacherUseCase } from "@/src/modules/teachers/application/getTeacher.usecase";
import { DeleteTeacherUseCase } from "@/src/modules/teachers/application/deleteTeacher.usecase";

const repo = new PrismaTeacherRepository();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;          // ✅
    const body = await req.json();
    const uc = new UpdateTeacherUseCase(repo);
    const updated = await uc.execute(id, body);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error" }, { status: 400 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;          // ✅
    const uc = new GetTeacherUseCase(repo);
    const teacher = await uc.execute(id);
    return NextResponse.json(teacher);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;          // ✅
    const uc = new DeleteTeacherUseCase(repo);
    await uc.execute(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error" }, { status: 400 });
  }
}
