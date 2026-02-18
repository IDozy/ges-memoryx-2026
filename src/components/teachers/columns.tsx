"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Teacher } from "./types";
import { Pencil, Trash2 } from "lucide-react";

export function getTeacherColumns(opts: {
  onEdit: (t: Teacher) => void;
  onDelete: (id: string) => void;
}): ColumnDef<Teacher>[] {
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
        <span className="font-medium">
          {row.original.nombres} {row.original.apellidos}
        </span>
      ),
    },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "telefono", header: "Teléfono" },
    { accessorKey: "employeeCode", header: "Código" },
    { accessorKey: "especialidad", header: "Especialidad" },
    { accessorKey: "departamento", header: "Departamento" },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ getValue }) => {
        const v = String(getValue() ?? "").toLowerCase();
        const map: Record<string, { label: string; cls: string }> = {
          activo: { label: "Activo", cls: "bg-green-100 text-green-700 border border-green-300" },
          inactivo: { label: "Inactivo", cls: "bg-gray-100 text-gray-700 border border-gray-300" },
          suspendido: { label: "Suspendido", cls: "bg-yellow-100 text-yellow-800 border border-yellow-300" },
          bloqueado: { label: "Bloqueado", cls: "bg-red-100 text-red-700 border border-red-300" },
        };
        const s = map[v] ?? map.activo;

        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>
            {s.label}
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
            <Pencil className="h-4 w-4 transition-transform group-hover:scale-110" />
          </button>
          <button
            onClick={() => opts.onDelete(row.original.id)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs hover:bg-[var(--color-muted)]"
          >
            <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
          </button>
        </div>
      ),
    },
  ];
}
