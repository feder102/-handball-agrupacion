import { useMemo } from "react";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";

export type ReportRow = {
  label: string;
  value: number;
};

export default function Reports() {
  const { rows } = useRealtimeTable<ReportRow>("reportes_dash", "reportes_view");

  const totals = useMemo(() => rows.reduce((sum, row) => sum + row.value, 0), [rows]);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-white">Reportes</h2>
        <p className="text-sm text-slate-400">
          Estadísticas en vivo usando canales en tiempo real de Supabase.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((row) => (
          <article key={row.label} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h3 className="text-sm uppercase tracking-widest text-slate-400">{row.label}</h3>
            <p className="mt-3 text-3xl font-semibold text-white">{row.value}</p>
          </article>
        ))}
      </div>

      <footer className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <p className="text-sm text-slate-400">Total general</p>
        <p className="text-3xl font-semibold text-white">{totals}</p>
      </footer>
    </section>
  );
}
