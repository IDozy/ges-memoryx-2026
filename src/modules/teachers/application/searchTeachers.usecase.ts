import type { TeacherRepository, TeacherListResult } from "../domain/teacher.repository";

export class SearchTeachersUseCase {
  constructor(private readonly repo: TeacherRepository) {}

  async execute(params: {
    q?: string;
    status?: string; // ACTIVE/INACTIVE/SUSPENDED/LOCKED
    page: number;
    pageSize: number;
  }): Promise<TeacherListResult> {
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
