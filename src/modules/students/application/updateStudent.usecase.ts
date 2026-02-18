import type { StudentRepository, StudentRecord } from "../domain/student.repository";
import { normalizeStudentUpdate } from "../domain/student.rules";
import { UpdateStudentDTO } from "./dtos/student.dto";

export class UpdateStudentUseCase {
  constructor(private readonly repo: StudentRepository) {}

  async execute(id: string, dto: UpdateStudentDTO): Promise<StudentRecord> {
    if (!id?.trim()) throw new Error("id requerido");
    const input = normalizeStudentUpdate(dto);
    return this.repo.update(id.trim(), input);
  }
}
