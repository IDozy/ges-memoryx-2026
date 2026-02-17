import type { StudentRepository, StudentListResult } from "../domain/student.repository";

export class SearchStudentsUseCase {
  constructor(private readonly repo: StudentRepository) {}

  async execute(params: { q?: string; status?: string; page: number; pageSize: number }): Promise<StudentListResult> {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(500, Math.max(5, Number(params.pageSize ?? 10)));

    return this.repo.list({
      q: params.q?.trim() || undefined,
      status: params.status?.trim() || undefined,
      page,
      pageSize,
    });
  }
}
