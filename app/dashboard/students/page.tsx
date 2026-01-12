"use client";

import { useState } from "react";
import { toast } from "sonner";
import StudentsTable from "@/src/components/students/StudentsTable";
import type { Student } from "@/src/components/students/types";
import StudentsModal, {
  emptyDraft,
  type StudentDraft,
} from "@/src/components/students/StudentsModal";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default function EstudiantesPage() {
  const [data, setData] = useState<Student[]>([
    {
      id: uid(),
      nombre: "Ana",
      apellidoPaterno: "García",
      apellidoMaterno: "Rojas",
      telefono: "999888777",
      encargado: "María Rojas",
      fechaNacimiento: "2012-05-14",
      genero: "femenino",
      grado: "6to",
      escuela: "I.E. Juan 23",
      estado: "activo",
    },
  ]);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialDraft, setInitialDraft] = useState<StudentDraft>(emptyDraft);

  function onCreate() {
    setMode("create");
    setEditingId(null);
    setInitialDraft(emptyDraft);
    setOpen(true);
  }

  function onEdit(s: Student) {
    setMode("edit");
    setEditingId(s.id);
    const { id, ...rest } = s;
    setInitialDraft(rest);
    setOpen(true);
  }

  function onDelete(id: string) {
  const s = data.find((x) => x.id === id);

  toast("¿Eliminar estudiante?", {
    description: s ? `${s.nombre} ${s.apellidoPaterno}` : "Esta acción no se puede deshacer.",
    action: {
      label: "Eliminar",
      onClick: () => {
        setData((prev) => prev.filter((x) => x.id !== id));
        toast.success("Eliminado");
      },
    },
    cancel: {
      label: "Cancelar",
      onClick: () => toast.message("Cancelado"),
    },
  });
}

  function onSubmit(draft: StudentDraft) {
    if (mode === "create") {
      setData((prev) => [{ id: uid(), ...draft }, ...prev]);
      setOpen(false);
      toast.success("Estudiante creado", { description: `${draft.nombre} ${draft.apellidoPaterno}` });
      return;
    }

    if (mode === "edit" && editingId) {
      setData((prev) =>
        prev.map((s) => (s.id === editingId ? { id: editingId, ...draft } : s))
      );
      setOpen(false);
      toast.success("Cambios guardados", { description: `${draft.nombre} ${draft.apellidoPaterno}` });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Estudiantes</h1>
        <p className="mt-1 text-sm opacity-70">
          CRUD: buscar, crear, editar y eliminar.
        </p>
      </div>

      <StudentsTable
        data={data}
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <StudentsModal
        open={open}
        mode={mode}
        initial={initialDraft}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
      />
    </div>
  );
}
