"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type TipoActividad = "NIVEL" | "TALLER";
type ActividadItem = { id: string; nombre: string; tipo: TipoActividad; createdAt: string };

type CicloDetail = {
  id: string;
  nombre: string;
  createdAt: string;
  actividades: ActividadItem[];
};

function formatDMY(dateIso: string) {
  const d = new Date(dateIso);
  const day = d.getDate();
  const m = d.getMonth() + 1;
  const y = d.getFullYear();
  return `${day}/${m}/${y}`;
}

export default function GestionarCicloPage() {
  const params = useParams<{ id: string }>();
  const rawId = params.id;
  const cicloId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [loading, setLoading] = useState(true);
  const [ciclo, setCiclo] = useState<CicloDetail | null>(null);
  const [q, setQ] = useState("");

  // modal create/edit
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<ActividadItem | null>(null);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoActividad>("NIVEL");

  // modal delete
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState<ActividadItem | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/cycles/${cicloId}/detail`, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar el ciclo");
      const json = await res.json();
      setCiclo(json.ciclo);
    } catch (e: any) {
      toast.error("Error", { description: e.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cicloId]);

  const actividades = useMemo(() => {
    const list = ciclo?.actividades ?? [];
    const qq = q.trim().toLowerCase();
    if (!qq) return list;
    return list.filter((x) => `${x.nombre} ${x.tipo}`.toLowerCase().includes(qq));
  }, [ciclo, q]);

  function openCreate() {
    setFormMode("create");
    setEditing(null);
    setNombre("");
    setTipo("NIVEL");
    setOpenForm(true);
  }

  function openEdit(a: ActividadItem) {
    setFormMode("edit");
    setEditing(a);
    setNombre(a.nombre);
    setTipo(a.tipo);
    setOpenForm(true);
  }

  function askDelete(a: ActividadItem) {
    setDeleting(a);
    setOpenDelete(true);
  }

  async function submitForm() {
    const v = nombre.trim();
    if (!v) {
      toast.error("Nombre requerido");
      return;
    }

    try {
      if (formMode === "create") {
        const res = await fetch(`/api/cycles/${cicloId}/levels`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: v, tipo }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message ?? "No se pudo crear");
        }
        toast.success(tipo === "NIVEL" ? "Nivel creado" : "Taller creado");
      } else {
        const res = await fetch(`/api/levels/${editing!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: v, tipo }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message ?? "No se pudo actualizar");
        }
        toast.success("Actividad actualizada");
      }

      setOpenForm(false);
      setEditing(null);
      setNombre("");
      setTipo("NIVEL");
      await load();
    } catch (e: any) {
      toast.error("Error", { description: e.message });
    }
  }

  async function confirmDelete() {
    if (!deleting) return;

    try {
      const res = await fetch(`/api/levels/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "No se pudo eliminar");
      }
      toast.success("Actividad eliminada");
      setOpenDelete(false);
      setDeleting(null);
      await load();
    } catch (e: any) {
      toast.error("Error", { description: e.message });
    }
  }

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xl font-semibold">
              {ciclo?.nombre ?? (loading ? "Cargando..." : "—")}
            </div>
            <div className="mt-1 text-xs opacity-70">
              Fecha de creación: {ciclo?.createdAt ? formatDMY(ciclo.createdAt) : "—"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openCreate}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-semibold hover:opacity-90"
            >
              NUEVA ACTIVIDAD
            </button>
          </div>
        </div>

        {/* Search + count */}
        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] p-5 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar actividad..."
            className="w-full sm:max-w-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
          />

          <div className="text-sm opacity-70 sm:ml-auto">
            {loading ? "Cargando..." : `${actividades.length} actividad(es)`}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
        <div className="divide-y divide-[var(--color-border)]">
          {actividades.map((a) => (
            <div key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  {a.nombre}
                  <span className="rounded-lg bg-[var(--color-muted)] px-2 py-0.5 text-xs opacity-80">
                    {a.tipo}
                  </span>
                </div>
                <div className="mt-1 text-xs opacity-60">
                  Creado: <span className="tabular-nums">{formatDMY(a.createdAt)}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/dashboard/cycle/${cicloId}/levels/${a.id}`}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-xs font-semibold hover:opacity-90"
                >
                  GESTIONAR
                </Link>

                <button
                  onClick={() => openEdit(a)}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs font-semibold hover:bg-[var(--color-muted)]"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  onClick={() => askDelete(a)}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs font-semibold text-red-600 hover:bg-[var(--color-muted)]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {!loading && actividades.length === 0 && (
            <div className="p-8 text-sm opacity-70">
              No hay actividades. Crea una con “Nueva actividad”.
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div>
        <Link
          href="/dashboard/cycle"
          className="inline-flex rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-semibold hover:opacity-90"
        >
          VOLVER A LA LISTA
        </Link>
      </div>

      {/* Modal Create/Edit */}
      {openForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenForm(false)}
            aria-label="Cerrar"
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
              <div>
                <div className="text-sm font-semibold">
                  {formMode === "create" ? "Nueva actividad" : "Editar actividad"}
                </div>
                <div className="text-xs opacity-70">{ciclo?.nombre ?? "—"}</div>
              </div>
              <button
                onClick={() => setOpenForm(false)}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs hover:bg-[var(--color-muted)]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <label className="space-y-1 block">
                <div className="text-xs font-medium opacity-80">Tipo</div>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoActividad)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                >
                  <option value="NIVEL">NIVEL</option>
                  <option value="TALLER">TALLER</option>
                </select>
              </label>

              <label className="space-y-1 block">
                <div className="text-xs font-medium opacity-80">
                  Nombre {tipo === "NIVEL" ? "del nivel" : "del taller"}
                </div>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={tipo === "NIVEL" ? "Ej: Nivel 1" : "Ej: Matemática"}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-[var(--color-border)] p-4">
              <button
                onClick={() => setOpenForm(false)}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm hover:bg-[var(--color-muted)]"
              >
                Cancelar
              </button>
              <button
                onClick={submitForm}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-semibold hover:opacity-90"
              >
                {formMode === "create" ? "Crear" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {openDelete && deleting && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenDelete(false)}
            aria-label="Cerrar"
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
              <div>
                <div className="text-sm font-semibold">Eliminar actividad</div>
                <div className="text-xs opacity-70">Esto no se puede deshacer.</div>
              </div>
              <button
                onClick={() => setOpenDelete(false)}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs hover:bg-[var(--color-muted)]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 text-sm">
              ¿Seguro que deseas eliminar{" "}
              <span className="font-semibold">{deleting.nombre}</span>{" "}
              <span className="rounded-lg bg-[var(--color-muted)] px-2 py-0.5 text-xs ml-2 opacity-80">
                {deleting.tipo}
              </span>
              ?
              <div className="mt-2 text-xs opacity-70">
                Si esta actividad tiene estudiantes asociados, el sistema podría bloquear la eliminación.
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[var(--color-border)] p-4">
              <button
                onClick={() => setOpenDelete(false)}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm hover:bg-[var(--color-muted)]"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-semibold text-red-700 hover:opacity-90"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
