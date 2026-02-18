import type { TeacherRepository } from "../domain/teacher.repository";
import { TeacherEntity } from "../domain/teacher.entity";
import { normalizeUserStatus, safeDate } from "../domain/teacher.rules";
import { assertCreateTeacherDTO, CreateTeacherDTO } from "./dtos/teacher.dto";

export class CreateTeacherUseCase {
  constructor(private readonly repo: TeacherRepository) {}

  async execute(input: unknown) {
    assertCreateTeacherDTO(input);
    const dto = input as CreateTeacherDTO;

    const entity = TeacherEntity.create({
    
      status: normalizeUserStatus(dto.status),
      firstName: dto.firstName?.trim() || null,
      lastName: dto.lastName?.trim() || null,
      phone: dto.phone?.trim() || null,
      specialty: dto.specialty?.trim() || null,
      department: dto.department?.trim() || null,
      hireDate: safeDate(dto.hireDate),
    });

    // Crea User + asigna rol TEACHER + crea TeacherProfile
    return this.repo.createWithAccount(entity);
  }
}
