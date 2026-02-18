import type { $Enums } from "@/src/generated/prisma";

/* =====================
 * Enums / Types
 * ===================== */

export type ParentRelationship = "father" | "mother" | "guardian" | "tutor";

export type ParentDTO = {
  firstName: string;
  lastName: string;
  relationship: ParentRelationship;
};

/* =====================
 * Base DTO
 * ===================== */

export type BaseStudentDTO = {
  firstName?: string;
  lastNameFather?: string;
  lastNameMother?: string;

  phone?: string | null;
  birthDate?: string | null; // ISO
  gender?: $Enums.Gender | null;
  grade?: string | null;
  school?: string | null;
  status?: string;
};

/* =====================
 * Create DTO
 * ===================== */

export type CreateStudentDTO = BaseStudentDTO & {
  firstName: string;
  lastNameFather: string;
  lastNameMother: string;
  parent?: ParentDTO;
};

/* =====================
 * Update DTO
 * ===================== */

export type UpdateStudentDTO = BaseStudentDTO & {
  tutor?: string | null;
};

/* =====================
 * Validators
 * ===================== */

export function assertCreateStudentDTO(input: any): asserts input is CreateStudentDTO {
  if (!input || typeof input !== "object") {
    throw new Error("Payload inválido");
  }

  const firstName = String(input.firstName ?? "").trim();
  const lastNameFather = String(input.lastNameFather ?? "").trim();
  const lastNameMother = String(input.lastNameMother ?? "").trim();

  if (!firstName || !lastNameFather || !lastNameMother) {
    throw new Error("firstName, lastNameFather y lastNameMother son obligatorios");
  }

  if (input.parent) {
    const { firstName, lastName, relationship } = input.parent;

    if (!String(firstName ?? "").trim() || !String(lastName ?? "").trim()) {
      throw new Error("parent.firstName y parent.lastName son obligatorios");
    }

    const allowed: ParentRelationship[] = ["father", "mother", "guardian", "tutor"];
    if (!allowed.includes(relationship)) {
      throw new Error("parent.relationship inválido");
    }
  }
}
