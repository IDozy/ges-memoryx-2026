export default function DashboardPage() {
  const cards = [
    { title: "Estudiantes", value: "—", hint: "Registros totales" },
    { title: "Cursos", value: "—", hint: "Cursos activos" },
    { title: "Pagos", value: "—", hint: "Pagos del mes" },
    { title: "Pendientes", value: "—", hint: "Acciones por revisar" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Vista general del sistema.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm"
>
            <div className="text-sm text-zinc-300">{c.title}</div>
            <div className="mt-2 text-3xl font-semibold">{c.value}</div>
            <div className="mt-2 text-xs text-zinc-400">{c.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-medium">Actividad reciente</div>
          <div className="mt-3 space-y-2 text-sm text-zinc-300">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-3" >
    Aún no hay actividad para mostrar.
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
          <div className="text-sm font-medium">Acciones rápidas</div>
          <div className="mt-3 space-y-2">
            <a
              className="block rounded-xl border border-white/10 bg-zinc-950/40 p-3 text-sm hover:bg-zinc-950/60"
              href="/dashboard/estudiantes"
            >
              Ver estudiantes →
            </a>
            <a
              className="block rounded-xl border border-white/10 bg-zinc-950/40 p-3 text-sm hover:bg-zinc-950/60"
              href="/dashboard/pagos"
            >
              Ver pagos →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
