import type { $Enums } from "@/src/generated/prisma";

export type ParentRelationship = "father" | "mother" | "guardian" | "tutor";

export type CreateStudentDTO = {
  firstName: string;
  lastNameFather: string;
  lastNameMother: string;

  phone?: string | null;
  birthDate?: string | null; // ISO
  gender?: $Enums.Gender | null; // "M" | "F" | "OTHER"
  grade?: string | null;
  school?: string | null;
  status?: string; // puede venir ACTIVO/RETIRADO etc.

  parent?: {
    firstName: string;
    lastName: string;
    relationship: ParentRelationship;
  };
};

export function assertCreateStudentDTO(input: any): asserts input is CreateStudentDTO {
  if (!input || typeof input !== "object") throw new Error("Payload inválido");

  const firstName = String(input.firstName ?? "").trim();
  const lastNameFather = String(input.lastNameFather ?? "").trim();
  const lastNameMother = String(input.lastNameMother ?? "").trim();
  if (!firstName || !lastNameFather || !lastNameMother) {
    throw new Error("firstName, lastNameFather y lastNameMother son obligatorios");
  }

  if (input.parent) {
    const pf = String(input.parent.firstName ?? "").trim();
    const pl = String(input.parent.lastName ?? "").trim();
    const rel = String(input.parent.relationship ?? "").trim();

    if (!pf || !pl) throw new Error("parent.firstName y parent.lastName son obligatorios");

    const allowed = new Set(["father", "mother", "guardian", "tutor"]);
    if (!allowed.has(rel)) throw new Error("parent.relationship inválido");
  }
}
