"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { RegistroRow } from "./types";

export function getRegistroColumns(): ColumnDef<RegistroRow>[] {
  return [
    { accessorKey: "fecha", header: "FECHA" },
    { accessorKey: "apellidosNombres", header: "APELLIDOS Y NOMBRES" },
    { accessorKey: "grado", header: "GRADO" },
    { accessorKey: "fNac", header: "F. NAC" },

    {
      accessorKey: "talleres",
      header: "TALLER",
      cell: ({ row }) => {
        const talleres = row.original.talleres ?? [];
        return (
          <div className="flex flex-wrap gap-1">
            {talleres.length === 0 ? (
              <span className="opacity-60">—</span>
            ) : (
              talleres.map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-[var(--color-muted)] px-2 py-1 text-xs"
                >
                  {t}
                </span>
              ))
            )}
          </div>
        );
      },
    },

    { accessorKey: "tutor", header: "TUTOR" },
    { accessorKey: "telefono", header: "TELÉFONO" },
    {
      accessorKey: "domicilio",
      header: "DOMICILIO",
      cell: ({ row }) => (
        <span className="block max-w-[260px] truncate">
          {row.original.domicilio || "—"}
        </span>
      ),
    },

    {
      accessorKey: "cuota",
      header: "CUOTA",
      cell: ({ row }) => (
        <span className="font-semibold">
          S/ {Number(row.original.cuota || 0).toFixed(2)}
        </span>
      ),
    },

    {
      accessorKey: "pagoEstado",
      header: "PAGO",
      cell: ({ row }) => {
        const s = row.original.pagoEstado;
        const cls =
          s === "PAGADO"
            ? "bg-green-100 text-green-700"
            : s === "PENDIENTE"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-red-100 text-red-700";

        return (
          <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${cls}`}>
            {s}
          </span>
        );
      },
    },

    {
      accessorKey: "observacion",
      header: "OBS.",
      cell: ({ row }) => (
        <span className="block max-w-[220px] truncate opacity-80">
          {row.original.observacion || "—"}
        </span>
      ),
    },
  ];
}
