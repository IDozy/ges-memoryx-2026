import { prisma } from "@/src/shared/db/prisma";
import type { Prisma, $Enums } from "@/src/generated/prisma";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

import type { CreateStudentDTO } from "../application/dtos/create-student.dto";
import type { StudentRecord, StudentRepository } from "../domain/student.repository";
import { normalizeGender, normalizeStudentStatus, normalizeText, safeDate } from "../domain/student.rules";

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

export class PrismaStudentRepository implements StudentRepository {
  async createWithAccounts(input: CreateStudentDTO): Promise<StudentRecord> {
    return prisma.$transaction(async (tx) => {
      const studentRole = await ensureRole(tx, "STUDENT");
      const parentRole = await ensureRole(tx, "PARENT");

      const studentCode = await generateStudentCode(tx);

      // password temporal para ambos (luego lo cambias por flujo real)
      const tempPass = randomUUID();
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

          // opcionales en tu schema: si luego quieres mapearlos, agrégalos al DTO
          // address: null,
          // pickupPerson: null,
          // nationality: null,
        },
      });

      // 2) User del estudiante + StudentProfile
      await tx.user.create({
        data: {
          email: `student-${randomUUID()}@memoryx.local`,
          hashedPassword: hashed,
          status: "ACTIVE",
          firstName: input.firstName.trim(),
          lastName: `${input.lastNameFather} ${input.lastNameMother}`.replace(/\s+/g, " ").trim(),
          phone: normalizeText(input.phone),

          userRoles: { create: [{ roleId: studentRole.id }] },

          studentProfile: { create: { studentId: student.id } },
        },
      });

      // 3) Parent (opcional) + ParentProfile + ParentStudentRelation
      if (input.parent) {
        const parentUser = await tx.user.create({
          data: {
            email: `parent-${randomUUID()}@memoryx.local`,
            hashedPassword: hashed,
            status: "ACTIVE",
            firstName: input.parent.firstName.trim(),
            lastName: input.parent.lastName.trim(),
            phone: normalizeText(input.phone), // ✅ mismo teléfono

            userRoles: { create: [{ roleId: parentRole.id }] },

            parentProfile: {
              create: {
                relationship: input.parent.relationship, // ParentProfile.relationship es String?
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
            relationship: input.parent.relationship, // ParentStudentRelation.relationship String?
            isEmergency: true, // ✅ siempre true
          },
        });
      }

      return student as unknown as StudentRecord;
    });
  }
}
