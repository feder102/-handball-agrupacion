import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";

export default function Home() {
  const { session, isLoading } = useAuthenticatedUser();
  const [stats, setStats] = useState<{ socios: number; morosos: number; pagos: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      const { data, error: statsError } = await supabase.rpc("dashboard_stats");
      if (statsError) {
        setError(statsError.message);
        return;
      }
      setStats(data as typeof stats | null);
    }

    fetchStats();
  }, []);

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-white">Panel principal</h2>
        <p className="text-sm text-slate-400">
          Gestioná socios, cuotas y pagos con Supabase y React.
        </p>
      </header>

      {isLoading && <p className="text-sm text-slate-400">Cargando sesión...</p>}
      {session && (
        <p className="text-sm text-slate-300">
          Sesión activa para <span className="font-semibold">{session.user.email}</span>
        </p>
      )}

      {error && <p className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Socios", value: stats?.socios ?? "-" },
          { label: "Morosos", value: stats?.morosos ?? "-" },
          { label: "Pagos del mes", value: stats?.pagos ?? "-" },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
