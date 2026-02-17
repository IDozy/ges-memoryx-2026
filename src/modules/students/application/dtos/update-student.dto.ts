export type UpdateStudentDTO = {
  firstName?: string;
  lastNameFather?: string;
  lastNameMother?: string;
  phone?: string | null;
  birthDate?: string | null;
  gender?: "M" | "F" | "OTHER" | null;
  grade?: string | null;
  school?: string | null;
  status?: string; // ACTIVO/RETIRADO o ACTIVE/WITHDRAWN etc (tu normalizador lo adapta)
  tutor?: string | null; // si luego lo agregas al schema, por ahora no se guarda
};
