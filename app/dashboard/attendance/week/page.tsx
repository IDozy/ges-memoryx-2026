// app/dashboard/attendance/week/page.tsx
import AttendanceWeekClient from "@/src/components/attendance/AttendanceWeekClient";
import { prisma } from "@/src/shared/db/prisma";

export default async function AttendanceWeekPage() {
  const ciclos = await prisma.ciclo.findMany({
    orderBy: { createdAt: "desc" }, // 👈 más reciente primero
    include: { actividades: { orderBy: { nombre: "asc" } } },
  });

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Asistencia semanal</h1>
        <p className="text-sm opacity-70">
          Resumen por semana (Lun–Dom) por actividad.
        </p>
      </div>

      <AttendanceWeekClient ciclos={ciclos} />
    </div>
  );
}
