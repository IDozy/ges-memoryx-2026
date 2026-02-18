import { CreateStudentDTO, UpdateStudentDTO } from "../application/dtos/student.dto";


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

export type StudentListResult = {
  items: StudentRecord[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
};

export interface StudentRepository {
  // Crea Student + User(StudentProfile) + opcional Parent(User+ParentProfile+Relation)
  createWithAccounts(input: CreateStudentDTO): Promise<StudentRecord>;
  list(params: { q?: string; status?: string; page: number; pageSize: number }): Promise<StudentListResult>;
  getById(id: string): Promise<StudentRecord | null>;
  update(id: string, input: UpdateStudentDTO): Promise<StudentRecord>;
  delete(id: string): Promise<void>;
}
