import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Member = {
  id: string;
  nombre: string;
  documento: string;
  activo: boolean;
};

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMembers() {
      const { data } = await supabase.from("socios").select("id, nombre, documento, activo").order("nombre");
      setMembers(data ?? []);
      setIsLoading(false);
    }

    loadMembers();
  }, []);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-white">Socios</h2>
        <p className="text-sm text-slate-400">Listado en tiempo real desde Supabase.</p>
      </header>

      {isLoading ? (
        <p className="text-sm text-slate-400">Cargando socios...</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-left">
            <thead className="bg-slate-900/60 text-xs uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-medium text-white">{member.nombre}</td>
                  <td className="px-4 py-3">{member.documento}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                        member.activo ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                      }`}
                    >
                      {member.activo ? "Habilitado" : "Inhabilitado"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
