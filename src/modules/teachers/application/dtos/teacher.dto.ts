import type { UserStatus } from "../../domain/teacher.repository";

export type CreateTeacherDTO = {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  status?: UserStatus | string;
  specialty?: string | null;
  department?: string | null;
  hireDate?: string | Date | null; // ISO o Date
};

export type UpdateTeacherDTO = Partial<CreateTeacherDTO>;

export function assertCreateTeacherDTO(input: unknown): asserts input is CreateTeacherDTO {
  if (!input || typeof input !== "object") throw new Error("Body inválido");
  const dto = input as any;

 

  // Si quieres requerir employeeCode sí o sí, activa:
  // if (!dto.employeeCode || typeof dto.employeeCode !== "string" || !dto.employeeCode.trim()) {
  //   throw new Error("employeeCode requerido");
  // }
}
