import { NavLink, Outlet } from "react-router-dom";
import type { PropsWithChildren } from "react";

const navigation = [
  { to: "/", label: "Resumen" },
  { to: "/socios", label: "Socios" },
  { to: "/cuotas", label: "Cuotas" },
  { to: "/pagos", label: "Pagos" },
  { to: "/reportes", label: "Reportes" },
];

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Hamburg Club
            </p>
            <h1 className="text-lg font-semibold text-white">
              Gestión de socios
            </h1>
          </div>
          <nav className="hidden gap-4 md:flex">
            {navigation.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-slate-300 hover:text-white"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
