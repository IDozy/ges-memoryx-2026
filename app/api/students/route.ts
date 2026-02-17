import { NextResponse } from "next/server";
import { PrismaStudentRepository } from "@/src/modules/students/infrastructure/student.repo";
import { CreateStudentUseCase } from "@/src/modules/students/application/createStudent.usecase";
import { SearchStudentsUseCase } from "@/src/modules/students/application/searchStudents.usecase";


const repo = new PrismaStudentRepository();


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const status = (searchParams.get("status") ?? "").trim();
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "200");
  const uc = new SearchStudentsUseCase(repo);
  const result = await uc.execute({ q, status, page, pageSize });
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const uc = new CreateStudentUseCase(repo);
    const created = await uc.execute(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error" }, { status: 400 });
  }
}
