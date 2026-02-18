"use client";

import { useEffect, useState } from "react";
import type { Teacher, TeacherEstado } from "./types";

export type TeacherDraft = Omit<Teacher, "id" | "userId" | "employeeCode" | "email"> 


export const emptyDraft: TeacherDraft = {

  nombres: "",
  apellidos: "",
  telefono: "",
  especialidad: "",
  departamento: "",
  fechaIngreso: "",
  estado: "activo",
};

export const TEACHER_SPECIALTIES = [
  "Matemática",
  "Comunicación",
  "Ciencias Naturales",
  "Física",
  "Química",
  "Biología",
  "Historia",
  "Geografía",
  "Inglés",
  "Arte",
  "Educación Física",
  "Computación",
  "Robótica",
  "Programación",
  "Raz. Matemático",
  "Raz. Verbal",
  "Inicial",
  "Primaria",
  "Secundaria",
  "Tutoría",
  "Otro",
] as const;

export type TeacherSpecialty = typeof TEACHER_SPECIALTIES[number];

export default function TeachersModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: TeacherDraft;
  onClose: () => void;
  onSubmit: (draft: TeacherDraft) => void;
}) {
  const [draft, setDraft] = useState<TeacherDraft>(emptyDraft);

  useEffect(() => {
    if (!open) return;
    setDraft({ ...emptyDraft, ...(initial ?? {}) });
  }, [open, initial]);

  if (!open) return null;

  const title = mode === "create" ? "Nuevo profesor" : "Editar profesor";
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
            <div className={sectionTitleCls}>Datos del profesor</div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            <Field label="Nombres">
              <input
                className={inputCls}
                value={draft.nombres}
                onChange={(e) =>
                  setDraft({ ...draft, nombres: e.target.value })
                }
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

            <Field label="Especialidad">
  <select
    className={inputCls}
    value={draft.especialidad}
    onChange={(e) =>
      setDraft({ ...draft, especialidad: e.target.value })
    }
  >
    <option value="">Seleccionar...</option>
    {TEACHER_SPECIALTIES.map((s) => (
      <option key={s} value={s}>
        {s}
      </option>
    ))}
  </select>
</Field>


            <Field label="Departamento">
              <input
                className={inputCls}
                value={draft.departamento}
                onChange={(e) =>
                  setDraft({ ...draft, departamento: e.target.value })
                }
              />
            </Field>

            <Field label="Fecha de ingreso">
              <input
                type="date"
                className={inputCls}
                value={draft.fechaIngreso}
                onChange={(e) =>
                  setDraft({ ...draft, fechaIngreso: e.target.value })
                }
              />
            </Field>

            <Field label="Estado">
              <select
                className={inputCls}
                value={draft.estado}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    estado: e.target.value as TeacherEstado,
                  })
                }
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
                <option value="bloqueado">Bloqueado</option>
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
