import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROLE_LABELS } from "@/lib/rbac";

  const roles = Object.keys(ROLE_LABELS) as Array<keyof typeof ROLE_LABELS>;

export default function AdminCreateUser() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"admin" | "contador" | "operador" | "socio">("socio");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const resp = await fetch(import.meta.env.VITE_ADMIN_CREATE_USER_URL || "http://localhost:54321/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET || "",
        },
        body: JSON.stringify({ email, password, fullName, document, phone, role }),
      });

      const json = await resp.json();
      if (!resp.ok) {
        setMessage(json?.error?.message || json?.error || JSON.stringify(json));
        setIsSubmitting(false);
        return;
      }

      setMessage("Usuario creado correctamente.");
      setIsSubmitting(false);
      // redirect back to members list
      setTimeout(() => navigate("/socios"), 1200);
    } catch (err: any) {
      setMessage(err?.message ?? String(err));
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold text-white mb-4">Crear usuario (Admin)</h2>
      {message && <div className="mb-4 rounded bg-slate-800 p-3 text-sm">{message}</div>}
      <form onSubmit={handleSubmit} className="grid gap-3 max-w-xl">
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nombre completo" className="px-3 py-2 rounded" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="px-3 py-2 rounded" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className="px-3 py-2 rounded" />
        <input value={document} onChange={(e) => setDocument(e.target.value)} placeholder="Documento" className="px-3 py-2 rounded" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" className="px-3 py-2 rounded" />
        <select value={role} onChange={(e) => setRole(e.target.value as any)} className="px-3 py-2 rounded">
          {roles.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <div>
          <button disabled={isSubmitting} className="px-4 py-2 rounded bg-emerald-500 text-white">
            {isSubmitting ? "Creando..." : "Crear usuario"}
          </button>
        </div>
      </form>
    </section>
  );
}
