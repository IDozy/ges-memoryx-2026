"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Student } from "./types";

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
        const v = getValue<string>();
        return (
          <span className="inline-flex items-center rounded-full bg-[var(--color-muted)] px-2.5 py-1 text-xs">
            {v === "activo" ? "Activo" : "Retirado"}
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
            Editar
          </button>
          <button
            onClick={() => opts.onDelete(row.original.id)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs hover:bg-[var(--color-muted)]"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];
}
