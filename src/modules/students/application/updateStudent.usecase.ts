import type { StudentRepository, StudentRecord } from "../domain/student.repository";
import type { UpdateStudentDTO } from "./dtos/update-student.dto";
import { normalizeStudentUpdate } from "../domain/student.rules";

export class UpdateStudentUseCase {
  constructor(private readonly repo: StudentRepository) {}

  async execute(id: string, dto: UpdateStudentDTO): Promise<StudentRecord> {
    if (!id?.trim()) throw new Error("id requerido");
    const input = normalizeStudentUpdate(dto);
    return this.repo.update(id.trim(), input);
  }
}
