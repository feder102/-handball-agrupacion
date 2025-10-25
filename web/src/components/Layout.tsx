import { NavLink, Outlet, useNavigate } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const navigation = [
  { to: "/dashboard", label: "Resumen" },
  { to: "/socios", label: "Socios" },
  { to: "/cuotas", label: "Cuotas" },
  { to: "/pagos", label: "Pagos" },
  { to: "/reportes", label: "Reportes" },
];

function AdminMenuLink() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        // Prefer user_metadata.role if present
        const role = data?.user?.user_metadata?.role || null;
        if (mounted && role === 'admin') setIsAdmin(true);
      } catch (e) {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!isAdmin) return null;
  return (
    <NavLink
      to="/admin/create-user"
      className={({ isActive }) =>
        `rounded-full px-3 py-1 text-sm font-medium transition-colors ${
          isActive ? "bg-primary text-primary-foreground" : "text-slate-300 hover:text-white"
        }`
      }
    >
      Admin: Crear usuario
    </NavLink>
  );
}

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
          <nav className="hidden gap-4 md:flex items-center">
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
            <AdminMenuLink />
            {/* Logout button */}
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Redirigir al login después de cerrar sesión
      navigate("/login", { replace: true });
      window.location.reload();
      return;
    } catch (err) {
      // log and still redirect
      console.error("Logout error", err);
      navigate("/login", { replace: true });
      window.location.reload();
      return;
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="ml-4 rounded-full border border-white/10 px-3 py-1 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
      aria-label="Cerrar sesión"
    >
      Cerrar sesión
    </button>
  );
}
