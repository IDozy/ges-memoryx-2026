"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Student } from "./types";
import { Pencil, Trash2 } from "lucide-react";

export function getStudentColumns(opts: {
  onEdit: (s: Student) => void;
  onDelete: (id: string) => void;
}): ColumnDef<Student>[] {
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
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => <span className="font-medium">{row.original.nombre}</span>,
    },
    { accessorKey: "apellidoPaterno", header: "Ap. paterno" },
    { accessorKey: "apellidoMaterno", header: "Ap. materno" },
    { accessorKey: "telefono", header: "Teléfono" },
    { accessorKey: "encargado", header: "Encargado" },
    { accessorKey: "grado", header: "Grado" },
    { accessorKey: "escuela", header: "Escuela" },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ getValue }) => {
        const v = String(getValue() ?? "").toLowerCase();

        const isActivo = v === "activo";

        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium
        ${isActivo
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
              }`}
          >
            {isActivo ? "Activo" : "Retirado"}
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
