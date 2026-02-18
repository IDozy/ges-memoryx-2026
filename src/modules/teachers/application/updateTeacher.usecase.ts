import type { TeacherRepository, TeacherRecord } from "../domain/teacher.repository";
import { normalizeTeacherUpdate } from "../domain/teacher.rules";
import type { UpdateTeacherDTO } from "./dtos/teacher.dto";

export class UpdateTeacherUseCase {
  constructor(private readonly repo: TeacherRepository) {}

  async execute(id: string, dto: UpdateTeacherDTO): Promise<TeacherRecord> {
    if (!id?.trim()) throw new Error("id requerido");
    const input = normalizeTeacherUpdate(dto);
    return this.repo.update(id.trim(), input);
  }
}
