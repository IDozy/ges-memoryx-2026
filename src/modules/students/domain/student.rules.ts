import type { UpdateStudentDTO } from "../application/dtos/update-student.dto";

export function normalizeText(v: unknown) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export function safeDate(v: unknown): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function normalizeGender(v: unknown): "M" | "F" | "OTHER" | null {
  const s = String(v ?? "").trim().toUpperCase();
  if (!s) return null;
  if (s === "M" || s === "MASCULINO") return "M";
  if (s === "F" || s === "FEMENINO") return "F";
  return "OTHER";
}

export function normalizeStudentStatus(v: unknown) {
  const s = String(v ?? "").trim().toUpperCase();
  const map: Record<string, "ACTIVE" | "INACTIVE" | "GRADUATED" | "SUSPENDED" | "WITHDRAWN"> = {
    ACTIVO: "ACTIVE",
    ACTIVE: "ACTIVE",
    INACTIVO: "INACTIVE",
    INACTIVE: "INACTIVE",
    GRADUADO: "GRADUATED",
    GRADUATED: "GRADUATED",
    SUSPENDIDO: "SUSPENDED",
    SUSPENDED: "SUSPENDED",
    RETIRADO: "WITHDRAWN",
    WITHDRAWN: "WITHDRAWN",
  };
  return map[s] ?? "ACTIVE";
}

export function normalizeStudentUpdate(dto: UpdateStudentDTO): UpdateStudentDTO {
  // Normaliza strings y deja undefined si no vino
  const out: UpdateStudentDTO = {};

  if ("firstName" in dto) out.firstName = dto.firstName?.trim();
  if ("lastNameFather" in dto) out.lastNameFather = dto.lastNameFather?.trim();
  if ("lastNameMother" in dto) out.lastNameMother = dto.lastNameMother?.trim();

  if ("phone" in dto) out.phone = normalizeText(dto.phone);
  if ("birthDate" in dto) out.birthDate = dto.birthDate ? String(dto.birthDate) : null;
  if ("gender" in dto) out.gender = dto.gender ?? null;
  if ("grade" in dto) out.grade = normalizeText(dto.grade);
  if ("school" in dto) out.school = normalizeText(dto.school);
  if ("status" in dto) out.status = dto.status ? String(dto.status) : undefined;

  return out;
}
