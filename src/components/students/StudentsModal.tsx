"use client";

import type { Student, Estado, Genero } from "./types";
import { useEffect, useState } from "react";

export type StudentDraft = Omit<Student, "id"> & {
  parentFirstName?: string;
  parentLastName?: string;
  parentRelationship?: string; // father | mother | guardian | tutor
};

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

  parentFirstName: "",
  parentLastName: "",
  parentRelationship: "guardian",
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
    setDraft({ ...emptyDraft, ...(initial ?? {}) });
  }, [open, initial]);

  if (!open) return null;

  const title = mode === "create" ? "Nuevo estudiante" : "Editar estudiante";
  const saveLabel = mode === "create" ? "Crear" : "Guardar";

  function save() {
    if (!draft.nombre.trim() || !draft.apellidoPaterno.trim()) {
      alert("Completa al menos: Nombre y Apellido paterno.");
      return;
    }

    // ✅ si en CREATE vas a crear cuenta del apoderado, pide lo mínimo
    if (mode === "create") {
      const pf = (draft.parentFirstName ?? "").trim();
      const pl = (draft.parentLastName ?? "").trim();
      if (!pf || !pl) {
        alert("Completa al menos: Nombres y Apellidos del apoderado/padre.");
        return;
      }
    }

    onSubmit(draft);
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10";

  const sectionTitleCls = "text-sm font-semibold";
  const sectionHintCls = "text-xs opacity-70";

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

        {/* ✅ Scroll + altura controlada */}
        <div className="p-4 space-y-6 max-h-[70dvh] overflow-y-auto">
          {/* ===================== DATOS ESTUDIANTE ===================== */}
          <div className="space-y-1">
            <div className={sectionTitleCls}>Datos del estudiante</div>
          </div>

          {/* ✅ 3 columnas en pantallas grandes */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                onChange={(e) =>
                  setDraft({ ...draft, telefono: e.target.value })
                }
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

            <Field label="Encargado (texto)">
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
                onChange={(e) =>
                  setDraft({ ...draft, escuela: e.target.value })
                }
              />
            </Field>
          </div>

          {/* ===================== APODERADO (SOLO CREATE) ===================== */}
          {mode === "create" && (
            <>
              <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
                <div className={sectionTitleCls}>Datos del apoderado / padre</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Nombres">
                  <input
                    className={inputCls}
                    value={draft.parentFirstName ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, parentFirstName: e.target.value })
                    }
                  />
                </Field>

                <Field label="Apellidos">
                  <input
                    className={inputCls}
                    value={draft.parentLastName ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, parentLastName: e.target.value })
                    }
                  />
                </Field>

                <Field label="Relación">
                  <select
                    className={inputCls}
                    value={draft.parentRelationship ?? "guardian"}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        parentRelationship: e.target.value,
                      })
                    }
                  >
                    <option value="father">Padre</option>
                    <option value="mother">Madre</option>
                    <option value="guardian">Apoderado</option>
                    <option value="tutor">Tutor</option>
                  </select>
                </Field>
              </div>
            </>
          )}
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
