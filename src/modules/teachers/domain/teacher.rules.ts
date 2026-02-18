import type { UserStatus, UpdateTeacherInput } from "./teacher.repository";
import type { UpdateTeacherDTO } from "../application/dtos/teacher.dto";

export function normalizeUserStatus(v: unknown): UserStatus {
  const s = String(v ?? "ACTIVE").toUpperCase();

  if (s === "ACTIVE" || s === "INACTIVE" || s === "SUSPENDED" || s === "LOCKED") {
    return s as UserStatus;
  }

  return "ACTIVE";
}

export function safeDate(v: unknown): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function normalizeText(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

export function normalizeTeacherUpdate(dto: UpdateTeacherDTO): UpdateTeacherInput {
  const out: UpdateTeacherInput = {};

  if (dto.firstName !== undefined) out.firstName = normalizeText(dto.firstName);
  if (dto.lastName !== undefined) out.lastName = normalizeText(dto.lastName);
  if (dto.phone !== undefined) out.phone = normalizeText(dto.phone);
  if (dto.status !== undefined) out.status = normalizeUserStatus(dto.status);
  if (dto.specialty !== undefined) out.specialty = normalizeText(dto.specialty);
  if (dto.department !== undefined) out.department = normalizeText(dto.department);
  if (dto.hireDate !== undefined) out.hireDate = safeDate(dto.hireDate);

  return out;
}
