import type { TeacherRepository, TeacherRecord } from "../domain/teacher.repository";

export class GetTeacherUseCase {
  constructor(private readonly repo: TeacherRepository) {}

  async execute(id: string): Promise<TeacherRecord> {
    if (!id?.trim()) throw new Error("id requerido");
    const teacher = await this.repo.getById(id.trim());
    if (!teacher) throw new Error("Profesor no encontrado");
    return teacher;
  }
}
