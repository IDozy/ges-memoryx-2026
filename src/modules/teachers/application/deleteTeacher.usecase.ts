import { TeacherRepository } from "../domain/teacher.repository";

export class DeleteTeacherUseCase {
  constructor(private readonly repo: TeacherRepository) {}

  async execute(id: string, deletedBy?: string) {
    if (!id?.trim()) throw new Error("id requerido");
    await this.repo.delete(id.trim(), deletedBy);
  }
}
