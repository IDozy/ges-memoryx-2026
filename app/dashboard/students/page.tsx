"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import StudentsTable from "@/src/components/students/StudentsTable";
import type { Student , Genero, Estado } from "@/src/components/students/types";
import StudentsModal, {
  emptyDraft,
  type StudentDraft,
} from "@/src/components/students/StudentsModal";

type ApiStudent = {
  id: string;
  firstName: string;
  lastNameFather: string;
  lastNameMother: string;
  phone: string | null;
  tutor: string | null;
  birthDate: string | null; // ISO
  gender: string | null;
  grade: string | null;
  school: string | null;
  status: string; // ACTIVO | RETIRADO
};

type ApiList = {
  items: ApiStudent[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
};

function mapGenero(g: string | null): Genero {
  const v = (g ?? "").toLowerCase();
  if (v === "f" || v === "femenino") return "femenino";
  if (v === "m" || v === "masculino") return "masculino";
  return "masculino"; // default (o el que prefieras)
}

function mapEstado(s: string | null | undefined): Estado {
  const v = (s ?? "").toUpperCase();
  return v === "RETIRADO" ? "retirado" : "activo";
}

function apiToUi(s: ApiStudent): Student {
  return {
    id: s.id,
    nombre: s.firstName ?? "",
    apellidoPaterno: s.lastNameFather ?? "",
    apellidoMaterno: s.lastNameMother ?? "",
    telefono: s.phone ?? "",
    encargado: s.tutor ?? "",
    fechaNacimiento: s.birthDate ? s.birthDate.slice(0, 10) : "",
    genero: mapGenero(s.gender),
    grado: s.grade ?? "",
    escuela: s.school ?? "",
    estado: mapEstado(s.status), // activo | retirado
  };
}

function uiToApi(d: StudentDraft) {
  return {
    firstName: d.nombre?.trim(),
    lastNameFather: d.apellidoPaterno?.trim(),
    lastNameMother: d.apellidoMaterno?.trim(),
    phone: d.telefono?.trim() || null,
    tutor: d.encargado?.trim() || null,
    birthDate: d.fechaNacimiento ? new Date(d.fechaNacimiento).toISOString() : null,
    gender: d.genero ? String(d.genero).toUpperCase() : null, // ajusta si quieres "M"/"F"
    grade: d.grado?.trim() || null,
    school: d.escuela?.trim() || null,
    status: d.estado?.toUpperCase() === "RETIRADO" ? "RETIRADO" : "ACTIVO",
  };
}

// pequeño debounce sin libs
function useDebouncedValue<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function EstudiantesPage() {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // paginación y búsqueda (si tu tabla ya maneja búsqueda interna, igual sirve)
  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 350);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [meta, setMeta] = useState<ApiList["meta"]>({
    total: 0,
    page: 1,
    pageSize,
    totalPages: 0,
  });

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialDraft, setInitialDraft] = useState<StudentDraft>(emptyDraft);

  async function load() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (qDebounced.trim()) sp.set("q", qDebounced.trim());
      sp.set("page", String(page));
      sp.set("pageSize", String(pageSize));

      const res = await fetch(`/api/students?${sp.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudo cargar estudiantes");

      const json = (await res.json()) as ApiList;
      setData(json.items.map(apiToUi));
      setMeta(json.meta);
    } catch (e: any) {
      toast.error("Error cargando estudiantes", {
        description: e?.message ?? "Intenta nuevamente",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, page]);

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

  async function doDelete(id: string) {
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("No se pudo eliminar");
  }

  function onDelete(id: string) {
    const s = data.find((x) => x.id === id);

    toast("¿Eliminar estudiante?", {
      description: s
        ? `${s.nombre} ${s.apellidoPaterno}`
        : "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          const tId = toast.loading("Eliminando...");
          try {
            await doDelete(id);
            toast.dismiss(tId);
            toast.success("Eliminado");
            // refresca (o elimina local y listo)
            setData((prev) => prev.filter((x) => x.id !== id));
            setMeta((m) => ({ ...m, total: Math.max(0, m.total - 1) }));
          } catch (e: any) {
            toast.dismiss(tId);
            toast.error("No se pudo eliminar", { description: e?.message });
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => toast.message("Cancelado"),
      },
    });
  }

  async function createStudent(draft: StudentDraft) {
    const payload = uiToApi(draft);

    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "Error creando estudiante");
    }

    return (await res.json()) as ApiStudent;
  }

  async function updateStudent(id: string, draft: StudentDraft) {
    const payload = uiToApi(draft);

    const res = await fetch(`/api/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "Error actualizando estudiante");
    }

    return (await res.json()) as ApiStudent;
  }

  async function onSubmit(draft: StudentDraft) {
    const tId =
      mode === "create"
        ? toast.loading("Creando estudiante...")
        : toast.loading("Guardando cambios...");

    try {
      if (mode === "create") {
        const created = await createStudent(draft);
        toast.dismiss(tId);
        toast.success("Estudiante creado", {
          description: `${draft.nombre} ${draft.apellidoPaterno}`,
        });

        // refresco rápido (optimista)
        setData((prev) => [apiToUi(created), ...prev]);
        setMeta((m) => ({ ...m, total: m.total + 1 }));
        setOpen(false);
        return;
      }

      if (mode === "edit" && editingId) {
        const updated = await updateStudent(editingId, draft);
        toast.dismiss(tId);
        toast.success("Cambios guardados", {
          description: `${draft.nombre} ${draft.apellidoPaterno}`,
        });

        setData((prev) =>
          prev.map((s) => (s.id === editingId ? apiToUi(updated) : s))
        );
        setOpen(false);
      }
    } catch (e: any) {
      toast.dismiss(tId);
      toast.error("Error", { description: e?.message ?? "Intenta nuevamente" });
    }
  }


  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Estudiantes</h1>
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
