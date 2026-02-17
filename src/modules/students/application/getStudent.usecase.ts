// src/modules/students/application/getStudent.usecase.ts
import type { StudentRepository, StudentRecord } from "../domain/student.repository";

export class GetStudentUseCase {
  constructor(private readonly repo: StudentRepository) {}

  async execute(id: string): Promise<StudentRecord> {
    if (!id?.trim()) throw new Error("id requerido");
    const student = await this.repo.getById(id.trim());
    if (!student) throw new Error("Estudiante no encontrado");
    return student;
  }
}
