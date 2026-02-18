export type TeacherEstado = "activo" | "inactivo" | "suspendido" | "bloqueado";

export type Teacher = {
  id: string;     // TeacherProfile.id
  userId: string; // User.id

  email: string;
  nombres: string;
  apellidos: string;
  telefono: string;

  employeeCode: string;
  especialidad: string;
  departamento: string;
  fechaIngreso: string; // YYYY-MM-DD

  estado: TeacherEstado;
};

export type CreateTeacherPayload = {
  // user
  email: string;
  password?: string; // opcional si luego harás reset o temp
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "LOCKED";

  // teacherProfile
  employeeCode?: string; // si lo generas, puede omitirse
  specialty?: string | null;
  department?: string | null;
  hireDate?: string | null; // ISO
};

export type UpdateTeacherPayload = Partial<CreateTeacherPayload>;
