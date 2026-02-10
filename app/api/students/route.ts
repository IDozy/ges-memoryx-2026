import { NextResponse } from "next/server";
import { PrismaStudentRepository } from "@/src/modules/students/infrastructure/student.repo";
import { CreateStudentUseCase } from "@/src/modules/students/application/createStudent.usecase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const uc = new CreateStudentUseCase(new PrismaStudentRepository());
    const created = await uc.execute(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Error" }, { status: 400 });
  }
}
