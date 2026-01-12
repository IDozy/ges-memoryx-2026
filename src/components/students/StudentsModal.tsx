"use client";

import type { Student, Estado, Genero } from "./types";
import { useEffect, useState } from "react";

export type StudentDraft = Omit<Student, "id">;

export const emptyDraft: StudentDraft = {
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  telefono: "",
  encargado: "",
  fechaNacimiento: "",
  genero: "masculino",
  grado: "",
  escuela: "",
  estado: "activo",
};

export default function StudentsModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: StudentDraft; // para edit
  onClose: () => void;
  onSubmit: (draft: StudentDraft) => void;
}) {
  const [draft, setDraft] = useState<StudentDraft>(emptyDraft);

  useEffect(() => {
    if (!open) return;
    setDraft(initial ?? emptyDraft);
  }, [open, initial]);

  if (!open) return null;

  const title = mode === "create" ? "Nuevo estudiante" : "Editar estudiante";
  const saveLabel = mode === "create" ? "Crear" : "Guardar";

  function save() {
    if (!draft.nombre.trim() || !draft.apellidoPaterno.trim()) {
      alert("Completa al menos: Nombre y Apellido paterno.");
      return;
    }
    onSubmit(draft);
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10";

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

        <div className="p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nombre">
              <input
                className={inputCls}
                value={draft.nombre}
                onChange={(e) => setDraft({ ...draft, nombre: e.target.value })}
              />
            </Field>

            <Field label="Teléfono">
              <input
                className={inputCls}
                value={draft.telefono}
                onChange={(e) => setDraft({ ...draft, telefono: e.target.value })}
              />
            </Field>

            <Field label="Apellido paterno">
              <input
                className={inputCls}
                value={draft.apellidoPaterno}
                onChange={(e) =>
                  setDraft({ ...draft, apellidoPaterno: e.target.value })
                }
              />
            </Field>

            <Field label="Apellido materno">
              <input
                className={inputCls}
                value={draft.apellidoMaterno}
                onChange={(e) =>
                  setDraft({ ...draft, apellidoMaterno: e.target.value })
                }
              />
            </Field>

            <Field label="Encargado">
              <input
                className={inputCls}
                value={draft.encargado}
                onChange={(e) =>
                  setDraft({ ...draft, encargado: e.target.value })
                }
              />
            </Field>

            <Field label="Fecha de nacimiento">
              <input
                type="date"
                className={inputCls}
                value={draft.fechaNacimiento}
                onChange={(e) =>
                  setDraft({ ...draft, fechaNacimiento: e.target.value })
                }
              />
            </Field>

            <Field label="Género">
              <select
                className={inputCls}
                value={draft.genero}
                onChange={(e) =>
                  setDraft({ ...draft, genero: e.target.value as Genero })
                }
              >
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
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
                <option value="retirado">Retirado</option>
              </select>
            </Field>

            <Field label="Grado">
              <input
                className={inputCls}
                value={draft.grado}
                onChange={(e) => setDraft({ ...draft, grado: e.target.value })}
              />
            </Field>

            <Field label="Escuela">
              <input
                className={inputCls}
                value={draft.escuela}
                onChange={(e) => setDraft({ ...draft, escuela: e.target.value })}
              />
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1">
      <div className="text-xs font-medium opacity-80">{label}</div>
      {children}
    </label>
  );
}
