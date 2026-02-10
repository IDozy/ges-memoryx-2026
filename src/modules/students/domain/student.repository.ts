import type { CreateStudentDTO } from "../application/dtos/create-student.dto";

export type StudentRecord = {
  id: string;
  studentCode: string;
  firstName: string;
  lastNameFather: string;
  lastNameMother: string;
  phone: string | null;
  birthDate: Date | null;
  gender: string | null;
  grade: string | null;
  school: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface StudentRepository {
  createWithAccounts(input: CreateStudentDTO): Promise<StudentRecord>;
}
