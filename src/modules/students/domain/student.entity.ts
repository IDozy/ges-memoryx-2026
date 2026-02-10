import type { $Enums } from "@/src/generated/prisma";
import { normalizeStudentStatus } from "./student.rules";

export type StudentProps = {
  id?: string;
  studentCode?: string;

  firstName: string;
  lastNameFather: string;
  lastNameMother: string;

  phone?: string | null;
  birthDate?: Date | null;
  gender?: $Enums.Gender | null;
  grade?: string | null;
  school?: string | null;
  status?: $Enums.StudentStatus;
};

export class StudentEntity {
  constructor(private readonly props: Required<Omit<StudentProps, "id" | "studentCode">> & Pick<StudentProps, "id" | "studentCode">) {}

  static create(input: StudentProps): StudentEntity {
    const firstName = input.firstName.trim();
    const lastNameFather = input.lastNameFather.trim();
    const lastNameMother = input.lastNameMother.trim();

    if (!firstName || !lastNameFather || !lastNameMother) {
      throw new Error("Nombre y apellidos son obligatorios");
    }

    return new StudentEntity({
      id: input.id,
      studentCode: input.studentCode,
      firstName,
      lastNameFather,
      lastNameMother,
      phone: input.phone ?? null,
      birthDate: input.birthDate ?? null,
      gender: input.gender ?? null,
      grade: input.grade ?? null,
      school: input.school ?? null,
      status: input.status ?? normalizeStudentStatus("ACTIVE"),
    });
  }

  fullName() {
    const { firstName, lastNameFather, lastNameMother } = this.props;
    return `${firstName} ${lastNameFather} ${lastNameMother}`.replace(/\s+/g, " ").trim();
  }
}
