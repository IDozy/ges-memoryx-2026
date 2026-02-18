"use client";

import { useEffect, useState } from "react";
import type { Parent, Estado, Relationship } from "./types";

export type ParentDraft = Omit<Parent, "id">;

export const emptyDraft: ParentDraft = {
  nombres: "",
  apellidos: "",
  telefono: "",
  email: "",
  relacion: "guardian",
  emergencia: false,
  estado: "activo",
};

export default function ParentsModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: ParentDraft;
  onClose: () => void;
  onSubmit: (draft: ParentDraft) => void;
}) {
  const [draft, setDraft] = useState<ParentDraft>(emptyDraft);

  useEffect(() => {
    if (!open) return;
    setDraft({ ...emptyDraft, ...(initial ?? {}) });
  }, [open, initial]);

  if (!open) return null;

  const title = mode === "create" ? "Nuevo padre" : "Editar padre";
  const saveLabel = mode === "create" ? "Crear" : "Guardar";

  function save() {
    if (!draft.nombres.trim() || !draft.apellidos.trim()) {
      alert("Completa al menos: Nombres y Apellidos.");
      return;
    }
    onSubmit(draft);
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10";

  const sectionTitleCls = "text-sm font-semibold";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
          <div className="text-sm font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs hover:bg-[var(--color-muted)]"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-6 max-h-[70dvh] overflow-y-auto">
          <div className="space-y-1">
            <div className={sectionTitleCls}>Datos del padre / apoderado</div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nombres">
              <input
                className={inputCls}
                value={draft.nombres}
                onChange={(e) => setDraft({ ...draft, nombres: e.target.value })}
              />
            </Field>

            <Field label="Apellidos">
              <input
                className={inputCls}
                value={draft.apellidos}
                onChange={(e) =>
                  setDraft({ ...draft, apellidos: e.target.value })
                }
              />
            </Field>

            <Field label="Teléfono">
              <input
                className={inputCls}
                value={draft.telefono}
                onChange={(e) =>
                  setDraft({ ...draft, telefono: e.target.value })
                }
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                className={inputCls}
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </Field>

            <Field label="Relación">
              <select
                className={inputCls}
                value={draft.relacion}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    relacion: e.target.value as Relationship,
                  })
                }
              >
                <option value="father">Padre</option>
                <option value="mother">Madre</option>
                <option value="guardian">Apoderado</option>
                <option value="tutor">Tutor</option>
              </select>
            </Field>

            <Field label="Emergencia">
              <select
                className={inputCls}
                value={draft.emergencia ? "yes" : "no"}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    emergencia: e.target.value === "yes",
                  })
                }
              >
                <option value="no">No</option>
                <option value="yes">Sí</option>
              </select>
            </Field>

            <Field label="Estado">
              <select
                className={inputCls}
                value={draft.estado}
                onChange={(e) =>
                  setDraft({ ...draft, estado: e.target.value as Estado })
                }
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] p-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm hover:bg-[var(--color-muted)]"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-medium hover:opacity-80"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1">
      <div className="text-xs font-medium opacity-80">{label}</div>
      {children}
    </label>
  );
}
