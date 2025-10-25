import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      // cleanup for different runtimes
      // @ts-ignore
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Redirigir al dashboard después del login exitoso
      // Si venía de otra ruta protegida, volver ahí
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Si el usuario ya está logueado, redirigir al dashboard
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white/5 p-8 backdrop-blur">
          <h1 className="text-2xl font-bold text-white mb-4">Sesión iniciada</h1>
          <p className="text-sm text-white mb-4">Conectado como <strong>{user.email}</strong></p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded-full bg-emerald-500 text-white">Ir al dashboard</button>
            <button onClick={handleLogout} className="px-4 py-2 rounded-full bg-gray-200 text-black">Cerrar sesión</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white/5 p-8 backdrop-blur">
        <h1 className="text-2xl font-bold text-white mb-4">Iniciar sesión</h1>
        {error && <div className="mb-4 text-sm text-rose-300">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-white">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-white text-opacity-70">
          ¿No tenés una cuenta?{' '}
          <Link to="/register" className="font-semibold text-emerald-300 hover:text-emerald-200">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
