"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { RegistrarTarget } from "./types";

export function RegistrarMesModal({
  open,
  target,
  onClose,
  onSubmit,
}: {
  open: boolean;
  target: RegistrarTarget | null;
  onClose: () => void;
  onSubmit: (total: number) => void;
}) {
  const [total, setTotal] = useState("");

  // ✅ useEffect (esto SÍ es un efecto)
  useEffect(() => {
    if (!open || !target) return;
    setTotal(String(target.defaultTotal));
  }, [open, target]);

  // ✅ (opcional) limpiar al cerrar
  useEffect(() => {
    if (open) return;
    setTotal("");
  }, [open]);

  if (!open || !target) return null;

  function submit() {
    const v = Number(total);
    if (!Number.isFinite(v) || v <= 0) {
      toast.error("Total inválido", { description: "Ingresa un total mayor a 0." });
      return;
    }
    onSubmit(v);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Cerrar" />
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
          <div>
            <div className="text-sm font-semibold">Registrar mes</div>
            <div className="text-xs opacity-70">
              {target.studentName} • {target.mesName}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs hover:bg-[var(--color-muted)]"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="text-sm opacity-80">
            Este mes estaba como <span className="font-medium">No registrado</span>.
            Regístralo para poder cobrar y permitir abonos.
          </div>

          <label className="space-y-1 block">
            <div className="text-xs font-medium opacity-80">Total a cobrar (mes)</div>
            <input
              inputMode="decimal"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
              placeholder="Ej: 80"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] p-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm hover:bg-[var(--color-muted)]"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-sm font-medium hover:opacity-80"
          >
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}
