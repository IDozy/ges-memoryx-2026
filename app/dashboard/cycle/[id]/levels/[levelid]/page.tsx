"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";


type AssignedRow = {
  id: string; // StudentActividad id (para borrar)
  createdAt: string;
  student: {
    id: string;
    firstName: string;
    lastNameFather: string;
    lastNameMother: string;
    status: "ACTIVO" | "RETIRADO";
  };
};

type LevelDetail = {
  id: string;
  nombre: string;
  createdAt: string;
  estudiantes: AssignedRow[];
};

type StudentItem = {
  id: string;
  firstName: string;
  lastNameFather: string;
  lastNameMother: string;
  status: "ACTIVO" | "RETIRADO";
};

function fullName(s: StudentItem | AssignedRow["student"]) {
  return `${s.firstName} ${s.lastNameFather} ${s.lastNameMother}`.replace(/\s+/g, " ").trim();
}

function formatDMY(iso: string) {
  const d = new Date(iso);
  const day = d.getDate();
  const m = d.getMonth() + 1;
  const y = d.getFullYear();
  return `${day}/${m}/${y}`;
}

export default function GestionNivelPage() {
  const params = useParams<{ id: string; levelid: string }>();

  const cycleId = Array.isArray(params.id) ? params.id[0] : params.id;
  const levelId = Array.isArray(params.levelid) ? params.levelid[0] : params.levelid;

  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<LevelDetail | null>(null);

  // modal agregar
  const [openAdd, setOpenAdd] = useState(false);
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<StudentItem[]>([]);

  async function loadLevel() {
    if (!levelId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/levels/${levelId}/detail`);
      if (!res.ok) throw new Error("No se pudo cargar el nivel");
      const json = await res.json();
      setLevel(json.level);
    } catch (e: any) {
      toast.error("Error", { description: e.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId]);

  const assignedIds = useMemo(() => {
    return new Set((level?.estudiantes ?? []).map((x) => x.student.id));
  }, [level]);

  async function searchStudents() {
    setSearching(true);
    try {
      const res = await fetch(`/api/students/search?q=${encodeURIComponent(q)}&status=ACTIVO`);
      if (!res.ok) throw new Error("No se pudo buscar estudiantes");
      const json = await res.json();
      setResults(json.items ?? []);
    } catch (e: any) {
      toast.error("Error", { description: e.message });
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    if (!openAdd) return;
    const t = setTimeout(() => searchStudents(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, openAdd]);

  async function addStudent(studentId: string) {
    try {
      const res = await fetch(`/api/levels/${levelId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "No se pudo asignar");
      }

      toast.success("Estudiante agregado");
      await loadLevel();
    } catch (e: any) {
      toast.error("Error", { description: e.message });
    }
  }

  async function removeAssigned(studentActividadId: string) {
    try {
      const res = await fetch(`/api/student-actividad/${studentActividadId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "No se pudo quitar");
      }

      toast.success("Estudiante quitado");
      await loadLevel();
    } catch (e: any) {
      toast.error("Error", { description: e.message });
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-2xl font-semibold tracking-tight">
              Gestión de la actividad: {level?.nombre ?? (loading ? "Cargando..." : "—")}
            </div>
            <div className="mt-1 text-xs opacity-70">
              {level?.createdAt ? `Creado: ${formatDMY(level.createdAt)}` : ""}
            </div>
          </div>

          <button
            onClick={() => {
              setOpenAdd(true);
              setQ("");
              setResults([]);
              setTimeout(() => searchStudents(), 0);
            }}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-semibold hover:opacity-90"
          >
            AGREGAR ESTUDIANTE
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[var(--color-border)]">
          <div className="text-sm font-semibold">Estudiantes asignados:</div>
          <div className="mt-1 text-xs opacity-70">
            {loading ? "Cargando..." : `${level?.estudiantes.length ?? 0} estudiante(s)`}
          </div>
        </div>

        <div className="divide-y divide-[var(--color-border)]">
          {(level?.estudiantes ?? []).map((row) => (
            <div key={row.id} className="flex items-center gap-3 p-4">
              <div className="flex-1">
                <div className="font-medium">{fullName(row.student)}</div>
                <div className="text-xs opacity-70">Ingresó: {formatDMY(row.createdAt)}</div>
              </div>

              <button
                onClick={() => removeAssigned(row.id)}
                title="Quitar estudiante"
                aria-label="Quitar estudiante"
                className="group inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-red-600 hover:bg-red-50 hover:border-red-200 transition"
              >
                <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </button>

            </div>
          ))}

          {!loading && (level?.estudiantes?.length ?? 0) === 0 && (
            <div className="p-8 text-sm opacity-70">
              No hay estudiantes asignados. Usa “Agregar estudiante”.
            </div>
          )}
        </div>
      </div>

      {/* Back */}
      <div className="flex gap-2">
        <Link
          href={`/dashboard/cycle/${cycleId}`}
          className="inline-flex rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-semibold hover:opacity-90"
        >
          VOLVER
        </Link>
      </div>

      {/* Modal Agregar */}
      {openAdd && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenAdd(false)}
            aria-label="Cerrar"
          />
          <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
              <div>
                <div className="text-sm font-semibold">Agregar estudiante</div>
                <div className="text-xs opacity-70">{level?.nombre ?? "—"}</div>
              </div>
              <button
                onClick={() => setOpenAdd(false)}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs hover:bg-[var(--color-muted)]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar estudiante por nombre..."
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
              />

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                <div className="divide-y divide-[var(--color-border)] max-h-[420px] overflow-auto">
                  {searching && (
                    <div className="p-4 text-sm opacity-70">Buscando...</div>
                  )}

                  {!searching &&
                    results.map((s) => {
                      const already = assignedIds.has(s.id);
                      return (
                        <div key={s.id} className="flex items-center gap-3 p-4">
                          <div className="flex-1">
                            <div className="font-medium">{fullName(s)}</div>
                            <div className="text-xs opacity-60">{s.status}</div>
                          </div>

                          <button
                            disabled={already}
                            onClick={() => addStudent(s.id)}
                            className={`rounded-xl border border-[var(--color-border)] px-4 py-2 text-xs font-semibold
                              ${already ? "opacity-50 cursor-not-allowed" : "bg-[var(--color-muted)] hover:opacity-90"}`}
                          >
                            {already ? "ASIGNADO" : "AGREGAR"}
                          </button>
                        </div>
                      );
                    })}

                  {!searching && results.length === 0 && (
                    <div className="p-4 text-sm opacity-70">Sin resultados</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[var(--color-border)] p-4">
              <button
                onClick={() => setOpenAdd(false)}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm hover:bg-[var(--color-muted)]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
