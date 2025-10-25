import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "@/lib/auth";
import logoLight from "@/assets/images/logo-white-3.svg";

const testimonials = [
  {
    quote:
      "“Gestionar las altas de socios ahora es cuestión de minutos. El panel es súper intuitivo y la integración con Supabase evita errores.”",
    author: "Camila Ríos",
    role: "Coordinadora, Hamburg Club",
  },
  {
    quote:
      "“La automatización de cuotas y habilitaciones nos devolvió horas cada semana. Todo queda registrado con auditoría.”",
    author: "Fernando Segura",
    role: "Tesorero, Comisión Directiva",
  },
  {
    quote:
      "“El flujo de registro guía al socio y lo deja listo para operar en segundos. Excelente experiencia de usuario.”",
    author: "Lucía Méndez",
    role: "Administración, Sede Central",
  },
];

type FormState = {
  fullName: string;
  email: string;
  document: string;
  phone: string;
  role: "admin" | "contador" | "operador" | "socio";
  password: string;
  confirmPassword: string;
};

type Feedback = { type: "success" | "error"; message: string } | null;

const initialFormState: FormState = {
  fullName: "",
  email: "",
  document: "",
  phone: "",
  role: "socio",
  password: "",
  confirmPassword: "",
};

  // role selection removed for public registration: always create 'socio'

const errorMessages = [
  {
    match: "duplicate key value violates unique constraint",
    message: "Ese correo o documento ya está registrado. Probá iniciar sesión o recuperar la contraseña.",
  },
  {
    match: "documento ya existe para otro usuario",
    message: "Ese documento ya está registrado en el sistema. Si es tuyo, probá recuperar tu contraseña.",
  },
  {
    match: "el documento es obligatorio",
    message: "Debés proporcionar un número de documento válido para registrarte.",
  },
  {
    match: "new row violates row-level security policy",
    message:
      "Error de permisos al crear tu perfil. Contactá al administrador del sistema.",
  },
  {
    match: "user already registered",
    message: "Ya existe una cuenta con ese correo electrónico. Probá iniciar sesión.",
  },
];

const getFriendlyError = (rawMessage: string) => {
  const match = errorMessages.find(({ match }) => rawMessage.toLowerCase().includes(match));
  if (match) {
    return match.message;
  }

  // Supabase may return rate-limit / resend messages like:
  // "For security purposes, you can only request this after 36 seconds."
  const rateLimitMatch = rawMessage.match(/after\s+(\d+)\s+seconds/i);
  if (rateLimitMatch) {
    const seconds = Number(rateLimitMatch[1]);
    return `Por seguridad podés intentarlo nuevamente en ${seconds} segundos.`;
  }

  return rawMessage;
};

const Register = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length);
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, []);

  const canSubmit = useMemo(() => {
    return (
      formState.fullName.trim().length > 2 &&
      formState.email.trim().length > 5 &&
      formState.document.trim().length > 6 &&
      formState.password.length >= 8 &&
      formState.password === formState.confirmPassword &&
      !isSubmitting
    );
  }, [formState, isSubmitting]);

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormState((previous) => ({ ...previous, [field]: event.target.value }));
  };

  const handleBackHome = () => {
    navigate("/login", { replace: true });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setFeedback({ type: "error", message: "Completá todos los campos obligatorios y verificá la contraseña." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const response = await registerUser({
      fullName: formState.fullName.trim(),
      email: formState.email.trim(),
      password: formState.password,
      document: formState.document.trim(),
      phone: formState.phone.trim() || undefined,
      // force public registrations to 'socio'
      role: 'socio',
    });

    if (response.status === "error") {
      setFeedback({ type: "error", message: getFriendlyError(response.message) });
      setIsSubmitting(false);
      return;
    }

    if (response.requiresEmailConfirmation) {
      setFeedback({
        type: "success",
        message:
          "¡Listo! Revisá tu correo para confirmar la cuenta. Una vez confirmada podrás iniciar sesión.",
      });
      setIsSubmitting(false);
      return;
    }

    setFeedback({
      type: "success",
      message: "Cuenta creada con éxito. Te redirigimos al login...",
    });

    window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#022c22] text-white">
      <div className="absolute top-6 left-6">
        <button
          type="button"
          onClick={handleBackHome}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-semibold text-white transition-colors hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
          tabIndex={0}
          aria-label="Volver al inicio"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleBackHome();
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4"
            aria-hidden={true}
          >
            <path
              d="M12.5 16.25 6.25 10 12.5 3.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Volver
        </button>
      </div>

      <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <section aria-label="Testimonios de clubes" className="hidden lg:block">
            <img src={logoLight} alt="Hamburg Club" className="mb-10 h-12" />
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <article key={testimonial.author} className="min-w-full pr-12">
                    <p className="mb-8 text-lg leading-relaxed text-white text-opacity-90">{testimonial.quote}</p>
                    <p className="text-lg font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-white text-opacity-60">{testimonial.role}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              {testimonials.map((_, index) => {
                const isActive = index === activeTestimonial;
                return (
                  <button
                    key={`indicator-${index}`}
                    type="button"
                    aria-label={`Mostrar testimonio ${index + 1}`}
                    tabIndex={0}
                    onClick={() => setActiveTestimonial(index)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveTestimonial(index);
                      }
                    }}
                    className={`h-1 rounded-full bg-white transition-all ${isActive ? "w-6" : "w-2 bg-opacity-40"}`}
                  />
                );
              })}
            </div>
          </section>

          <section className="w-full rounded-3xl bg-white bg-opacity-5 p-8 backdrop-blur">
            <header className="mb-8 text-center lg:text-left">
              <p className="text-sm uppercase tracking-wider text-emerald-300">Hamburg Frontend</p>
              <h1 className="mt-2 text-3xl font-bold lg:text-4xl">Crear una cuenta</h1>
              <p className="mt-3 text-sm text-white text-opacity-70">
                Registrate para gestionar socios, cuotas y pagos directamente desde Supabase.
              </p>
            </header>

            {feedback && (
              <div
                role="status"
                aria-live="assertive"
                className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
                  feedback.type === "success"
                    ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                    : "border-rose-400 bg-rose-500/10 text-rose-200"
                }`}
              >
                {feedback.message}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-white">
                  Nombre y apellido
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Ej: Ana Müller"
                  value={formState.fullName}
                  onChange={handleChange("fullName")}
                  className="mt-2 w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-white">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="tucorreo@club.com"
                    value={formState.email}
                    onChange={handleChange("email")}
                    className="mt-2 w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  />
                </div>
                <div>
                  <label htmlFor="document" className="block text-sm font-semibold text-white">
                    Documento
                  </label>
                  <input
                    id="document"
                    name="document"
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="DNI / Pasaporte"
                    value={formState.document}
                    onChange={handleChange("document")}
                    className="mt-2 w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-white">
                    Teléfono (opcional)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Ej: +54 9 11 5555 5555"
                    value={formState.phone}
                    onChange={handleChange("phone")}
                    className="mt-2 w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  />
                </div>
                {/* Public registration always creates a 'socio' (user) role. */}
                <div>
                  <p className="block text-sm font-semibold text-white">Rol en el sistema</p>
                  <p className="mt-2 text-sm text-white text-opacity-60">El registro público crea una cuenta con rol <span className="font-semibold">Socio</span>.</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-white">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    value={formState.password}
                    onChange={handleChange("password")}
                    className="mt-2 w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white">
                    Repetir contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Confirmá tu contraseña"
                    value={formState.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    className="mt-2 w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-emerald-500 hover:to-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 disabled:cursor-not-allowed disabled:from-white/20 disabled:to-white/20 disabled:text-white/50"
                >
                  {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                </button>
                <p className="mt-4 text-center text-sm text-white text-opacity-70">
                  ¿Ya tenés una cuenta?{' '}
                  <Link to="/login" className="font-semibold text-emerald-300 hover:text-emerald-200">
                    Iniciá sesión
                  </Link>
                </p>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Register;
