import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type DueStatus = "pendiente" | "pagado" | "vencido" | "rechazado";

type Due = {
  id: string;
  periodo: string;
  importe: number;
  estado: DueStatus;
};

export default function Dues() {
  const [dues, setDues] = useState<Due[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<DueStatus | "todas">("todas");

  useEffect(() => {
    async function loadDues() {
      const query = supabase
        .from("cuotas_socios")
        .select("id, periodo, importe, estado")
        .order("periodo", { ascending: false })
        .limit(100);

      const { data } = await query;
      setDues(data ?? []);
    }

    loadDues();
  }, []);

  const filtered = useMemo(() => {
    if (selectedStatus === "todas") {
      return dues;
    }

    return dues.filter((due) => due.estado === selectedStatus);
  }, [dues, selectedStatus]);

  const statusTone: Record<DueStatus, string> = {
    pagado: "bg-emerald-500/15 text-emerald-300",
    pendiente: "bg-amber-500/15 text-amber-300",
    vencido: "bg-rose-500/15 text-rose-300",
    rechazado: "bg-slate-500/20 text-slate-200",
  };

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-white">Cuotas</h2>
        <p className="text-sm text-slate-400">
          Visualizá el estado de las cuotas en tiempo real y filtralas por estado.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {["todas", "pendiente", "pagado", "vencido", "rechazado"].map((status) => (
          <button
            key={status}
            className={`rounded-full px-4 py-1 text-sm font-medium capitalize transition-colors ${
              selectedStatus === status
                ? "bg-primary text-primary-foreground"
                : "border border-slate-800 bg-slate-900/50 text-slate-300 hover:text-white"
            }`}
            onClick={() => setSelectedStatus(status as DueStatus | "todas")}
            type="button"
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((due) => (
          <article key={due.id} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h3 className="text-lg font-semibold text-white">{due.periodo}</h3>
            <p className="text-sm text-slate-400">${due.importe.toFixed(2)}</p>
            <span className={`mt-3 inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-widest ${statusTone[due.estado]}`}>
              {due.estado}
            </span>
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400">No hay cuotas con ese estado.</p>
        )}
      </div>
    </section>
  );
}
