// src/components/teachers/types.ts

export type TeacherEstado = "activo" | "inactivo" | "suspendido" | "bloqueado";

/**
 * UI model (lo que usa la tabla + modal)
 * - id: TeacherProfile.id
 * - userId: User.id (para acciones tipo reset password, etc.)
 */
export type Teacher = {
  id: string;
  userId: string;

  // User
  email: string;
  nombres: string;
  apellidos: string;
  telefono: string;

  // TeacherProfile
  employeeCode: string;
  especialidad: string;
  departamento: string;
  fechaIngreso: string; // YYYY-MM-DD

  estado: TeacherEstado;
};

/**
 * Payload para CREATE (API)
 * Basado en tu schema:
 * - User: email, hashedPassword (lo crea backend), status, firstName, lastName, phone
 * - TeacherProfile: employeeCode, specialty, department, hireDate
 *
 * ✅ Nota: hashedPassword NO se envía desde el front.
 * ✅ Si employeeCode lo generas en backend/trigger, puedes hacerlo opcional.
 */
export type CreateTeacherPayload = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;

  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "LOCKED";

  employeeCode?: string; // opcional si se autogenera
  specialty?: string | null;
  department?: string | null;
  hireDate?: string | null; // ISO (Date.toISOString())
};

/**
 * Payload para UPDATE (API)
 * Normalmente PATCH parcial.
 */
export type UpdateTeacherPayload = Partial<CreateTeacherPayload>;
