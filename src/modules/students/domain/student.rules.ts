import type { $Enums } from "@/src/generated/prisma";

export function normalizeStudentStatus(v?: unknown): $Enums.StudentStatus {
  const s = String(v ?? "").trim().toUpperCase();
  const map: Record<string, $Enums.StudentStatus> = {
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

export function safeDate(v?: unknown): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function normalizeGender(v?: unknown): $Enums.Gender | null {
  if (v == null) return null;
  const s = String(v).trim().toUpperCase();
  const map: Record<string, $Enums.Gender> = {
    M: "M",
    F: "F",
    OTHER: "OTHER",
    MASCULINO: "M",
    FEMENINO: "F",
    OTRO: "OTHER",
  };
  return map[s] ?? null;
}

export function normalizeText(v?: unknown): string | null {
  const s = String(v ?? "").trim();
  return s ? s : null;
}
