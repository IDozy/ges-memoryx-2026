-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENTE', 'AUSENTE', 'TARDE', 'JUSTIFICADO');

-- CreateTable
CREATE TABLE "AttendanceSession" (
    "id" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'AUSENTE',
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AttendanceSession_date_idx" ON "AttendanceSession"("date");

-- CreateIndex
CREATE INDEX "AttendanceSession_actividadId_idx" ON "AttendanceSession"("actividadId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceSession_actividadId_date_key" ON "AttendanceSession"("actividadId", "date");

-- CreateIndex
CREATE INDEX "AttendanceRecord_studentId_idx" ON "AttendanceRecord"("studentId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_sessionId_idx" ON "AttendanceRecord"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_sessionId_studentId_key" ON "AttendanceRecord"("sessionId", "studentId");

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "Actividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AttendanceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
