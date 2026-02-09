"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";


type Props = {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
};
type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ active: boolean }>;

};
type NavLink = {
  type: "link";
  key: string;
  label: string;
  icon: ComponentType<{ active: boolean }>;

  href: string;
};
type NavGroup = {
  type: "group";
  key: string;
  label: string;
  icon: ComponentType<{ active: boolean }>;

  items: NavItem[];
};

type NavNode = NavLink | NavGroup;

const navTree: NavNode[] = [
  {
    type: "link",
    key: "main",
    label: "Inicio",
    icon: HomeIcon,
    href: "/dashboard",
  },
  {
    type: "group",
    key: "users",
    label: "Usuarios",
    icon: UsersIcon,
    items: [
      { href: "/dashboard/students", label: "Estudiantes", icon: UsersIcon },
      { href: "/dashboard/users/teachers", label: "Profesores", icon: TeacherIcon },
      { href: "/dashboard/users/parents", label: "Padres/Tutores", icon: ParentIcon },
      { href: "/dashboard/users/staff", label: "Administrativos", icon: StaffIcon },
    ],
  },
  {
    type: "group",
    key: "academic",
    label: "Académico",
    icon: BookIcon,
    items: [
      { href: "/dashboard/cycle", label: "Ciclos", icon: BookIcon },
      { href: "/dashboard/record", label: "Registro Ciclo", icon: BookIcon },
      { href: "/dashboard/academic/courses", label: "Cursos", icon: CoursesIcon },
      { href: "/dashboard/academic/classes", label: "Clases/Lecciones", icon: LessonsIcon },
      { href: "/dashboard/academic/schedule", label: "Horarios", icon: CalendarIcon },
      { href: "/dashboard/academic/materials", label: "Materiales", icon: FolderIcon },
      { href: "/dashboard/library", label: "Biblioteca", icon: LibraryIcon },
    ],
  },
  {
    type: "group",
    key: "attendance",
    label: "Asistencia",
    icon: AttendanceIcon,
    items: [
      { href: "/dashboard/attendance", label: "Asistencia", icon: AttendanceIcon },
      { href: "/dashboard/attendance/week", label: "Semanal", icon: AttendanceIcon },
    ],
  },
  {
    type: "group",
    key: "finance",
    label: "Finanzas",
    icon: CreditCardIcon,
    items: [
      { href: "/dashboard/payments", label: "Pagos", icon: CreditCardIcon },
      { href: "/dashboard/finance/register-payment", label: "Registrar pago", icon: CashierIcon },
      { href: "/dashboard/finance/receipts", label: "Recibos", icon: ReceiptIcon },
      { href: "/dashboard/finance/reports", label: "Reportes", icon: ChartIcon },
      { href: "/dashboard/finance/pending", label: "Pendientes", icon: AlertMoneyIcon },
    ],
  },
  {
    type: "group",
    key: "comm",
    label: "Comunicación",
    icon: MessageIcon,
    items: [
      { href: "/dashboard/communication/messages", label: "Mensajes", icon: MessageIcon },
      { href: "/dashboard/communication/announcements", label: "Anuncios", icon: MegaphoneIcon },
      { href: "/dashboard/communication/forums", label: "Foros", icon: ForumIcon },
    ],
  },
  {
    type: "group",
    key: "reports",
    label: "Reportes",
    icon: ReportsIcon,
    items: [
      { href: "/dashboard/reports", label: "Reportes", icon: ReportsIcon },
      { href: "/dashboard/analytics", label: "Analytics", icon: ChartIcon },
      { href: "/dashboard/audit", label: "Auditoría", icon: AuditIcon },
    ],
  },
  {
    type: "group",
    key: "settings",
    label: "Configuración",
    icon: SettingsIcon,
    items: [
      { href: "/dashboard/settings", label: "Configuración", icon: SettingsIcon },
      { href: "/dashboard/settings/roles", label: "Roles y permisos", icon: ShieldIcon },
    ],
  },
];

export default function Sidebar({ onNavigate, collapsed = false, onToggle }: Props) {
  const pathname = usePathname();

  // abre por defecto el grupo que contiene la ruta actual
  const activeGroupKey = useMemo(() => {
    const found = navTree.find((n) => {
      if (n.type === "group") return n.items.some((it) => isActive(pathname, it.href));
      return isActive(pathname, n.href);
    });
    return found?.key ?? "main";
  }, [pathname]);


  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenGroups((prev) => ({
      ...prev,
      [activeGroupKey]: true,
    }));
  }, [activeGroupKey]);

  // si está colapsado, cerramos todo (solo íconos)
  useEffect(() => {
    if (collapsed) setOpenGroups({});
  }, [collapsed]);

  return (
    <aside
  className={[
    "relative h-dvh overflow-visible border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300",
    collapsed ? "w-[72px] p-0" : "w-[280px] p-3 pt-0",
  ].join(" ")}
>


      <button
        onClick={() => onToggle?.()}
        aria-label="Toggle sidebar"
        className="
          absolute -right-4 top-10 z-[200]
          flex h-7 w-7 items-center justify-center
          rounded-full border border-[var(--color-border)]
          bg-[var(--color-surface)] text-xs shadow-lg
          hover:bg-[var(--color-muted)]
        "
      >
        <span className={collapsed ? "rotate-0" : "rotate-180"}>
          ⮞
        </span>
      </button>

      {/* Brand */}
      <div className="border-b border-[var(--color-border)] px-0">
        <div className={collapsed ? "flex justify-center" : "flex items-center gap-3"}>
          <Image
            src="/logo-memoryx.png"
            alt="Memoryx"
            width={collapsed ? 57 : 70}
            height={collapsed ? 40 : 60}
            className="object-contain"
            priority
          />
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-base font-semibold tracking-tight">Memoryx</div>
              <div className="text-xs opacity-70">Dashboard • 2026</div>
            </div>
          )}
        </div>
      </div>
      {/* NAV con submenús */}
      {collapsed ? (
        // ✅ COLAPSADO: sin scroll (para que el popup no se recorte)
        <nav className="mt-3 space-y-1 px-0">
          {navTree.map((node) => {
            // ✅ LINK DIRECTO: Inicio
            if (node.type === "link") {
              const active = isActive(pathname, node.href);

              return (
                <Link
                  key={node.key}
                  href={node.href}
                  onClick={onNavigate}
                  className={[
                    "group flex items-center rounded-xl px-3 py-2.5 text-sm transition",
                    "justify-center gap-0",
                    active
                      ? "bg-[var(--color-muted)] ring-1 ring-[var(--color-border)]"
                      : "hover:bg-[var(--color-muted)]",
                  ].join(" ")}
                >
                  <node.icon active={active} />
                </Link>
              );
            }

            // ✅ GRUPO CON SUBMENU (popup hover)
            const activeItem = node.items.find((it) => isActive(pathname, it.href));
            const active = !!activeItem;

            return (
              <div key={node.key} className="relative group">
                <button
                  type="button"
                  className={[
                    "group flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-[var(--color-muted)] ring-1 ring-[var(--color-border)]"
                      : "hover:bg-[var(--color-muted)]",
                  ].join(" ")}
                  aria-label={node.label}
                >
                  <node.icon active={active} />
                </button>

                <div
                  className="
              invisible opacity-0 group-hover:visible group-hover:opacity-100
              absolute left-[72px] top-0 z-50
              min-w-[220px]
              rounded-xl border border-[var(--color-border)]
              bg-[var(--color-surface)] shadow-xl
              p-2
              transition-all duration-150
            "
                >
                  <div className="px-2 pb-2 text-xs font-semibold opacity-70">
                    {node.label}
                  </div>

                  <div className="space-y-1">
                    {node.items.map((item) => {
                      const itemActive = isActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onNavigate}
                          className={[
                            "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                            itemActive
                              ? "bg-[var(--color-muted)] ring-1 ring-[var(--color-border)]"
                              : "hover:bg-[var(--color-muted)]",
                          ].join(" ")}
                        >
                          <item.icon active={itemActive} />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      ) : (
        // ✅ EXPANDIDO: con scroll interno + scrollbar oculto
        <div className="mt-3 h-[calc(100dvh-120px)] overflow-y-auto scrollbar-hide">
          <nav className="space-y-2">
            {navTree.map((node) => {
              // ✅ LINK DIRECTO: Inicio
              if (node.type === "link") {
                const active = isActive(pathname, node.href);

                return (
                  <Link
                    key={node.key}
                    href={node.href}
                    onClick={onNavigate}
                    className={[
                      "group flex items-center rounded-xl px-3 py-2.5 text-sm transition gap-3",
                      active
                        ? "bg-[var(--color-muted)] ring-1 ring-[var(--color-border)]"
                        : "hover:bg-[var(--color-muted)]",
                    ].join(" ")}
                  >
                    <node.icon active={active} />
                    <span className="font-medium">{node.label}</span>
                  </Link>
                );
              }

              // ✅ GRUPO (desplegable normal)
              const groupActive = node.items.some((it) => isActive(pathname, it.href));
              const open = !!openGroups[node.key];

              return (
                <div key={node.key} className="space-y-1">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroups((prev) => ({ ...prev, [node.key]: !prev[node.key] }))
                    }
                    className={[
                      "group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition",
                      groupActive
                        ? "bg-[var(--color-muted)] ring-1 ring-[var(--color-border)]"
                        : "hover:bg-[var(--color-muted)]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <node.icon active={groupActive} />
                      <span className="font-medium">{node.label}</span>
                    </div>

                    <span className={["text-xs opacity-70 transition", open ? "rotate-90" : ""].join(" ")}>
                      ⮞
                    </span>
                  </button>

                  {open && (
                    <div className="ml-3 space-y-1 border-l border-[var(--color-border)] pl-3">
                      {node.items.map((item) => {
                        const active = isActive(pathname, item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={[
                              "group flex items-center rounded-xl px-3 py-2 text-sm transition gap-3",
                              active
                                ? "bg-[var(--color-muted)] ring-1 ring-[var(--color-border)]"
                                : "hover:bg-[var(--color-muted)]",
                            ].join(" ")}
                          >
                            <item.icon active={active} />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}

    </aside>
  );
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
}


/* --- Icons (sin dependencias) --- */
function IconWrap({
  children,
  active,
}: {
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 transition",
        active
          ? "bg-[var(--color-surface)] ring-[var(--color-border)]"
          : "bg-[var(--color-surface)] ring-[var(--color-border)] opacity-80 group-hover:opacity-100",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </IconWrap>
  );
}

function UsersIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M22 21v-2a3.5 3.5 0 0 0-3-3.45"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M17 3.2a4 4 0 0 1 0 7.6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </IconWrap>
  );
}

function BookIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22V4.5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </IconWrap>
  );
}

function CreditCardIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H3V7Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M3 9v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9H3Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M7 15h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </IconWrap>
  );
}

function AttendanceIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 3v3M17 3v3M4 8h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6 12l2 2 4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 6h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </IconWrap>
  );
}

function TeacherIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l10 5-10 5L2 8l10-5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M6 10v6c0 1.5 2.7 3 6 3s6-1.5 6-3v-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </IconWrap>
  );
}

function ParentIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M8 11a4 4 0 1 1 8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 21v-1a7 7 0 0 1 14 0v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </IconWrap>
  );
}

function StaffIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M9 3h6v4H9V3Z" stroke="currentColor" strokeWidth="2" />
        <path d="M7 7h10v14H7V7Z" stroke="currentColor" strokeWidth="2" />
        <path d="M9 11h6M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </IconWrap>
  );
}

function CoursesIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16M4 12h10M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </IconWrap>
  );
}

function LessonsIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 20H8a3 3 0 0 0-3 3" stroke="currentColor" strokeWidth="2" />
      </svg>
    </IconWrap>
  );
}

function FolderIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 7h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </IconWrap>
  );
}

function LibraryIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 3h6v18H4V3Zm10 0h6v18h-6V3Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    </IconWrap>
  );
}

function ExamIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M8 3h8v4H8V3Z" stroke="currentColor" strokeWidth="2" />
        <path d="M7 7h10v14H7V7Z" stroke="currentColor" strokeWidth="2" />
        <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </IconWrap>
  );
}

function GradesIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 20V4h16v16H4Z" stroke="currentColor" strokeWidth="2" />
        <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </IconWrap>
  );
}

function MessageIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 5h16v11H7l-3 3V5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </IconWrap>
  );
}

function MegaphoneIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 11v2l12 4V7L3 11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M15 7l6-2v14l-6-2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M6 13l1.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </IconWrap>
  );
}

function ForumIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16v8H7l-3 3V6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 18h12v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </IconWrap>
  );
}

function AdmissionIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l7 4v8c0 5-7 8-7 8s-7-3-7-8V6l7-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </IconWrap>
  );
}

function EnrollmentIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M6 4h12v16H6V4Z" stroke="currentColor" strokeWidth="2" />
        <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </IconWrap>
  );
}

function CashierIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 7h16v4H4V7Z" stroke="currentColor" strokeWidth="2" />
        <path d="M6 11v8h12v-8" stroke="currentColor" strokeWidth="2" />
        <path d="M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </IconWrap>
  );
}

function ReceiptIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M6 2h12v20l-2-1-2 1-2-1-2 1-2-1-2 1V2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </IconWrap>
  );
}

function ChartIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 16v-5M12 16v-9M16 16v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </IconWrap>
  );
}

function AlertMoneyIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 3h4l7 7v4l-7 7h-4l-7-7v-4l7-7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </IconWrap>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M7 3v3M17 3v3M4 8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 6h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </IconWrap>
  );
}

function EventIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.5 6H21l-5 3.7L18 18l-6-4-6 4 2-6.3L3 8h6.5L12 2Z"
          stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </IconWrap>
  );
}

function ReportsIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M7 3h10v18H7V3Z" stroke="currentColor" strokeWidth="2" />
        <path d="M9 7h6M9 11h6M9 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </IconWrap>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="2" />
        <path
          d="M19.4 15a8.2 8.2 0 0 0 .1-2l2-1.2-2-3.5-2.3.7a8 8 0 0 0-1.7-1l-.3-2.4H9.8L9.5 7a8 8 0 0 0-1.7 1l-2.3-.7-2 3.5 2 1.2a8.2 8.2 0 0 0 .1 2l-2 1.2 2 3.5 2.3-.7a8 8 0 0 0 1.7 1l.3 2.4h4.4l.3-2.4a8 8 0 0 0 1.7-1l2.3.7 2-3.5-2-1.2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </IconWrap>
  );
}

function ShieldIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l7 4v8c0 5-7 8-7 8s-7-3-7-8V6l7-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </IconWrap>
  );
}

function AuditIcon({ active }: { active: boolean }) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M10 3h8v18H6V7l4-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 3v4H6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </IconWrap>
  );
}
