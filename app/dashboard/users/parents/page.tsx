"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

// Ajusta estas rutas a tu proyecto (la idea es que sea “igual” a Students)
import ParentsTable from "@/src/components/parents/ParentsTable";
import ParentsModal, {
    emptyDraft as emptyParentDraft,
    type ParentDraft,
} from "@/src/components/parents/ParentsModal";
import type { Parent, Relationship, Estado } from "@/src/components/parents/types";

/**
 * =========================
 * API Types (lo que devuelve tu backend)
 * =========================
 * Sugerencia de shape típico para padres:
 * - ParentProfile: relationship, emergencyContact
 * - User: firstName, lastName, phone, email, status
 *
 * Ajusta campos según tu /api/parents
 */
type ApiParent = {
    id: string; // ParentProfile.id o User.id (según tu API)
    userId?: string;

    // datos del usuario (padre)
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    avatar?: string | null;
    status: string | null; // ACTIVE | INACTIVE | ...

    // datos del perfil padre
    relationship: string | null; // father | mother | guardian | tutor
    emergencyContact: boolean | null;

    createdAt?: string;
    updatedAt?: string;
};

type ApiList = {
    items: ApiParent[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
};

function mapRelationship(v: string | null | undefined): Relationship {
    const s = (v ?? "").toLowerCase().trim();
    if (s === "father") return "father";
    if (s === "mother") return "mother";
    if (s === "guardian") return "guardian";
    if (s === "tutor") return "tutor";
    return "guardian";
}

function mapEstado(v: string | null | undefined): Estado {
    const s = (v ?? "").toUpperCase().trim();
    // Ajusta esto si en tu UI quieres “activo/retirado” u otro set
    return s === "INACTIVE" || s === "SUSPENDED" || s === "LOCKED"
        ? "inactivo"
        : "activo";
}

function apiToUi(p: ApiParent): Parent {
    return {
        id: p.id,
        nombres: p.firstName ?? "",
        apellidos: p.lastName ?? "",
        email: p.email ?? "",
        telefono: p.phone ?? "",
        relacion: mapRelationship(p.relationship),
        emergencia: Boolean(p.emergencyContact),
        estado: mapEstado(p.status),
    };
}

/**
 * Payload para crear/editar padre.
 * Ajusta esto al DTO real que espere /api/parents
 */
type CreateParentPayload = {
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;

    relationship: Relationship;
    emergencyContact: boolean;

    // opcional: si al crear lo vinculas a un estudiante
    // studentId?: string;
};

type UpdateParentPayload = Partial<CreateParentPayload>;

/** pequeño debounce sin libs */
function useDebouncedValue<T>(value: T, delay = 300) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}

function uiToApi(d: ParentDraft, mode: "create" | "edit") {
    const base: CreateParentPayload = {
        firstName: (d.nombres ?? "").trim(),
        lastName: (d.apellidos ?? "").trim(),
        email: (d.email ?? "").trim() || null,
        phone: (d.telefono ?? "").trim() || null,
        relationship: (d.relacion ?? "guardian") as Relationship,
        emergencyContact: Boolean(d.emergencia),
        // studentId: d.studentId ?? undefined,
    };

    if (mode === "create") return base;
    // PATCH: manda solo lo editable (puedes mandar todo también si tu API lo soporta)
    const patch: UpdateParentPayload = { ...base };
    return patch;
}

export default function ParentsPage() {
    const [data, setData] = useState<Parent[]>([]);
    const [loading, setLoading] = useState(true);

    // búsqueda + paginación
    const [q, setQ] = useState("");
    const qDebounced = useDebouncedValue(q, 350);
    const [page, setPage] = useState(1);
    const pageSize = 200;

    const [meta, setMeta] = useState<ApiList["meta"]>({
        total: 0,
        page: 1,
        pageSize,
        totalPages: 0,
    });

    // modal
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [initialDraft, setInitialDraft] =
        useState<ParentDraft>(emptyParentDraft);

    async function load() {
        setLoading(true);
        try {
            const sp = new URLSearchParams();
            if (qDebounced.trim()) sp.set("q", qDebounced.trim());
            sp.set("page", String(page));
            sp.set("pageSize", String(pageSize));

            const res = await fetch(`/api/parents?${sp.toString()}`, {
                cache: "no-store",
            });
            if (!res.ok) throw new Error("No se pudo cargar padres");

            const json = (await res.json()) as ApiList;
            setData(json.items.map(apiToUi));
            setMeta(json.meta);
        } catch (e: any) {
            toast.error("Error cargando padres", {
                description: e?.message ?? "Intenta nuevamente",
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qDebounced, page]);

    function onCreate() {
        setMode("create");
        setEditingId(null);
        setInitialDraft(emptyParentDraft);
        setOpen(true);
    }

    function onEdit(p: Parent) {
        setMode("edit");
        setEditingId(p.id);
        const { id, ...rest } = p;
        setInitialDraft(rest as ParentDraft);
        setOpen(true);
    }

    async function doDelete(id: string) {
        const res = await fetch(`/api/parents/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("No se pudo eliminar");
    }

    function onDelete(id: string) {
        const p = data.find((x) => x.id === id);

        toast("¿Eliminar padre/madre?", {
            description: p ? `${p.nombres} ${p.apellidos}` : "Esta acción no se puede deshacer.",
            action: {
                label: "Eliminar",
                onClick: async () => {
                    const tId = toast.loading("Eliminando...");
                    try {
                        await doDelete(id);
                        toast.dismiss(tId);
                        toast.success("Eliminado");
                        setData((prev) => prev.filter((x) => x.id !== id));
                        setMeta((m) => ({ ...m, total: Math.max(0, m.total - 1) }));
                    } catch (e: any) {
                        toast.dismiss(tId);
                        toast.error("No se pudo eliminar", { description: e?.message });
                    }
                },
            },
            cancel: { label: "Cancelar", onClick: () => toast.message("Cancelado") },
        });
    }

    async function createParent(draft: ParentDraft) {
        const payload = uiToApi(draft, "create");

        const res = await fetch("/api/parents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.message ?? "Error creando padre");
        }

        return (await res.json()) as ApiParent;
    }

    async function updateParent(id: string, draft: ParentDraft) {
        const payload = uiToApi(draft, "edit");

        const res = await fetch(`/api/parents/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.message ?? "Error actualizando padre");
        }

        return (await res.json()) as ApiParent;
    }

    async function onSubmit(draft: ParentDraft) {
        const tId =
            mode === "create"
                ? toast.loading("Creando padre...")
                : toast.loading("Guardando cambios...");

        try {
            if (mode === "create") {
                const created = await createParent(draft);
                toast.dismiss(tId);
                toast.success("Padre creado", {
                    description: `${draft.nombres} ${draft.apellidos}`,
                });

                setData((prev) => [apiToUi(created), ...prev]);
                setMeta((m) => ({ ...m, total: m.total + 1 }));
                setOpen(false);
                return;
            }

            if (mode === "edit" && editingId) {
                const updated = await updateParent(editingId, draft);
                toast.dismiss(tId);
                toast.success("Cambios guardados", {
                    description: `${draft.nombres} ${draft.apellidos}`,
                });

                setData((prev) =>
                    prev.map((p) => (p.id === editingId ? apiToUi(updated) : p))
                );
                setOpen(false);
            }
        } catch (e: any) {
            toast.dismiss(tId);
            toast.error("Error", { description: e?.message ?? "Intenta nuevamente" });
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Padres</h1>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        {loading ? "Cargando..." : `${meta.total} registros`}
                    </p>
                </div>

                {/* Si tu ParentsTable ya incluye buscador, puedes quitar esto */}
                <div className="flex items-center gap-2">
                    <input
                        value={q}
                        onChange={(e) => {
                            setPage(1);
                            setQ(e.target.value);
                        }}
                        placeholder="Buscar..."
                        className="h-9 w-[260px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none"
                    />
                </div>
            </div>

            <ParentsTable
                data={data}
                onCreate={onCreate}
                onEdit={onEdit}
                onDelete={onDelete}
            />


            <ParentsModal
                open={open}
                mode={mode}
                initial={initialDraft}
                onClose={() => setOpen(false)}
                onSubmit={onSubmit}
            />
        </div>
    );
}
