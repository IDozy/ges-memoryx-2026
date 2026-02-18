import { $Enums } from "@/src/generated/prisma";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "LOCKED";

export type TeacherRecord = {
  id: string;
  userId: string;
  employeeCode: string;
  specialty: string | null;
  qualifications: string | null;
  bio: string | null;
  hireDate: Date | null;
  department: string | null;
  createdAt: Date;
  updatedAt: Date;

  user: {
    id: string;
    email: string;
    status: $Enums.UserStatus;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatar: string | null;
  };
};


export type TeacherListResult = {
  items: TeacherRecord[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
};

export type TeacherListParams = {
  q?: string;
  status?: string; // filtra por User.status
  page: number;
  pageSize: number;
};

export type CreateTeacherInput = {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  status: UserStatus;
  specialty: string | null;
  department: string | null;
  hireDate: Date | null;
};

export type UpdateTeacherInput = Partial<CreateTeacherInput>;

export interface TeacherRepository {
  getById(id: string): Promise<TeacherRecord | null>;
  list(params: TeacherListParams): Promise<TeacherListResult>;
  createWithAccount(input: CreateTeacherInput): Promise<TeacherRecord>;
  update(id: string, input: UpdateTeacherInput): Promise<TeacherRecord>;
  delete(id: string, deletedBy?: string): Promise<void>;
}
