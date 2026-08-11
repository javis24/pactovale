"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  Eye,
  EyeOff,
  Home,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

const theme = {
  primary: "#ff5aa4",
  light: "#ffffff",
};

export default function PortalPage() {
  const [view, setView] = useState("welcome");

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#fff7fb] font-sans lg:flex lg:items-center lg:justify-center lg:p-6">
      <div className="pointer-events-none absolute -left-24 top-16 hidden h-72 w-72 rounded-full bg-pink-200/50 blur-3xl lg:block" />
      <div className="pointer-events-none absolute -right-20 bottom-10 hidden h-80 w-80 rounded-full bg-rose-200/50 blur-3xl lg:block" />

      <div
        className="relative h-[100dvh] w-full overflow-hidden bg-white shadow-none lg:h-[min(780px,calc(100dvh-3rem))] lg:min-h-[620px] lg:max-w-5xl lg:rounded-[36px] lg:border lg:border-white/80 lg:shadow-[0_30px_80px_rgba(157,49,104,0.18)]"
        style={{ backgroundColor: view === "welcome" ? theme.primary : theme.light }}
      >
        {view === "welcome" && <WelcomeView onNavigate={setView} />}
        {view === "login" && <LoginView onNavigate={setView} />}
        {view === "register" && <RegisterView onNavigate={setView} />}
      </div>
    </main>
  );
}

function WelcomeView({ onNavigate }) {
  return (
    <section className="portal-enter relative isolate flex h-full min-h-0 flex-col overflow-y-auto bg-[#ff5aa4] text-white [overscroll-behavior:contain]">
      <DecorativeBackground />

      <div className="relative z-10 flex min-h-full flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-10 lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-12 lg:px-16 lg:py-14">
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center lg:items-start lg:py-0 lg:text-left">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-md">
            <ShieldCheck size={17} aria-hidden="true" />
            Préstamos personales en línea
          </div>

          <BrandMark className="mb-6 h-28 w-28 sm:h-32 sm:w-32 lg:h-36 lg:w-36" />

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.38em] text-white/75">
            Bienvenido a
          </p>
          <h1 className="text-4xl font-black tracking-[0.12em] sm:text-5xl lg:text-6xl">
            PACTOVALE
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
            Tu préstamo, tu progreso. Consulta tu solicitud y administra tus pagos desde cualquier lugar.
          </p>
        </div>

        <div className="relative z-20 mx-auto w-full max-w-sm rounded-[30px] border border-white/20 bg-white/12 p-5 shadow-2xl shadow-pink-950/10 backdrop-blur-xl sm:p-6">
          <p className="mb-5 text-center text-sm font-medium text-white/80">
            ¿Qué quieres hacer hoy?
          </p>

          <div className="flex flex-col gap-3.5">
            <button
              type="button"
              onClick={() => onNavigate("login")}
              className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-base font-bold text-[#e9478d] shadow-lg shadow-pink-950/10 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              Iniciar sesión
              <ArrowRight size={19} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("register")}
              className="min-h-14 w-full rounded-2xl border-2 border-white/75 bg-transparent px-5 text-base font-bold text-white transition hover:bg-white/10 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              Crear una cuenta
            </button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-white/70">
            <ShieldCheck size={15} aria-hidden="true" />
            Tus datos se mantienen protegidos
          </div>
        </div>
      </div>
    </section>
  );
}

function LoginView({ onNavigate }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (result?.error) {
        setError("El correo o la contraseña no son correctos.");
        setLoading(false);
        return;
      }

      const session = await getSession();
      router.push(session?.user?.role === "admin" ? "/admin/dashboard" : "/perfil");
      router.refresh();
    } catch {
      setError("No pudimos iniciar sesión. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <section className="portal-enter h-full overflow-y-auto bg-white [overscroll-behavior:contain]">
      <div className="flex min-h-full flex-col lg:grid lg:grid-cols-[0.92fr_1.08fr]">
        <AuthBrandPanel
          title="Tu dinero, siempre cerca"
          description="Consulta tu préstamo y lleva el control de tus pagos desde un solo lugar."
        />

        <div className="relative flex min-h-full flex-col">
          <MobileAuthHeader
            eyebrow="Portal PactoVale"
            title="¡Hola de nuevo!"
            description="Ingresa a tu cuenta para continuar."
            onBack={() => onNavigate("welcome")}
          />

          <div className="relative z-10 -mt-7 flex flex-1 flex-col rounded-t-[32px] bg-white px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-8 sm:px-10 lg:mt-0 lg:justify-center lg:rounded-none lg:px-16 lg:py-12">
            <div className="mx-auto w-full max-w-md">
              <button
                type="button"
                onClick={() => onNavigate("welcome")}
                className="mb-8 hidden items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#e9478d] lg:flex"
              >
                <ChevronLeft size={18} aria-hidden="true" />
                Volver al inicio
              </button>

              <div className="mb-8 hidden lg:block">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e9478d]">
                  Portal PactoVale
                </p>
                <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900">
                  ¡Hola de nuevo!
                </h1>
                <p className="mt-3 text-base text-gray-500">
                  Ingresa a tu cuenta para continuar.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
                  >
                    {error}
                  </div>
                )}

                <InputGroup
                  icon={<Mail size={20} />}
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  placeholder="nombre@correo.com"
                  autoComplete="email"
                  inputMode="email"
                  required
                />
                <InputGroup
                  icon={<Lock size={20} />}
                  label="Contraseña"
                  name="password"
                  type="password"
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  isPassword
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff5aa4] to-[#ee4d92] px-5 text-base font-bold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar a mi cuenta
                      <ArrowRight size={19} aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 border-t border-gray-100 pt-6 text-center">
                <p className="text-sm text-gray-500">
                  ¿Aún no tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => onNavigate("register")}
                    className="font-bold text-[#e9478d] underline decoration-pink-200 decoration-2 underline-offset-4"
                  >
                    Regístrate
                  </button>
                </p>
              </div>

              <p className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheck size={15} aria-hidden="true" />
                Acceso seguro y protegido
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RegisterView({ onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const formData = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      address: form.get("address"),
      zipCode: form.get("zipCode"),
      whatsapp: form.get("whatsapp"),
      gender: form.get("gender"),
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        window.alert("¡Cuenta creada! Ahora puedes iniciar sesión.");
        onNavigate("login");
        return;
      }

      const data = await response.json();
      setError(data.message || "No pudimos crear tu cuenta.");
    } catch {
      setError("No pudimos crear tu cuenta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="portal-enter h-full overflow-y-auto bg-white [overscroll-behavior:contain]">
      <div className="flex min-h-full flex-col lg:grid lg:grid-cols-[0.82fr_1.18fr]">
        <AuthBrandPanel
          title="Empieza en pocos minutos"
          description="Crea tu perfil para solicitar y administrar tu préstamo de forma sencilla."
        />

        <div className="relative flex min-h-full flex-col">
          <MobileAuthHeader
            compact
            eyebrow="Nuevo perfil"
            title="Crea tu cuenta"
            description="Completa tus datos para empezar."
            onBack={() => onNavigate("welcome")}
          />

          <div className="relative z-10 -mt-6 flex-1 rounded-t-[30px] bg-white px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-7 sm:px-10 lg:mt-0 lg:rounded-none lg:px-14 lg:py-10">
            <div className="mx-auto w-full max-w-xl">
              <button
                type="button"
                onClick={() => onNavigate("welcome")}
                className="mb-6 hidden items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#e9478d] lg:flex"
              >
                <ChevronLeft size={18} aria-hidden="true" />
                Volver al inicio
              </button>

              <div className="mb-7 hidden lg:block">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e9478d]">Nuevo perfil</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900">Crea tu cuenta</h1>
                <p className="mt-2 text-sm text-gray-500">Completa tus datos para empezar.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <div role="alert" aria-live="polite" className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {error}
                  </div>
                )}

                <InputGroup icon={<User size={20} />} label="Nombre completo" name="name" type="text" placeholder="Tu nombre y apellidos" autoComplete="name" required />
                <InputGroup icon={<Mail size={20} />} label="Correo electrónico" name="email" type="email" placeholder="nombre@correo.com" autoComplete="email" inputMode="email" required />
                <InputGroup icon={<Lock size={20} />} label="Contraseña" name="password" type="password" placeholder="Crea una contraseña" autoComplete="new-password" isPassword required />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputGroup icon={<MapPin size={20} />} label="Código postal" name="zipCode" type="text" placeholder="35000" autoComplete="postal-code" inputMode="numeric" required />
                  <SelectGroup label="Género" name="gender" />
                </div>

                <InputGroup icon={<Home size={20} />} label="Domicilio" name="address" type="text" placeholder="Calle, número y colonia" autoComplete="street-address" required />
                <InputGroup icon={<Phone size={20} />} label="WhatsApp" name="whatsapp" type="tel" placeholder="+52 871 000 0000" autoComplete="tel" inputMode="tel" required />

                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff5aa4] to-[#ee4d92] px-5 text-base font-bold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      Crear mi cuenta
                      <ArrowRight size={19} aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                ¿Ya tienes cuenta?{" "}
                <button type="button" onClick={() => onNavigate("login")} className="font-bold text-[#e9478d] underline decoration-pink-200 decoration-2 underline-offset-4">
                  Inicia sesión
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileAuthHeader({ eyebrow, title, description, onBack, compact = false }) {
  return (
    <header
      className={`relative overflow-hidden bg-[#ff5aa4] px-5 pb-11 pt-[max(1.25rem,env(safe-area-inset-top))] text-white lg:hidden ${compact ? "min-h-[178px]" : "min-h-[220px]"}`}
    >
      <div className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full border-[32px] border-white/10" />
      <div className="pointer-events-none absolute -bottom-16 left-20 h-36 w-36 rounded-full bg-white/10 blur-sm" />

      <button
        type="button"
        onClick={onBack}
        aria-label="Volver al inicio"
        className="relative z-10 flex min-h-11 items-center gap-1 rounded-full bg-white/15 px-3 text-sm font-semibold backdrop-blur-sm transition active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
      >
        <ChevronLeft size={19} aria-hidden="true" />
        Volver
      </button>

      <div className={`${compact ? "mt-4" : "mt-6"} relative z-10`}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">{eyebrow}</p>
        <h1 className={`${compact ? "mt-1 text-3xl" : "mt-2 text-[2.15rem]"} font-black leading-tight tracking-tight`}>{title}</h1>
        <p className="mt-2 text-sm text-white/78">{description}</p>
      </div>
    </header>
  );
}

function AuthBrandPanel({ title, description }) {
  return (
    <aside className="relative hidden overflow-hidden bg-[#ff5aa4] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <DecorativeBackground />
      <div className="relative z-10 flex items-center gap-3">
        <BrandMark className="h-12 w-12" />
        <span className="text-xl font-black tracking-[0.12em]">PACTOVALE</span>
      </div>

      <div className="relative z-10">
        <div className="mb-7 flex h-28 w-28 items-center justify-center rounded-[32px] border border-white/20 bg-white/12 p-5 backdrop-blur-md">
          <BrandMark className="h-full w-full" />
        </div>
        <h2 className="max-w-sm text-4xl font-black leading-tight tracking-tight">{title}</h2>
        <p className="mt-5 max-w-sm text-base leading-relaxed text-white/78">{description}</p>
      </div>

      <div className="relative z-10 flex items-center gap-2 text-sm text-white/70">
        <ShieldCheck size={18} aria-hidden="true" />
        Información protegida
      </div>
    </aside>
  );
}

function InputGroup({
  icon,
  label,
  type,
  placeholder,
  name,
  required = false,
  isPassword = false,
  autoComplete,
  inputMode,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-bold text-gray-700">
        {label}
      </label>
      <div className="group relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#e9478d]" aria-hidden="true">
          {icon}
        </div>
        <input
          id={name}
          required={required}
          name={name}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={`min-h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-12 text-base text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#ff5aa4] focus:bg-white focus:ring-4 focus:ring-pink-100 ${isPassword ? "pr-12" : "pr-4"}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 transition hover:bg-pink-50 hover:text-[#e9478d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-200"
          >
            {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          </button>
        )}
      </div>
    </div>
  );
}

function SelectGroup({ label, name }) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-bold text-gray-700">{label}</label>
      <div className="relative">
        <select
          id={name}
          name={name}
          defaultValue=""
          required
          className="min-h-14 w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-4 pr-11 text-base text-gray-900 outline-none transition hover:border-gray-300 focus:border-[#ff5aa4] focus:bg-white focus:ring-4 focus:ring-pink-100"
        >
          <option value="" disabled>Selecciona</option>
          <option value="hombre">Hombre</option>
          <option value="mujer">Mujer</option>
          <option value="otro">Otro</option>
        </select>
        <ChevronDown size={19} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
      </div>
    </div>
  );
}

function BrandMark({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.92 0l2.96 2.96" />
    </svg>
  );
}

function DecorativeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full border-[46px] border-white/[0.08]" />
      <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-white/[0.08]" />
      <div className="absolute bottom-1/4 right-10 h-24 w-24 rounded-full bg-white/[0.06] blur-xl" />
    </div>
  );
}