"use client";

import type { EstadoPago, PagoItem } from "./types";
import { money } from "./utils";

export function PagoCell({
  estado,
  total,
  sum,
  pagosCount,
  onAbonar,
  onRegistrar,
  onBoleta,
  pagos,
}: {
  estado: EstadoPago;
  total: number;
  sum: number;
  pagosCount: number;
  pagos?: PagoItem[];
  onAbonar: () => void;
  onRegistrar: () => void;
  onBoleta: () => void;
}) {
  const badge =
    estado === "PAGADO"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : estado === "PENDIENTE"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
        : estado === "NO_REGISTRADO"
          ? "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300"
          : "bg-blue-500/15 text-blue-700 dark:text-blue-300";

  const label =
    estado === "PAGADO"
      ? "Pagado"
      : estado === "PENDIENTE"
        ? "Pendiente"
        : estado === "NO_REGISTRADO"
          ? "No registrado"
          : "Abonar";

  return (
    <div className="flex items-start justify-center gap-2">
      {estado === "PAGADO" ? (
        <button
          onClick={onBoleta}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[11px] font-semibold hover:bg-[var(--color-muted)]"
        >
          GENERAR BOLETA
        </button>
      ) : estado === "NO_REGISTRADO" ? (
        <button
          onClick={onRegistrar}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[11px] font-semibold hover:bg-[var(--color-muted)]"
        >
          REGISTRAR
        </button>
      ) : (
        <button
          onClick={onAbonar}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[11px] font-semibold hover:bg-[var(--color-muted)]"
        >
          ABONAR
        </button>
      )}

      <div className="min-w-[170px]">
        <div className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] ${badge}`}>
          {label}
        </div>

        {estado !== "NO_REGISTRADO" && pagosCount > 0 && (
          <div className="mt-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[11px]">
            <div className="space-y-0.5">
              {(pagos ?? []).slice(0, 5).map((p, i) => (
                <div key={`${p.date}-${i}`} className="tabular-nums opacity-90">
                  {i + 1}° {p.date} - {money(p.amount)}
                </div>
              ))}
              {(pagos ?? []).length > 5 && (
                <div className="opacity-60">+ {(pagos ?? []).length - 5} más</div>
              )}
            </div>

            <div className="mt-1 flex items-center justify-between border-t border-[var(--color-border)] pt-1 opacity-80">
              <span>Acum.</span>
              <span className="font-medium">{money(sum)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-[var(--color-border)] pt-1 opacity-80">
              <span>Deuda Total.</span>
              <span className="font-medium">{money(total)}</span>
            </div>
          </div>
        )}

        {estado !== "NO_REGISTRADO" && pagosCount === 0 && (
          <div className="mt-1 text-[11px] opacity-60">
            Sin pagos • {money(0)} / {money(total)}
          </div>
        )}
      </div>
    </div>
  );
}
