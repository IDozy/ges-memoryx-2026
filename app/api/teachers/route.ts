import { NextResponse } from "next/server";
import { PrismaTeacherRepository } from "@/src/modules/teachers/infrastructure/teacher.repo";
import { CreateTeacherUseCase } from "@/src/modules/teachers/application/createTeacher.usecase";
import { SearchTeachersUseCase } from "@/src/modules/teachers/application/searchTeachers.usecase";

const repo = new PrismaTeacherRepository();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") ?? "").trim();
  const status = (searchParams.get("status") ?? "").trim();
  const department = (searchParams.get("department") ?? "").trim();

  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "200");

  const uc = new SearchTeachersUseCase(repo);
  const result = await uc.execute({ q, status, page, pageSize });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const uc = new CreateTeacherUseCase(repo);
    const created = await uc.execute(body);

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error" }, { status: 400 });
  }
}
