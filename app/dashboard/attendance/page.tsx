// app/dashboard/attendance/page.tsx
import AttendanceClient from "@/src/components/attendance-eliminar-actualizar/AttendanceClient";
import { prisma } from "@/src/shared/db/prisma";


export default async function AttendancePage() {
  const ciclos = await prisma.ciclo.findMany({
  orderBy: {
    createdAt: "desc", // 👈 el más reciente primero
  },
  include: {
    actividades: {
      orderBy: { nombre: "asc" },
    },
  },
});


  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Asistencia</h1>
        <p className="text-sm opacity-70">
          Marca asistencia por actividad y fecha.
        </p>
      </div>

      <AttendanceClient ciclos={ciclos} />
    </div>
  );
}
