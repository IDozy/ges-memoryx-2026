import type { CreateStudentDTO } from "./dtos/create-student.dto";
import { assertCreateStudentDTO } from "./dtos/create-student.dto";
import type { StudentRepository } from "../domain/student.repository";
import { StudentEntity } from "../domain/student.entity";
import { normalizeGender, normalizeStudentStatus, safeDate } from "../domain/student.rules";

export class CreateStudentUseCase {
  constructor(private readonly repo: StudentRepository) {}

  
  async execute(input: unknown) {
    assertCreateStudentDTO(input);
    const dto = input as CreateStudentDTO;

    const now = new Date();
   
    StudentEntity.create({
      firstName: dto.firstName,
      lastNameFather: dto.lastNameFather,
      lastNameMother: dto.lastNameMother,
      phone: dto.phone ?? null,
      birthDate: safeDate(dto.birthDate),
      gender: normalizeGender(dto.gender),
      grade: dto.grade ?? null,
      school: dto.school ?? null,
      status: normalizeStudentStatus(dto.status),
    });

    return this.repo.createWithAccounts(dto);
  }
  
}
