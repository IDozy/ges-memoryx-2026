import { prisma } from "@/src/shared/db/prisma";
import type { Prisma, $Enums } from "@/src/generated/prisma";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";


import type { StudentListResult, StudentRecord, StudentRepository } from "../domain/student.repository";
import { normalizeGender, normalizeStudentStatus, normalizeText, safeDate } from "../domain/student.rules";
import { CreateStudentDTO, UpdateStudentDTO } from "../application/dtos/student.dto";



function onlyLettersLower(v: string) { //funcion quita tildes/ñ -> n, y deja solo letras
  return (v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toLowerCase();
}

function yyNow(d = new Date()) {
  // 2026 -> "26"
  return String(d.getFullYear()).slice(-2);
}

function ddmmNow(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}${mm}`; // 10 Feb => "1002"
}

function buildStudentEmail(params: {
  firstName: string;
  lastNameFather: string;
  lastNameMother: string;
  domain?: string;
  now?: Date;
}) {
  const now = params.now ?? new Date();
  const domain = params.domain ?? "memoryx.com";

  const fi = onlyLettersLower(params.firstName).slice(0, 1);
  const lnf = onlyLettersLower(params.lastNameFather);
  const lnmI = onlyLettersLower(params.lastNameMother).slice(0, 1);

  // ahuatayc26_1002@memoryx.com
  return `${fi}${lnf}${lnmI}${yyNow(now)}_${ddmmNow(now)}@${domain}`;
}

function relationshipLetter(rel: string) {
  // para tu UI: father/mother/guardian/tutor
  const v = String(rel ?? "").toLowerCase();
  if (v === "father") return "p"; // padre
  if (v === "mother") return "m"; // madre
  if (v === "guardian") return "g"; // apoderado
  if (v === "tutor") return "t"; // tutor
  return "g";
}

function buildParentEmail(params: {
  studentEmail: string;
  parentFirstName: string;
  relationship: string;
}) {
  const base = params.studentEmail.replace(/@/g, ""); // no, solo para seguridad
  // realmente solo necesitamos la parte antes del @
  const [local, domain] = params.studentEmail.split("@");
  const pi = onlyLettersLower(params.parentFirstName).slice(0, 1);
  const rl = relationshipLetter(params.relationship);

  // ahuatayc26_1002cm@memoryx.com  (c=Carla, m=madre)
  return `${local}${pi}${rl}@${domain}`;
}

async function ensureUniqueEmail(tx: Prisma.TransactionClient, email: string) {
  // si ya existe, agrega sufijo incremental: ...-2@, ...-3@
  const [local, domain] = email.split("@");
  let candidate = email;
  let i = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await tx.user.findUnique({ where: { email: candidate } });
    if (!exists) return candidate;
    candidate = `${local}-${i}@${domain}`;
    i++;
  }
}


async function ensureRole(tx: Prisma.TransactionClient, name: $Enums.UserRoleType) {
  return tx.role.upsert({
    where: { name },
    update: {},
    create: { name, description: String(name) },
  });
}

async function generateStudentCode(tx: Prisma.TransactionClient) {
  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const count = await tx.student.count({
    where: { createdAt: { gte: start, lt: end } },
  });

  return `STU-${year}-${String(count + 1).padStart(4, "0")}`;
}

/** ===================== Repository ===================== */
export class PrismaStudentRepository implements StudentRepository {
  async createWithAccounts(input: CreateStudentDTO): Promise<StudentRecord> {
    return prisma.$transaction(async (tx) => {
      const studentRole = await ensureRole(tx, "STUDENT");
      const parentRole = await ensureRole(tx, "PARENT");

      const studentCode = await generateStudentCode(tx);

      // password temporal (si luego tendrás login real, cambias el flujo)
      const tempPass = crypto.randomUUID();
      const hashed = await bcrypt.hash(tempPass, 10);

      // 1) Student (tabla Student)
      const student = await tx.student.create({
        data: {
          studentCode,
          firstName: input.firstName.trim(),
          lastNameFather: input.lastNameFather.trim(),
          lastNameMother: input.lastNameMother.trim(),
          phone: normalizeText(input.phone),
          birthDate: safeDate(input.birthDate),
          gender: normalizeGender(input.gender),
          grade: normalizeText(input.grade),
          school: normalizeText(input.school),
          status: normalizeStudentStatus(input.status),

          // cuando quieras: agrega a tu DTO y descomenta
          // address: normalizeText(input.address),
          // pickupPerson: normalizeText(input.pickupPerson),
          // nationality: normalizeText(input.nationality),
        },
      });

      // 2) Emails bonitos (según tu formato) + únicos
      const studentEmailBase = buildStudentEmail({
        firstName: input.firstName,
        lastNameFather: input.lastNameFather,
        lastNameMother: input.lastNameMother,
        domain: "memoryx.com",
      });
      const studentEmail = await ensureUniqueEmail(tx, studentEmailBase);

      // 3) User del estudiante + StudentProfile
      await tx.user.create({
        data: {
          email: studentEmail,
          hashedPassword: hashed,
          status: "ACTIVE",
          firstName: input.firstName.trim(),
          lastName: `${input.lastNameFather} ${input.lastNameMother}`.replace(/\s+/g, " ").trim(),
          phone: normalizeText(input.phone),

          userRoles: { create: [{ roleId: studentRole.id }] },
          studentProfile: { create: { studentId: student.id } },
        },
      });

      // 4) Parent (opcional) + ParentProfile + ParentStudentRelation
      if (input.parent) {
        const parentEmailBase = buildParentEmail({
          studentEmail,
          parentFirstName: input.parent.firstName,
          relationship: input.parent.relationship,
        });
        const parentEmail = await ensureUniqueEmail(tx, parentEmailBase);

        const parentUser = await tx.user.create({
          data: {
            email: parentEmail,
            hashedPassword: hashed,
            status: "ACTIVE",
            firstName: input.parent.firstName.trim(),
            lastName: input.parent.lastName.trim(),
            phone: normalizeText(input.phone), // ✅ mismo teléfono

            userRoles: { create: [{ roleId: parentRole.id }] },

            parentProfile: {
              create: {
                relationship: input.parent.relationship, // tu schema: String?
                emergencyContact: true, // ✅ siempre true
              },
            },
          },
          include: { parentProfile: true },
        });

        await tx.parentStudentRelation.create({
          data: {
            parentId: parentUser.parentProfile!.id,
            studentId: student.id,
            relationship: input.parent.relationship,
            isEmergency: true, // ✅ siempre true
          },
        });
      }

      return student as unknown as StudentRecord;
    });
  }

  async search(params: { q?: string; page: number; pageSize: number }) {
    const q = (params.q ?? "").trim();
    const page = Math.max(1, params.page);
    const pageSize = Math.min(500, Math.max(5, params.pageSize));
    const skip = (page - 1) * pageSize;

    const where: Prisma.StudentWhereInput = q
      ? {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastNameFather: { contains: q, mode: "insensitive" } },
          { lastNameMother: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          { studentCode: { contains: q, mode: "insensitive" } },
        ],
      }
      : {};

    const [total, items] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        orderBy: [
          { status: "asc" },
          { lastNameFather: "asc" },
          { lastNameMother: "asc" },
          { firstName: "asc" },
        ],
        skip,
        take: pageSize,
      }),
    ]);

    return {
      items: items as unknown as StudentRecord[],
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async list(params: { q?: string; status?: string; page: number; pageSize: number }): Promise<StudentListResult> {
    const { q, status, page, pageSize } = params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.StudentWhereInput = {};

    if (status) where.status = normalizeStudentStatus(status);

    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastNameFather: { contains: q, mode: "insensitive" } },
        { lastNameMother: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        orderBy: [{ status: "asc" }, { lastNameFather: "asc" }, { lastNameMother: "asc" }, { firstName: "asc" }],
        skip,
        take: pageSize,
      }),
    ]);

    return {
      items: items as unknown as StudentRecord[],
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getById(id: string): Promise<StudentRecord | null> {
    const s = await prisma.student.findUnique({ where: { id } });
    return (s as unknown as StudentRecord) ?? null;
  }

  async update(id: string, input: UpdateStudentDTO): Promise<StudentRecord> {
    // Construye data solo con lo que vino
    const data: Prisma.StudentUpdateInput = {};

    if (typeof input.firstName === "string") data.firstName = input.firstName.trim();
    if (typeof input.lastNameFather === "string") data.lastNameFather = input.lastNameFather.trim();
    if (typeof input.lastNameMother === "string") data.lastNameMother = input.lastNameMother.trim();

    if ("phone" in input) data.phone = normalizeText(input.phone);
    if ("birthDate" in input) data.birthDate = safeDate(input.birthDate);
    if ("gender" in input) data.gender = normalizeGender(input.gender);
    if ("grade" in input) data.grade = normalizeText(input.grade);
    if ("school" in input) data.school = normalizeText(input.school);
    if ("status" in input && input.status) data.status = normalizeStudentStatus(input.status);

    const updated = await prisma.student.update({ where: { id }, data });
    return updated as unknown as StudentRecord;
  }

  async delete(id: string): Promise<void> {
    await prisma.student.delete({ where: { id } });
  }
}

