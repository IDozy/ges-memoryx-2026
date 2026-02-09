/*
  Warnings:

  - The values [PRESENTE,AUSENTE,TARDE,JUSTIFICADO] on the enum `AttendanceStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [NO_PAGO,PENDIENTE,PAGADO,NO_REGISTRADO] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACTIVO,RETIRADO] on the enum `StudentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `total` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `totalPaid` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the column `paymentType` on the `PaymentDetail` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PaymentDetail` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `PaymentDetail` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the column `pagosJson` on the `Receipt` table. All the data in the column will be lost.
  - You are about to drop the column `servicio` on the `Receipt` table. All the data in the column will be lost.
  - You are about to alter the column `total` on the `Receipt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `totalPaid` on the `Receipt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the column `tutor` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Actividad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AttendanceSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ciclo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profesor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentActividad` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentCode]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `issuedBy` to the `Receipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentCode` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED');

-- CreateEnum
CREATE TYPE "UserRoleType" AS ENUM ('ADMIN', 'TEACHER', 'PARENT', 'STAFF', 'ACCOUNTANT');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('REGULAR', 'WORKSHOP', 'EXTRA_CURRICULAR', 'SPECIAL');

-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SectionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'DROPPED', 'TRANSFERRED', 'EXPULSED', 'GRADUATED');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('QUIZ', 'EXAM', 'PROJECT', 'HOMEWORK', 'PARTICIPATION', 'PRESENTATION', 'LAB', 'ORAL', 'WRITTEN');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'GRADED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'YAPE', 'PLIN', 'TRANSFER', 'DEPOSIT', 'CREDIT_CARD', 'DEBIT_CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "ReceiptStatus" AS ENUM ('DRAFT', 'ISSUED', 'PRINTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'LOST', 'DAMAGED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BorrowStatus" AS ENUM ('ACTIVE', 'RETURNED', 'OVERDUE', 'LOST', 'DAMAGED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('DIRECT', 'GROUP', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'DELETED');

-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AnnouncementPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AnnouncementAudience" AS ENUM ('ALL', 'STUDENTS', 'PARENTS', 'TEACHERS', 'STAFF');

-- CreateEnum
CREATE TYPE "LoginStatus" AS ENUM ('SUCCESS', 'FAILED', 'LOCKED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'DOWNLOAD');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DNI', 'CE', 'PASSPORT');

-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('CC', 'CA');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('FULL_TIME', 'PART_TIME', 'HOURLY', 'CONTRACTOR', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TERMINATED', 'EXPIRED', 'RENEWED');

-- CreateEnum
CREATE TYPE "PaymentFrequency" AS ENUM ('MONTHLY', 'BIWEEKLY', 'WEEKLY', 'HOURLY');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollItemType" AS ENUM ('BASE_SALARY', 'OVERTIME', 'BONUS', 'COMMISSION', 'ALLOWANCE', 'DEDUCTION', 'TAX', 'INSURANCE', 'RETIREMENT', 'ADVANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "TeacherAttendanceType" AS ENUM ('CLASS_SESSION', 'MEETING', 'TRAINING', 'EVENT', 'OTHER');

-- CreateEnum
CREATE TYPE "TeacherAttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'JUSTIFIED', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "TeacherEventType" AS ENUM ('MEETING', 'TRAINING', 'WORKSHOP', 'CONFERENCE', 'EVALUATION', 'PLANNING', 'OTHER');

-- CreateEnum
CREATE TYPE "TeacherEventStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- AlterEnum
BEGIN;
CREATE TYPE "AttendanceStatus_new" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'JUSTIFIED');
ALTER TABLE "public"."AttendanceRecord" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "AttendanceRecord" ALTER COLUMN "status" TYPE "AttendanceStatus_new" USING ("status"::text::"AttendanceStatus_new");
ALTER TYPE "AttendanceStatus" RENAME TO "AttendanceStatus_old";
ALTER TYPE "AttendanceStatus_new" RENAME TO "AttendanceStatus";
DROP TYPE "public"."AttendanceStatus_old";
ALTER TABLE "AttendanceRecord" ALTER COLUMN "status" SET DEFAULT 'ABSENT';
COMMIT;

-- AlterEnum
ALTER TYPE "Gender" ADD VALUE 'OTHER';

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('UNPAID', 'PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED', 'REFUNDED');
ALTER TABLE "public"."Payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'UNPAID';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StudentStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED', 'WITHDRAWN');
ALTER TABLE "public"."Student" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Student" ALTER COLUMN "status" TYPE "StudentStatus_new" USING ("status"::text::"StudentStatus_new");
ALTER TYPE "StudentStatus" RENAME TO "StudentStatus_old";
ALTER TYPE "StudentStatus_new" RENAME TO "StudentStatus";
DROP TYPE "public"."StudentStatus_old";
ALTER TABLE "Student" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Actividad" DROP CONSTRAINT "Actividad_cicloId_fkey";

-- DropForeignKey
ALTER TABLE "Actividad" DROP CONSTRAINT "Actividad_profesorId_fkey";

-- DropForeignKey
ALTER TABLE "AttendanceRecord" DROP CONSTRAINT "AttendanceRecord_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "AttendanceSession" DROP CONSTRAINT "AttendanceSession_actividadId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_cycleId_fkey";

-- DropForeignKey
ALTER TABLE "Receipt" DROP CONSTRAINT "Receipt_cycleId_fkey";

-- DropForeignKey
ALTER TABLE "StudentActividad" DROP CONSTRAINT "StudentActividad_actividadId_fkey";

-- DropForeignKey
ALTER TABLE "StudentActividad" DROP CONSTRAINT "StudentActividad_studentId_fkey";

-- AlterTable
ALTER TABLE "AttendanceRecord" ADD COLUMN     "markedBy" TEXT,
ALTER COLUMN "status" SET DEFAULT 'ABSENT';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "concept" TEXT NOT NULL DEFAULT 'Monthly Fee',
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "paidDate" TIMESTAMP(3),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "totalPaid" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "status" SET DEFAULT 'UNPAID';

-- AlterTable
ALTER TABLE "PaymentDetail" DROP COLUMN "paymentType",
DROP COLUMN "updatedAt",
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
ADD COLUMN     "reference" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Receipt" DROP COLUMN "pagosJson",
DROP COLUMN "servicio",
ADD COLUMN     "concept" TEXT NOT NULL DEFAULT 'Monthly Fee',
ADD COLUMN     "issuedBy" TEXT NOT NULL,
ADD COLUMN     "paymentsJson" JSONB,
ADD COLUMN     "pdfUrl" TEXT,
ADD COLUMN     "printed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "ReceiptStatus" NOT NULL DEFAULT 'ISSUED',
ALTER COLUMN "total" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "totalPaid" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "tutor",
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "studentCode" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
DROP COLUMN "role",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropTable
DROP TABLE "Actividad";

-- DropTable
DROP TABLE "AttendanceSession";

-- DropTable
DROP TABLE "Ciclo";

-- DropTable
DROP TABLE "Profesor";

-- DropTable
DROP TABLE "StudentActividad";

-- DropEnum
DROP TYPE "PaymentType";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "TipoActividad";

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" "UserRoleType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "specialty" TEXT,
    "qualifications" TEXT,
    "bio" TEXT,
    "hireDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "relationship" TEXT,
    "occupation" TEXT,
    "emergencyContact" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "position" TEXT,
    "department" TEXT,
    "hireDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentStudentRelation" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "relationship" TEXT,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentStudentRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicCycle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "CycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "courseType" "CourseType" NOT NULL DEFAULT 'REGULAR',
    "gradeLevel" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE',
    "cycleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sectionCode" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT,
    "cycleId" TEXT NOT NULL,
    "maxCapacity" INTEGER NOT NULL DEFAULT 30,
    "currentEnrollment" INTEGER NOT NULL DEFAULT 0,
    "room" TEXT,
    "status" "SectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionSchedule" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TIME(0) NOT NULL,
    "endTime" TIME(0) NOT NULL,
    "room" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SectionSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSession" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "topic" TEXT,
    "notes" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "gradeLevel" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionEnrollment" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "finalGrade" DECIMAL(5,2),
    "finalStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SectionEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assessmentType" "AssessmentType" NOT NULL,
    "description" TEXT,
    "sectionId" TEXT NOT NULL,
    "totalPoints" DECIMAL(5,2) NOT NULL,
    "weight" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "dueDate" TIMESTAMP(3),
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentGrade" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "score" DECIMAL(5,2),
    "maxScore" DECIMAL(5,2) NOT NULL,
    "percentage" DECIMAL(5,2),
    "feedback" TEXT,
    "comments" TEXT,
    "gradedBy" TEXT,
    "gradedAt" TIMESTAMP(3),
    "isFinalGrade" BOOLEAN NOT NULL DEFAULT false,
    "finalComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryBook" (
    "id" TEXT NOT NULL,
    "isbn" TEXT,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT,
    "publicationYear" INTEGER,
    "edition" TEXT,
    "category" TEXT,
    "description" TEXT,
    "totalCopies" INTEGER NOT NULL DEFAULT 1,
    "availableCopies" INTEGER NOT NULL DEFAULT 1,
    "location" TEXT,
    "status" "BookStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryBorrow" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "borrowDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3),
    "status" "BorrowStatus" NOT NULL DEFAULT 'ACTIVE',
    "fineAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "issuedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryBorrow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL DEFAULT 'DIRECT',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "parentId" TEXT,
    "attachments" JSONB,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "audience" "AnnouncementAudience" NOT NULL DEFAULT 'ALL',
    "priority" "AnnouncementPriority" NOT NULL DEFAULT 'MEDIUM',
    "attachments" JSONB,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "status" "AnnouncementStatus" NOT NULL DEFAULT 'DRAFT',
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseMaterial" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "externalUrl" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "requiresLogin" BOOLEAN NOT NULL DEFAULT true,
    "uploadedBy" TEXT NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutAt" TIMESTAMP(3),
    "ip" TEXT,
    "userAgent" TEXT,
    "status" "LoginStatus" NOT NULL,
    "failureReason" TEXT,
    "sessionId" TEXT,

    CONSTRAINT "LoginLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB,
    "description" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherContract" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "contractType" "ContractType" NOT NULL DEFAULT 'FULL_TIME',
    "contractNumber" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "baseSalary" DECIMAL(10,2) NOT NULL,
    "paymentFrequency" "PaymentFrequency" NOT NULL DEFAULT 'MONTHLY',
    "hourlyRate" DECIMAL(8,2),
    "documentType" "DocumentType",
    "documentNumber" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "bankAccountType" "BankAccountType",
    "cci" TEXT,
    "hasHealthInsurance" BOOLEAN NOT NULL DEFAULT false,
    "hasRetirementPlan" BOOLEAN NOT NULL DEFAULT false,
    "vacationDays" INTEGER NOT NULL DEFAULT 15,
    "sickDays" INTEGER NOT NULL DEFAULT 10,
    "position" TEXT NOT NULL,
    "department" TEXT,
    "workSchedule" TEXT,
    "contractFile" TEXT,
    "notes" TEXT,
    "signedAt" TIMESTAMP(3),
    "signedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherPayroll" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "payrollPeriod" TEXT NOT NULL,
    "grossSalary" DECIMAL(10,2) NOT NULL,
    "totalDeductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalBonuses" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netSalary" DECIMAL(10,2) NOT NULL,
    "hoursWorked" DECIMAL(6,2),
    "attendanceCount" INTEGER,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "paidAt" TIMESTAMP(3),
    "paidById" TEXT,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'TRANSFER',
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherPayroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollItem" (
    "id" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "itemType" "PayrollItemType" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "isDeduction" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollReceipt" (
    "id" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "grossSalary" DECIMAL(10,2) NOT NULL,
    "totalDeductions" DECIMAL(10,2) NOT NULL,
    "totalBonuses" DECIMAL(10,2) NOT NULL,
    "netSalary" DECIMAL(10,2) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedById" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "printed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PayrollReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherAttendanceClass" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "attendanceDate" TIMESTAMP(3) NOT NULL,
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "status" "TeacherAttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "hoursWorked" DECIMAL(4,2),
    "reason" TEXT,
    "comment" TEXT,
    "recordedById" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teacherProfileId" TEXT,

    CONSTRAINT "TeacherAttendanceClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherAttendanceEvent" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "eventTitle" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "attendanceType" "TeacherAttendanceType" NOT NULL DEFAULT 'MEETING',
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "status" "TeacherAttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "hoursWorked" DECIMAL(4,2),
    "reason" TEXT,
    "comment" TEXT,
    "recordedById" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teacherProfileId" TEXT,

    CONSTRAINT "TeacherAttendanceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" "TeacherEventType" NOT NULL,
    "eventTypeLabel" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "organizerId" TEXT NOT NULL,
    "status" "TeacherEventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherEventAttendee" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "status" "TeacherAttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "comment" TEXT,
    "attendedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherEventAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "TeacherProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_employeeCode_key" ON "TeacherProfile"("employeeCode");

-- CreateIndex
CREATE INDEX "TeacherProfile_employeeCode_idx" ON "TeacherProfile"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "ParentProfile_userId_key" ON "ParentProfile"("userId");

-- CreateIndex
CREATE INDEX "ParentProfile_userId_idx" ON "ParentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffProfile_userId_key" ON "StaffProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffProfile_employeeCode_key" ON "StaffProfile"("employeeCode");

-- CreateIndex
CREATE INDEX "StaffProfile_employeeCode_idx" ON "StaffProfile"("employeeCode");

-- CreateIndex
CREATE INDEX "ParentStudentRelation_parentId_idx" ON "ParentStudentRelation"("parentId");

-- CreateIndex
CREATE INDEX "ParentStudentRelation_studentId_idx" ON "ParentStudentRelation"("studentId");

-- CreateIndex
CREATE INDEX "ParentStudentRelation_isEmergency_idx" ON "ParentStudentRelation"("isEmergency");

-- CreateIndex
CREATE UNIQUE INDEX "ParentStudentRelation_parentId_studentId_key" ON "ParentStudentRelation"("parentId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicCycle_name_key" ON "AcademicCycle"("name");

-- CreateIndex
CREATE INDEX "AcademicCycle_year_idx" ON "AcademicCycle"("year");

-- CreateIndex
CREATE INDEX "AcademicCycle_status_idx" ON "AcademicCycle"("status");

-- CreateIndex
CREATE INDEX "AcademicCycle_startDate_endDate_idx" ON "AcademicCycle"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE INDEX "Course_code_idx" ON "Course"("code");

-- CreateIndex
CREATE INDEX "Course_gradeLevel_idx" ON "Course"("gradeLevel");

-- CreateIndex
CREATE INDEX "Course_cycleId_idx" ON "Course"("cycleId");

-- CreateIndex
CREATE INDEX "Course_status_idx" ON "Course"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSection_sectionCode_key" ON "ClassSection"("sectionCode");

-- CreateIndex
CREATE INDEX "ClassSection_sectionCode_idx" ON "ClassSection"("sectionCode");

-- CreateIndex
CREATE INDEX "ClassSection_cycleId_idx" ON "ClassSection"("cycleId");

-- CreateIndex
CREATE INDEX "ClassSection_teacherId_idx" ON "ClassSection"("teacherId");

-- CreateIndex
CREATE INDEX "ClassSection_status_idx" ON "ClassSection"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSection_courseId_name_cycleId_key" ON "ClassSection"("courseId", "name", "cycleId");

-- CreateIndex
CREATE INDEX "SectionSchedule_sectionId_idx" ON "SectionSchedule"("sectionId");

-- CreateIndex
CREATE INDEX "SectionSchedule_dayOfWeek_idx" ON "SectionSchedule"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "SectionSchedule_sectionId_dayOfWeek_startTime_key" ON "SectionSchedule"("sectionId", "dayOfWeek", "startTime");

-- CreateIndex
CREATE INDEX "ClassSession_sectionId_idx" ON "ClassSession"("sectionId");

-- CreateIndex
CREATE INDEX "ClassSession_startsAt_idx" ON "ClassSession"("startsAt");

-- CreateIndex
CREATE INDEX "ClassSession_status_idx" ON "ClassSession"("status");

-- CreateIndex
CREATE INDEX "Enrollment_studentId_idx" ON "Enrollment"("studentId");

-- CreateIndex
CREATE INDEX "Enrollment_cycleId_idx" ON "Enrollment"("cycleId");

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_cycleId_key" ON "Enrollment"("studentId", "cycleId");

-- CreateIndex
CREATE INDEX "SectionEnrollment_sectionId_idx" ON "SectionEnrollment"("sectionId");

-- CreateIndex
CREATE INDEX "SectionEnrollment_studentId_idx" ON "SectionEnrollment"("studentId");

-- CreateIndex
CREATE INDEX "SectionEnrollment_status_idx" ON "SectionEnrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SectionEnrollment_sectionId_studentId_key" ON "SectionEnrollment"("sectionId", "studentId");

-- CreateIndex
CREATE INDEX "Assessment_sectionId_idx" ON "Assessment"("sectionId");

-- CreateIndex
CREATE INDEX "Assessment_assessmentType_idx" ON "Assessment"("assessmentType");

-- CreateIndex
CREATE INDEX "Assessment_dueDate_idx" ON "Assessment"("dueDate");

-- CreateIndex
CREATE INDEX "Assessment_status_idx" ON "Assessment"("status");

-- CreateIndex
CREATE INDEX "StudentGrade_studentId_idx" ON "StudentGrade"("studentId");

-- CreateIndex
CREATE INDEX "StudentGrade_assessmentId_idx" ON "StudentGrade"("assessmentId");

-- CreateIndex
CREATE INDEX "StudentGrade_gradedAt_idx" ON "StudentGrade"("gradedAt");

-- CreateIndex
CREATE INDEX "StudentGrade_percentage_idx" ON "StudentGrade"("percentage");

-- CreateIndex
CREATE UNIQUE INDEX "StudentGrade_assessmentId_studentId_key" ON "StudentGrade"("assessmentId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryBook_isbn_key" ON "LibraryBook"("isbn");

-- CreateIndex
CREATE INDEX "LibraryBook_isbn_idx" ON "LibraryBook"("isbn");

-- CreateIndex
CREATE INDEX "LibraryBook_title_idx" ON "LibraryBook"("title");

-- CreateIndex
CREATE INDEX "LibraryBook_author_idx" ON "LibraryBook"("author");

-- CreateIndex
CREATE INDEX "LibraryBook_category_idx" ON "LibraryBook"("category");

-- CreateIndex
CREATE INDEX "LibraryBook_status_idx" ON "LibraryBook"("status");

-- CreateIndex
CREATE INDEX "LibraryBorrow_bookId_idx" ON "LibraryBorrow"("bookId");

-- CreateIndex
CREATE INDEX "LibraryBorrow_studentId_idx" ON "LibraryBorrow"("studentId");

-- CreateIndex
CREATE INDEX "LibraryBorrow_status_idx" ON "LibraryBorrow"("status");

-- CreateIndex
CREATE INDEX "LibraryBorrow_dueDate_idx" ON "LibraryBorrow"("dueDate");

-- CreateIndex
CREATE INDEX "LibraryBorrow_returnDate_idx" ON "LibraryBorrow"("returnDate");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_recipientId_idx" ON "Message"("recipientId");

-- CreateIndex
CREATE INDEX "Message_isRead_idx" ON "Message"("isRead");

-- CreateIndex
CREATE INDEX "Message_sentAt_idx" ON "Message"("sentAt");

-- CreateIndex
CREATE INDEX "Message_status_idx" ON "Message"("status");

-- CreateIndex
CREATE INDEX "Announcement_audience_idx" ON "Announcement"("audience");

-- CreateIndex
CREATE INDEX "Announcement_priority_idx" ON "Announcement"("priority");

-- CreateIndex
CREATE INDEX "Announcement_status_idx" ON "Announcement"("status");

-- CreateIndex
CREATE INDEX "Announcement_publishedAt_idx" ON "Announcement"("publishedAt");

-- CreateIndex
CREATE INDEX "CourseMaterial_courseId_idx" ON "CourseMaterial"("courseId");

-- CreateIndex
CREATE INDEX "CourseMaterial_fileType_idx" ON "CourseMaterial"("fileType");

-- CreateIndex
CREATE INDEX "CourseMaterial_isVisible_idx" ON "CourseMaterial"("isVisible");

-- CreateIndex
CREATE INDEX "LoginLog_userId_idx" ON "LoginLog"("userId");

-- CreateIndex
CREATE INDEX "LoginLog_loginAt_idx" ON "LoginLog"("loginAt");

-- CreateIndex
CREATE INDEX "LoginLog_status_idx" ON "LoginLog"("status");

-- CreateIndex
CREATE INDEX "LoginLog_ip_idx" ON "LoginLog"("ip");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherContract_contractNumber_key" ON "TeacherContract"("contractNumber");

-- CreateIndex
CREATE INDEX "TeacherContract_teacherId_idx" ON "TeacherContract"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherContract_contractNumber_idx" ON "TeacherContract"("contractNumber");

-- CreateIndex
CREATE INDEX "TeacherContract_status_idx" ON "TeacherContract"("status");

-- CreateIndex
CREATE INDEX "TeacherContract_startDate_endDate_idx" ON "TeacherContract"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "TeacherContract_documentNumber_idx" ON "TeacherContract"("documentNumber");

-- CreateIndex
CREATE INDEX "TeacherPayroll_contractId_periodStart_periodEnd_idx" ON "TeacherPayroll"("contractId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "TeacherPayroll_year_month_idx" ON "TeacherPayroll"("year", "month");

-- CreateIndex
CREATE INDEX "TeacherPayroll_status_idx" ON "TeacherPayroll"("status");

-- CreateIndex
CREATE INDEX "TeacherPayroll_paidAt_idx" ON "TeacherPayroll"("paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherPayroll_contractId_year_month_key" ON "TeacherPayroll"("contractId", "year", "month");

-- CreateIndex
CREATE INDEX "PayrollItem_payrollId_idx" ON "PayrollItem"("payrollId");

-- CreateIndex
CREATE INDEX "PayrollItem_itemType_idx" ON "PayrollItem"("itemType");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollReceipt_payrollId_key" ON "PayrollReceipt"("payrollId");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollReceipt_receiptNumber_key" ON "PayrollReceipt"("receiptNumber");

-- CreateIndex
CREATE INDEX "PayrollReceipt_receiptNumber_idx" ON "PayrollReceipt"("receiptNumber");

-- CreateIndex
CREATE INDEX "PayrollReceipt_contractId_idx" ON "PayrollReceipt"("contractId");

-- CreateIndex
CREATE INDEX "PayrollReceipt_issuedAt_idx" ON "PayrollReceipt"("issuedAt");

-- CreateIndex
CREATE INDEX "TeacherAttendanceClass_contractId_idx" ON "TeacherAttendanceClass"("contractId");

-- CreateIndex
CREATE INDEX "TeacherAttendanceClass_attendanceDate_idx" ON "TeacherAttendanceClass"("attendanceDate");

-- CreateIndex
CREATE INDEX "TeacherAttendanceClass_status_idx" ON "TeacherAttendanceClass"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAttendanceClass_contractId_sessionId_key" ON "TeacherAttendanceClass"("contractId", "sessionId");

-- CreateIndex
CREATE INDEX "TeacherAttendanceEvent_contractId_idx" ON "TeacherAttendanceEvent"("contractId");

-- CreateIndex
CREATE INDEX "TeacherAttendanceEvent_eventDate_idx" ON "TeacherAttendanceEvent"("eventDate");

-- CreateIndex
CREATE INDEX "TeacherAttendanceEvent_status_idx" ON "TeacherAttendanceEvent"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAttendanceEvent_contractId_eventDate_eventTitle_key" ON "TeacherAttendanceEvent"("contractId", "eventDate", "eventTitle");

-- CreateIndex
CREATE INDEX "TeacherEvent_eventType_idx" ON "TeacherEvent"("eventType");

-- CreateIndex
CREATE INDEX "TeacherEvent_startsAt_idx" ON "TeacherEvent"("startsAt");

-- CreateIndex
CREATE INDEX "TeacherEvent_status_idx" ON "TeacherEvent"("status");

-- CreateIndex
CREATE INDEX "TeacherEventAttendee_eventId_idx" ON "TeacherEventAttendee"("eventId");

-- CreateIndex
CREATE INDEX "TeacherEventAttendee_teacherId_idx" ON "TeacherEventAttendee"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherEventAttendee_status_idx" ON "TeacherEventAttendee"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherEventAttendee_eventId_teacherId_key" ON "TeacherEventAttendee"("eventId", "teacherId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_status_idx" ON "AttendanceRecord"("status");

-- CreateIndex
CREATE INDEX "AttendanceRecord_markedAt_idx" ON "AttendanceRecord"("markedAt");

-- CreateIndex
CREATE INDEX "Payment_status_dueDate_idx" ON "Payment"("status", "dueDate");

-- CreateIndex
CREATE INDEX "Payment_dueDate_idx" ON "Payment"("dueDate");

-- CreateIndex
CREATE INDEX "PaymentDetail_date_idx" ON "PaymentDetail"("date");

-- CreateIndex
CREATE INDEX "Receipt_correlativo_idx" ON "Receipt"("correlativo");

-- CreateIndex
CREATE INDEX "Receipt_issuedAt_idx" ON "Receipt"("issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentCode_key" ON "Student"("studentCode");

-- CreateIndex
CREATE INDEX "Student_studentCode_idx" ON "Student"("studentCode");

-- CreateIndex
CREATE INDEX "Student_status_idx" ON "Student"("status");

-- CreateIndex
CREATE INDEX "Student_grade_idx" ON "Student"("grade");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentProfile" ADD CONSTRAINT "ParentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffProfile" ADD CONSTRAINT "StaffProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentStudentRelation" ADD CONSTRAINT "ParentStudentRelation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ParentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentStudentRelation" ADD CONSTRAINT "ParentStudentRelation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "AcademicCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSection" ADD CONSTRAINT "ClassSection_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSection" ADD CONSTRAINT "ClassSection_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSection" ADD CONSTRAINT "ClassSection_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "AcademicCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionSchedule" ADD CONSTRAINT "SectionSchedule_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ClassSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ClassSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "AcademicCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionEnrollment" ADD CONSTRAINT "SectionEnrollment_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ClassSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionEnrollment" ADD CONSTRAINT "SectionEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ClassSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGrade" ADD CONSTRAINT "StudentGrade_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGrade" ADD CONSTRAINT "StudentGrade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGrade" ADD CONSTRAINT "StudentGrade_gradedBy_fkey" FOREIGN KEY ("gradedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_markedBy_fkey" FOREIGN KEY ("markedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "AcademicCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "AcademicCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_issuedBy_fkey" FOREIGN KEY ("issuedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryBorrow" ADD CONSTRAINT "LibraryBorrow_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "LibraryBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryBorrow" ADD CONSTRAINT "LibraryBorrow_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryBorrow" ADD CONSTRAINT "LibraryBorrow_issuedBy_fkey" FOREIGN KEY ("issuedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMaterial" ADD CONSTRAINT "CourseMaterial_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMaterial" ADD CONSTRAINT "CourseMaterial_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginLog" ADD CONSTRAINT "LoginLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherContract" ADD CONSTRAINT "TeacherContract_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherContract" ADD CONSTRAINT "TeacherContract_signedById_fkey" FOREIGN KEY ("signedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherPayroll" ADD CONSTRAINT "TeacherPayroll_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "TeacherContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherPayroll" ADD CONSTRAINT "TeacherPayroll_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherPayroll" ADD CONSTRAINT "TeacherPayroll_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollItem" ADD CONSTRAINT "PayrollItem_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "TeacherPayroll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollReceipt" ADD CONSTRAINT "PayrollReceipt_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "TeacherPayroll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollReceipt" ADD CONSTRAINT "PayrollReceipt_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendanceClass" ADD CONSTRAINT "TeacherAttendanceClass_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "TeacherContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendanceClass" ADD CONSTRAINT "TeacherAttendanceClass_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendanceClass" ADD CONSTRAINT "TeacherAttendanceClass_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendanceClass" ADD CONSTRAINT "TeacherAttendanceClass_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendanceEvent" ADD CONSTRAINT "TeacherAttendanceEvent_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "TeacherContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendanceEvent" ADD CONSTRAINT "TeacherAttendanceEvent_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendanceEvent" ADD CONSTRAINT "TeacherAttendanceEvent_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherEvent" ADD CONSTRAINT "TeacherEvent_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherEventAttendee" ADD CONSTRAINT "TeacherEventAttendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TeacherEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherEventAttendee" ADD CONSTRAINT "TeacherEventAttendee_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
