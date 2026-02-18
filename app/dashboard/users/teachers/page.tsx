"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import TeachersTable from "@/src/components/teachers/TeachersTable";
import TeachersModal, {
  emptyDraft,
  type TeacherDraft,
} from "@/src/components/teachers/TeachersModal";

import type {
  Teacher,
  TeacherEstado,
  CreateTeacherPayload,
  UpdateTeacherPayload,
} from "@/src/components/teachers/types";

/**
 * ============================================================
 *  API SHAPES (lo que devuelve tu backend /api/teachers)
 * ============================================================
 */
type ApiTeacher = {
  id: string; // TeacherProfile.id
  userId: string;

  employeeCode: string;
  specialty: string | null;
  department: string | null;
  hireDate: string | null;

  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "LOCKED";
  };
};

type ApiList = {
  items: ApiTeacher[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
};

function mapEstadoUserToUi(s: ApiTeacher["user"]["status"]): TeacherEstado {
  if (s === "INACTIVE") return "inactivo";
  if (s === "SUSPENDED") return "suspendido";
  if (s === "LOCKED") return "bloqueado";
  return "activo";
}

function apiToUi(t: ApiTeacher): Teacher {
  return {
    id: t.id,
    userId: t.userId,

    email: t.user.email ?? "",
    nombres: t.user.firstName ?? "",
    apellidos: t.user.lastName ?? "",
    telefono: t.user.phone ?? "",

    employeeCode: t.employeeCode ?? "",
    especialidad: t.specialty ?? "",
    departamento: t.department ?? "",
    fechaIngreso: t.hireDate ? t.hireDate.slice(0, 10) : "",

    estado: mapEstadoUserToUi(t.user.status),
  };
}

function uiToApi(
  d: TeacherDraft,
  mode: "create" | "edit"
): CreateTeacherPayload | UpdateTeacherPayload {
  const base: any = {

    firstName: (d.nombres ?? "").trim() || null,
    lastName: (d.apellidos ?? "").trim() || null,
    phone: (d.telefono ?? "").trim() || null,
    status:
      d.estado === "inactivo"
        ? "INACTIVE"
        : d.estado === "suspendido"
          ? "SUSPENDED"
          : d.estado === "bloqueado"
            ? "LOCKED"
            : "ACTIVE",


    specialty: (d.especialidad ?? "").trim() || null,
    department: (d.departamento ?? "").trim() || null,
    hireDate: d.fechaIngreso ? new Date(d.fechaIngreso).toISOString() : null,
  };

  // si está vacío y es opcional, lo quitamos
  if (!base.employeeCode) delete base.employeeCode;

  // en edit normalmente no mandas password ni nada extra (base ya sirve)
  return base;
}

// debounce simple (sin libs)
function useDebouncedValue<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function TeachersPage() {
  const [data, setData] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ búsqueda server-side, pero el input estará SOLO en TeachersTable


  const [page, setPage] = useState(1);
  const pageSize = 200;

  const [meta, setMeta] = useState<ApiList["meta"]>({
    total: 0,
    page: 1,
    pageSize,
    totalPages: 0,
  });

  // modal
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialDraft, setInitialDraft] = useState<TeacherDraft>(emptyDraft);
  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 350);

  async function load() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (qDebounced.trim()) sp.set("q", qDebounced.trim());
      sp.set("page", String(page));
      sp.set("pageSize", String(pageSize));

      console.log("FETCH =>", `/api/teachers?${sp.toString()}`);

      const res = await fetch(`/api/teachers?${sp.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar profesores");

      const json = (await res.json()) as ApiList;
      setData(json.items.map(apiToUi));
      setMeta(json.meta);
    } catch (e: any) {
      toast.error("Error cargando profesores", { description: e?.message ?? "Intenta nuevamente" });
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

  function onEdit(t: Teacher) {
    setMode("edit");
    setEditingId(t.id);
    setInitialDraft({
      nombres: t.nombres,
      apellidos: t.apellidos,
      telefono: t.telefono,

      especialidad: t.especialidad,
      departamento: t.departamento,
      fechaIngreso: t.fechaIngreso,
      estado: t.estado,
    });
    setOpen(true);
  }

  async function doDelete(id: string) {
    const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "No se pudo eliminar");
    }
  }

  function onDelete(id: string) {
    const t = data.find((x) => x.id === id);

    toast("¿Eliminar profesor?", {
      description: t
        ? `${t.nombres} ${t.apellidos}`
        : "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          const tId = toast.loading("Eliminando...");
          try {
            await doDelete(id);
            toast.dismiss(tId);
            toast.success("Eliminado");
            setData((prev) => prev.filter((x) => x.id !== id));
            setMeta((m) => ({ ...m, total: Math.max(0, m.total - 1) }));
          } catch (e: any) {
            toast.dismiss(tId);
            toast.error("No se pudo eliminar", { description: e?.message });
          }
        },
      },
      cancel: { label: "Cancelar", onClick: () => toast.message("Cancelado") },
    });
  }

  async function createTeacher(draft: TeacherDraft) {
    const payload = uiToApi(draft, "create");

    const res = await fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "Error creando profesor");
    }

    return (await res.json()) as ApiTeacher;
  }

  async function updateTeacher(id: string, draft: TeacherDraft) {
    const payload = uiToApi(draft, "edit");

    const res = await fetch(`/api/teachers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "Error actualizando profesor");
    }

    return (await res.json()) as ApiTeacher;
  }

  async function onSubmit(draft: TeacherDraft) {
    const tId =
      mode === "create"
        ? toast.loading("Creando profesor...")
        : toast.loading("Guardando cambios...");

    try {
      if (mode === "create") {
        const created = await createTeacher(draft);
        toast.dismiss(tId);
        toast.success("Profesor creado", {
          description: `${draft.nombres} ${draft.apellidos}`.trim(),
        });

        // OJO: si estás paginado, esto solo actualiza UI local.
        // Si quieres, puedes hacer load() para refrescar desde server.
        setData((prev) => [apiToUi(created), ...prev]);
        setMeta((m) => ({ ...m, total: m.total + 1 }));
        setOpen(false);
        return;
      }

      if (mode === "edit" && editingId) {
        const updated = await updateTeacher(editingId, draft);
        toast.dismiss(tId);
        toast.success("Cambios guardados", {
          description: `${draft.nombres} ${draft.apellidos}`.trim(),
        });

        setData((prev) =>
          prev.map((t) => (t.id === editingId ? apiToUi(updated) : t))
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
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profesores</h1>
        </div>
      </div>

      <TeachersTable
        data={data}
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <TeachersModal
        open={open}
        mode={mode}
        initial={initialDraft}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
      />
    </div>
  );
}
