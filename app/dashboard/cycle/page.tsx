"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Ciclo = {
  id: string;
  name: string;
  createdAt: string;
};

export default function CiclosPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Ciclo[]>([]);
  const [loading, setLoading] = useState(true);

  // modal create/edit
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Ciclo | null>(null);
  const [nombre, setNombre] = useState("");

  // modal delete
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState<Ciclo | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/academic-cycles?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setItems(json.items ?? []);
    } catch {
      toast.error("No se pudo cargar ciclos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => load(), 250); // mini debounce
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => items, [items]);

  function openCreate() {
    setFormMode("create");
    setEditing(null);
    setNombre("");
    setOpenForm(true);
  }

  function openEdit(c: Ciclo) {
    setFormMode("edit");
    setEditing(c);
    setNombre(c.name);
    setOpenForm(true);
  }

  function askDelete(c: Ciclo) {
    setDeleting(c);
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
        const res = await fetch("/api/academic-cycles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: v }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message ?? "No se pudo crear");
        }

        toast.success("Ciclo creado");
      } else {
        const res = await fetch(`/api/academic-cycles/${editing!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: v }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message ?? "No se pudo actualizar");
        }

        toast.success("Ciclo actualizado");
      }

      setOpenForm(false);
      setEditing(null);
      setNombre("");
      await load();
    } catch (e: any) {
      toast.error("Error", { description: e.message });
    }
  }

  async function confirmDelete() {
    if (!deleting) return;

    try {
      const res = await fetch(`/api/academic-cycles/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "No se pudo eliminar");
      }
      toast.success("Ciclo eliminado");
      setOpenDelete(false);
      setDeleting(null);
      await load();
    } catch (e: any) {
      toast.error("Error", { description: e.message });
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Ciclos</h1>

        <button
          onClick={openCreate}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-semibold hover:opacity-90"
        >
          NUEVO CICLO
        </button>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar"
            className="w-full sm:max-w-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
          />

          <div className="text-sm opacity-70 sm:ml-auto">
            {loading ? "Cargando..." : `${filtered.length} ciclo(s)`}
          </div>
        </div>

        {/* Cards */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
            >
              <div className="p-5">
                <div className="text-lg font-semibold">{c.name}</div>

                <div className="mt-4 flex items-center gap-3 text-xs">
                  <Link
                    href={`/dashboard/cycle/${c.id}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-semibold hover:bg-[var(--color-muted)]"
                  >
                    GESTIONAR
                  </Link>

                  <button
                    onClick={() => openEdit(c)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-semibold hover:bg-[var(--color-muted)]"
                    aria-label="Editar"
                    title="Editar"
                  >
                     <Pencil className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </button>

                  <button
                    onClick={() => askDelete(c)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-semibold hover:bg-[var(--color-muted)]"
                    aria-label="Eliminar"
                    title="Eliminar"
                  >
                     <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-sm opacity-70">
              No hay ciclos. Crea uno con “Nuevo ciclo”.
            </div>
          )}
        </div>
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
                  {formMode === "create" ? "Nuevo ciclo" : "Editar ciclo"}
                </div>
                <div className="text-xs opacity-70">
                  {formMode === "create" ? "Crea un ciclo (ej: Regular 2026)" : "Actualiza el nombre del ciclo"}
                </div>
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
                <div className="text-xs font-medium opacity-80">Nombre</div>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Regular 2026"
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
                <div className="text-sm font-semibold">Eliminar ciclo</div>
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
              ¿Seguro que deseas eliminar <span className="font-semibold">{deleting.name}</span>?
              <div className="mt-2 text-xs opacity-70">
                Si este ciclo tiene pagos/boletas asociados, el sistema podría bloquear la eliminación.
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
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-semibold hover:opacity-90"
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
