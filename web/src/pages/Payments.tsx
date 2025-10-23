import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Payment = {
  id: string;
  socio: string;
  periodo: string;
  monto: number;
  metodo: string;
  creado_en: string;
};

type PaymentRow = {
  id: string;
  periodo: string | null;
  monto: number;
  metodo: string;
  creado_en: string;
  socio: { nombre: string | null } | { nombre: string | null }[] | null;
};

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    async function loadPayments() {
      const { data } = await supabase
        .from("pagos")
        .select("id, periodo, monto, metodo, creado_en, socio:socios(nombre)")
        .order("creado_en", { ascending: false })
        .limit(50);

      const parsedPayments: Payment[] = ((data ?? []) as PaymentRow[]).map((pay) => {
        const socioNombre = Array.isArray(pay.socio)
          ? pay.socio[0]?.nombre
          : pay.socio?.nombre;

        return {
          id: pay.id,
          periodo: pay.periodo ?? "",
          monto: pay.monto,
          metodo: pay.metodo,
          creado_en: pay.creado_en,
          socio: socioNombre ?? "Socio",
        };
      });

      setPayments(parsedPayments);
    }

    loadPayments();
  }, []);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-white">Pagos</h2>
        <p className="text-sm text-slate-400">
          Registro consolidado de pagos manuales o automáticos.
        </p>
      </header>

      <div className="space-y-3">
        {payments.map((payment) => (
          <article key={payment.id} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">{payment.periodo}</p>
                <p className="text-lg font-semibold text-white">{payment.socio}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-emerald-300">
                  ${payment.monto.toFixed(2)}
                </p>
                <p className="text-xs uppercase tracking-widest text-slate-500">{payment.metodo}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Registrado el {new Date(payment.creado_en).toLocaleString("es-AR")}
            </p>
          </article>
        ))}
        {payments.length === 0 && <p className="text-sm text-slate-400">Aún no hay pagos registrados.</p>}
      </div>
    </section>
  );
}
