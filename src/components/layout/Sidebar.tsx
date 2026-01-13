"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
};



const nav = [
  { href: "/dashboard", label: "Inicio", icon: HomeIcon },
  { href: "/dashboard/students", label: "Estudiantes", icon: UsersIcon },
  { href: "/dashboard/cursos", label: "Cursos", icon: BookIcon },
  { href: "/dashboard/payments", label: "Pagos", icon: CreditCardIcon },
];

export default function Sidebar({ onNavigate, collapsed = false, onToggle }: Props) {
  const pathname = usePathname();

  return (
    <aside
     className={[
  "relative h-dvh border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300",
  collapsed ? "w-[72px] p-0" : "w-[280px] p-4",
].join(" ")}

    >
      <button
        onClick={() => onToggle?.()}
        aria-label="Toggle sidebar"
        className="
    absolute
    -right-4
    top-10
    z-[100]
    flex
    h-7
    w-7
    items-center
    justify-center
    rounded-full
    border
    border-[var(--color-border)]
    bg-[var(--color-surface)]
    text-xs
    shadow-lg
    hover:bg-[var(--color-muted)]
  "
      >
        {collapsed ? "➤" : "🠸"}
      </button>


      {/* Brand */}
      <div
  className={[
    "mb-5 border border-[var(--color-border)] bg-[var(--color-muted)] transition-all duration-300",
    collapsed ? "rounded-none p-[16px] text-center" : "rounded-2xl p-4",
  ].join(" ")}
>
  <div className="text-base font-semibold">
    {collapsed ? "GM" : "Ges-Memoryx"}
  </div>

  {!collapsed && (
    <div className="text-xs opacity-70">Dashboard • 2026</div>
  )}
</div>



      {/* Nav */}
      <nav className="space-y-1">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={[
                "group flex items-center rounded-xl px-3 py-2.5 text-sm transition",
                collapsed ? "justify-center gap-0" : "gap-3",
                active
                  ? "bg-[var(--color-muted)] ring-1 ring-[var(--color-border)]"
                  : "hover:bg-[var(--color-muted)]",
              ].join(" ")}
            >
              <item.icon active={active} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>


    </aside>
  );
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
