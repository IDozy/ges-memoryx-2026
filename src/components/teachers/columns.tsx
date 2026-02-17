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
      accessorKey: "employeeCode",
      header: "Código",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.employeeCode}</span>
      ),
    },
    {
      id: "nombreCompleto",
      header: "Profesor",
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex flex-col leading-tight">
            <span className="font-medium">
              {(t.nombres ?? "").trim()} {(t.apellidos ?? "").trim()}
            </span>
            <span className="text-xs opacity-70">{t.email}</span>
          </div>
        );
      },
    },
    { accessorKey: "telefono", header: "Teléfono" },
    { accessorKey: "especialidad", header: "Especialidad" },
    { accessorKey: "departamento", header: "Departamento" },
    {
      accessorKey: "fechaIngreso",
      header: "Ingreso",
      cell: ({ getValue }) => {
        const v = String(getValue() ?? "");
        return <span className="tabular-nums">{v || "-"}</span>;
      },
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ getValue }) => {
        const v = String(getValue() ?? "").toLowerCase();

        const isActivo = v === "activo";
        const isInactivo = v === "inactivo";
        const isSuspendido = v === "suspendido";
        const isBloqueado = v === "bloqueado";

        const cls = isActivo
          ? "bg-green-100 text-green-700 border border-green-300"
          : isInactivo
          ? "bg-gray-100 text-gray-700 border border-gray-300"
          : isSuspendido
          ? "bg-amber-100 text-amber-800 border border-amber-300"
          : "bg-red-100 text-red-700 border border-red-300";

        const label = isActivo
          ? "Activo"
          : isInactivo
          ? "Inactivo"
          : isSuspendido
          ? "Suspendido"
          : "Bloqueado";

        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}
          >
            {label}
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
            aria-label="Editar"
          >
            <Pencil className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => opts.onDelete(row.original.id)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs hover:bg-[var(--color-muted)]"
            aria-label="Eliminar"
          >
            <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
    },
  ];
}
