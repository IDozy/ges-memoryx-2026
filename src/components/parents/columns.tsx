"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Parent } from "./types";
import { Pencil, Trash2 } from "lucide-react";

export function getParentColumns(opts: {
  onEdit: (p: Parent) => void;
  onDelete: (id: string) => void;
}): ColumnDef<Parent>[] {
  return [
    {
      id: "rowNumber",
      header: "#",
      size: 40,
      cell: ({ row }) => (
        <span className="opacity-70 tabular-nums">{row.index + 1}</span>
      ),
    },
    {
      accessorKey: "nombres",
      header: "Nombres",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.nombres}</span>
      ),
    },
    { accessorKey: "apellidos", header: "Apellidos" },
    { accessorKey: "telefono", header: "Teléfono" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "relacion",
      header: "Relación",
      cell: ({ getValue }) => {
        const v = String(getValue() ?? "").toLowerCase();
        const label =
          v === "father"
            ? "Padre"
            : v === "mother"
            ? "Madre"
            : v === "tutor"
            ? "Tutor"
            : "Apoderado";

        return (
          <span className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-xs font-medium">
            {label}
          </span>
        );
      },
    },
    {
      accessorKey: "emergencia",
      header: "Emergencia",
      cell: ({ getValue }) => {
        const v = Boolean(getValue());
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium
              ${
                v
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-slate-100 text-slate-700 border border-slate-300"
              }`}
          >
            {v ? "Sí" : "No"}
          </span>
        );
      },
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ getValue }) => {
        const v = String(getValue() ?? "").toLowerCase();
        const isActivo = v === "activo";

        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium
              ${
                isActivo
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
          >
            {isActivo ? "Activo" : "Inactivo"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => opts.onEdit(row.original)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs hover:bg-[var(--color-muted)]"
          >
            <Pencil className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => opts.onDelete(row.original.id)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs hover:bg-[var(--color-muted)]"
          >
            <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
    },
  ];
}
