import type { CreateStudentDTO } from "../application/dtos/create-student.dto";
import type { UpdateStudentDTO } from "../application/dtos/update-student.dto";

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

  // Para tu tabla (paginado + filtro)
  list(params: { q?: string; status?: string; page: number; pageSize: number }): Promise<StudentListResult>;

  // Para editar/detalle
  getById(id: string): Promise<StudentRecord | null>;

  // Para PATCH
  update(id: string, input: UpdateStudentDTO): Promise<StudentRecord>;

  // Para DELETE
  delete(id: string): Promise<void>;
}
