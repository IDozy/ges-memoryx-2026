-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TipoActividad" AS ENUM ('NIVEL', 'TALLER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVO', 'RETIRADO');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NO_PAGO', 'PENDIENTE', 'PAGADO', 'NO_REGISTRADO');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'YAPE', 'PLIN', 'TRANSFER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "hashedPassword" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastNameFather" TEXT NOT NULL,
    "lastNameMother" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "gender" "Gender",
    "grade" TEXT,
    "school" TEXT,
    "tutor" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "pickupPerson" TEXT,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profesor" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profesor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ciclo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ciclo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Actividad" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoActividad" NOT NULL DEFAULT 'NIVEL',
    "profesorId" TEXT,
    "cicloId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentActividad" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentActividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "PaymentStatus" NOT NULL DEFAULT 'NO_PAGO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentDetail" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentType" "PaymentType" NOT NULL DEFAULT 'CASH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "correlativo" SERIAL NOT NULL,
    "receiptNo" TEXT,
    "studentId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "servicio" TEXT NOT NULL DEFAULT 'Mensualidad',
    "total" DOUBLE PRECISION NOT NULL,
    "totalPaid" DOUBLE PRECISION NOT NULL,
    "pagosJson" JSONB,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Student_lastNameFather_lastNameMother_firstName_idx" ON "Student"("lastNameFather", "lastNameMother", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "Ciclo_nombre_key" ON "Ciclo"("nombre");

-- CreateIndex
CREATE INDEX "Actividad_tipo_idx" ON "Actividad"("tipo");

-- CreateIndex
CREATE INDEX "Actividad_cicloId_idx" ON "Actividad"("cicloId");

-- CreateIndex
CREATE INDEX "Actividad_profesorId_idx" ON "Actividad"("profesorId");

-- CreateIndex
CREATE INDEX "StudentActividad_studentId_idx" ON "StudentActividad"("studentId");

-- CreateIndex
CREATE INDEX "StudentActividad_actividadId_idx" ON "StudentActividad"("actividadId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentActividad_studentId_actividadId_key" ON "StudentActividad"("studentId", "actividadId");

-- CreateIndex
CREATE INDEX "Payment_cycleId_year_month_idx" ON "Payment"("cycleId", "year", "month");

-- CreateIndex
CREATE INDEX "Payment_studentId_year_month_idx" ON "Payment"("studentId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_studentId_cycleId_month_year_key" ON "Payment"("studentId", "cycleId", "month", "year");

-- CreateIndex
CREATE INDEX "PaymentDetail_paymentId_idx" ON "PaymentDetail"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_correlativo_key" ON "Receipt"("correlativo");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receiptNo_key" ON "Receipt"("receiptNo");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_paymentId_key" ON "Receipt"("paymentId");

-- CreateIndex
CREATE INDEX "Receipt_cycleId_year_month_idx" ON "Receipt"("cycleId", "year", "month");

-- CreateIndex
CREATE INDEX "Receipt_studentId_year_month_idx" ON "Receipt"("studentId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_studentId_cycleId_month_year_key" ON "Receipt"("studentId", "cycleId", "month", "year");

-- AddForeignKey
ALTER TABLE "Actividad" ADD CONSTRAINT "Actividad_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Actividad" ADD CONSTRAINT "Actividad_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "Ciclo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentActividad" ADD CONSTRAINT "StudentActividad_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentActividad" ADD CONSTRAINT "StudentActividad_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "Actividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "Ciclo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentDetail" ADD CONSTRAINT "PaymentDetail_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "Ciclo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
