"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { AbonarTarget } from "./types";
import { money } from "./utils";

export function AbonarModal({
  open,
  target,
  onClose,
  onSubmit,
}: {
  open: boolean;
  target: AbonarTarget | null;
  onClose: () => void;
  onSubmit: (amount: number, date: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  useMemo(() => {
    if (!open || !target) return;
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
  }, [open, target]);

  if (!open || !target) return null;

  const remaining = Math.max(0, target.total - target.sumActual);

  function submit() {
    const v = Number(amount);
    if (!Number.isFinite(v) || v <= 0) {
      toast.error("Monto inválido", { description: "Ingresa un monto mayor a 0." });
      return;
    }
    if (v > remaining && remaining > 0) {
      toast.message("Monto supera el saldo", {
        description: `Saldo: ${money(remaining)}. Se registrará igual.`,
      });
    }
    onSubmit(v, date);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Cerrar" />
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
          <div>
            <div className="text-sm font-semibold">Abonar</div>
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
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="opacity-80">Total del mes</span>
              <span className="font-medium">{money(target.total)}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="opacity-80">Pagado</span>
              <span className="font-medium">{money(target.sumActual)}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="opacity-80">Saldo</span>
              <span className="font-medium">{money(remaining)}</span>
            </div>
          </div>

          <label className="space-y-1 block">
            <div className="text-xs font-medium opacity-80">Fecha</div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1 block">
            <div className="text-xs font-medium opacity-80">Monto a abonar</div>
            <input
              inputMode="decimal"
              placeholder={`Ej: ${remaining > 0 ? remaining.toFixed(2) : "10.00"}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            />
            <div className="text-[11px] opacity-70">
              Puedes registrar pagos parciales. Se acumulan automáticamente.
            </div>
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
            Registrar abono
          </button>
        </div>
      </div>
    </div>
  );
}
