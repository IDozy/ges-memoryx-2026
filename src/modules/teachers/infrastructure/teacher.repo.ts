// src/modules/teachers/infrastructure/teacher.repo.ts
import { prisma } from "@/src/shared/db/prisma";
import type { Prisma, $Enums } from "@/src/generated/prisma";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

import type {
  TeacherListResult,
  TeacherRecord,
  TeacherRepository,
  CreateTeacherInput,
  UpdateTeacherInput,
  UserStatus,
} from "../domain/teacher.repository";

import { normalizeUserStatus, safeDate, normalizeText } from "../domain/teacher.rules";

/** ===================== Helpers ===================== */

function onlyLettersLower(v: string) {
  return (v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toLowerCase();
}

function yyNow(d = new Date()) {
  return String(d.getFullYear()).slice(-2);
}

function ddmmNow(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}${mm}`;
}

function buildTeacherEmail(params: { firstName: string; lastName: string; domain?: string; now?: Date }) {
  const now = params.now ?? new Date();
  const domain = params.domain ?? "memoryx.com";
  const fi = onlyLettersLower(params.firstName).slice(0, 1);
  const ln = onlyLettersLower(params.lastName);
  return `${fi}${ln}${yyNow(now)}_${ddmmNow(now)}@${domain}`;
}

async function ensureUniqueEmail(tx: Prisma.TransactionClient, email: string) {
  const [local, domain] = email.split("@");
  let candidate = email;
  let i = 2;

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

async function generateTeacherCode(tx: Prisma.TransactionClient) {
  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const count = await tx.teacherProfile.count({
    where: { createdAt: { gte: start, lt: end } },
  });

  return `TEACH-${year}-${String(count + 1).padStart(4, "0")}`;
}

function userStatusToPrisma(s: UserStatus): $Enums.UserStatus {
  return s as unknown as $Enums.UserStatus;
}

function parseStatusFilter(v?: string): $Enums.UserStatus | undefined {
  if (!v) return undefined;
  return userStatusToPrisma(normalizeUserStatus(v));
}

function mapTeacher(t: Prisma.TeacherProfileGetPayload<{ include: { user: true } }>): TeacherRecord {
  return {
    id: t.id,
    userId: t.userId,
    employeeCode: t.employeeCode,
    specialty: t.specialty ?? null,
    qualifications: t.qualifications ?? null,
    bio: t.bio ?? null,
    hireDate: t.hireDate ?? null,
    department: t.department ?? null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,

    user: {
      id: t.user.id,
      email: t.user.email,
      status: t.user.status,
      firstName: t.user.firstName ?? null,
      lastName: t.user.lastName ?? null,
      phone: t.user.phone ?? null,
      avatar: t.user.avatar ?? null,
    },
  };
}

/** ===================== Repository ===================== */
export class PrismaTeacherRepository implements TeacherRepository {
  async createWithAccount(input: CreateTeacherInput): Promise<TeacherRecord> {
    return prisma.$transaction(async (tx) => {
      const teacherRole = await ensureRole(tx, "TEACHER");

      // ✅ siempre se generan
      const employeeCode = await generateTeacherCode(tx);

      const tempPass = randomUUID();
      const hashed = await bcrypt.hash(tempPass, 10);

      const emailBase = buildTeacherEmail({
        firstName: input.firstName ?? "teacher",
        lastName: input.lastName ?? "user",
        domain: "memoryx.com",
      });
      const email = await ensureUniqueEmail(tx, emailBase);

      const created = await tx.teacherProfile.create({
        data: {
          employeeCode,
          specialty: normalizeText(input.specialty),
          department: normalizeText(input.department),
          hireDate: input.hireDate ?? new Date(),
          qualifications: null,
          bio: null,

          user: {
            create: {
              email,
              hashedPassword: hashed,
              status: userStatusToPrisma(normalizeUserStatus(input.status)),
              firstName: input.firstName ?? null,
              lastName: input.lastName ?? null,
              phone: input.phone ?? null,
              avatar: null,
              userRoles: { create: [{ roleId: teacherRole.id }] },
            },
          },
        },
        include: { user: true },
      });

      return mapTeacher(created);
    });
  }

  async list(params: { q?: string; status?: string; page: number; pageSize: number }): Promise<TeacherListResult> {
    const q = (params.q ?? "").trim();
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(500, Math.max(5, Number(params.pageSize ?? 10)));
    const skip = (page - 1) * pageSize;

    const where: Prisma.TeacherProfileWhereInput = {};

    const st = parseStatusFilter(params.status);
    if (st) where.user = { status: st };

    if (q) {
      where.OR = [
        { employeeCode: { contains: q, mode: "insensitive" } },
        { specialty: { contains: q, mode: "insensitive" } },
        { department: { contains: q, mode: "insensitive" } },
        {
          user: {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.teacherProfile.count({ where }),
      prisma.teacherProfile.findMany({
        where,
        include: { user: true },
        orderBy: [{ employeeCode: "asc" }],
        skip,
        take: pageSize,
      }),
    ]);

    return {
      items: items.map(mapTeacher),
      meta: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    };
  }

  async getById(id: string): Promise<TeacherRecord | null> {
    const t = await prisma.teacherProfile.findUnique({
      where: { id },
      include: { user: true },
    });
    return t ? mapTeacher(t) : null;
  }

  async update(id: string, input: UpdateTeacherInput): Promise<TeacherRecord> {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.teacherProfile.findUnique({
        where: { id },
        include: { user: true },
      });
      if (!existing) throw new Error("TeacherProfile no encontrado");

      // ✅ update user (sin email)
      const userData: Prisma.UserUpdateInput = {};

      if (input.firstName !== undefined) userData.firstName = input.firstName;
      if (input.lastName !== undefined) userData.lastName = input.lastName;
      if (input.phone !== undefined) userData.phone = input.phone;
      if (input.status !== undefined) {
        userData.status = userStatusToPrisma(normalizeUserStatus(input.status));
      }

      if (Object.keys(userData).length) {
        await tx.user.update({ where: { id: existing.userId }, data: userData });
      }

      // ✅ update teacherProfile (sin employeeCode)
      const tpData: Prisma.TeacherProfileUpdateInput = {};

      if (input.specialty !== undefined) tpData.specialty = normalizeText(input.specialty);
      if (input.department !== undefined) tpData.department = normalizeText(input.department);
      if (input.hireDate !== undefined) {
        const d = safeDate(input.hireDate);
        tpData.hireDate = d ?? undefined;
      }

      if (Object.keys(tpData).length) {
        await tx.teacherProfile.update({ where: { id }, data: tpData });
      }

      const fresh = await tx.teacherProfile.findUnique({
        where: { id },
        include: { user: true },
      });
      if (!fresh) throw new Error("TeacherProfile no encontrado luego de actualizar");

      return mapTeacher(fresh);
    });
  }

  async delete(id: string, deletedBy?: string): Promise<void> {
  const t = await prisma.teacherProfile.findUnique({ where: { id } });
  if (!t) return;

  await prisma.user.update({
    where: { id: t.userId },
    data: {
      deletedAt: new Date(),
      deletedBy: deletedBy ?? null,
      status: "INACTIVE",
    },
  });
}

}
