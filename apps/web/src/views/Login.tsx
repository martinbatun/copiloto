"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api, saveToken } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

export default function Login() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, refreshAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si ya hay sesion valida y caes en /login, te mando al panel principal.
  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await api<{ token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveToken(token);
      // Le decimos al AuthProvider que reactive hasToken y refetchee /me con
      // el nuevo Bearer. Luego empujamos al panel sin recargar la pagina.
      refreshAuth();
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background text-on-surface font-body-md">
      {/* PANEL IZQUIERDO (58%) */}
      <section className="relative hidden lg:flex w-[58%] h-full bg-surface-container-low overflow-hidden items-center justify-center border-r border-outline-variant">
        <div className="absolute inset-0 talavera-pattern" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] terracotta-orb opacity-20" />

        {/* Branding */}
        <div className="absolute top-margin-desktop left-margin-desktop flex items-center gap-base">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              cooking
            </span>
          </div>
          <span className="font-display-md text-headline-sm text-primary tracking-tight">
            Copiloto
          </span>
        </div>

        {/* Floating glass cards */}
        <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
          {/* Card 1: Forecast */}
          <div className="absolute top-10 left-10 glass-card p-md rounded-xl w-64 animate-float border-l-4 border-secondary-container">
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-md text-on-surface-variant">Forecast hoy</span>
              <span
                className="material-symbols-outlined text-secondary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                trending_up
              </span>
            </div>
            <div className="font-numeral-xl text-numeral-xl text-on-surface">284</div>
            <div className="font-body-sm text-secondary-container font-bold flex items-center gap-xs">
              <span>+12%</span>
              <span className="text-on-surface-variant font-normal">vs ayer</span>
            </div>
          </div>

          {/* Card 2: Co-piloto recommendation */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass-card p-md rounded-xl w-80 animate-float-delayed border-l-4 border-primary">
            <div className="flex items-center gap-xs mb-sm">
              <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-white text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  smart_toy
                </span>
              </div>
              <span className="font-label-md text-primary uppercase tracking-wider">
                Insight de Co-piloto
              </span>
            </div>
            <p className="font-headline-sm text-headline-sm mb-md leading-tight text-on-surface">
              &ldquo;Sube par level aguacate a 18kg&rdquo;
            </p>
            <div className="flex gap-sm">
              <button
                type="button"
                className="flex-1 py-xs px-sm bg-primary text-white font-label-md rounded-lg hover:bg-primary-container transition-colors"
              >
                Aprobar
              </button>
              <button
                type="button"
                className="flex-1 py-xs px-sm border border-outline-variant text-on-surface-variant font-label-md rounded-lg hover:bg-white transition-colors"
              >
                Modificar
              </button>
            </div>
          </div>

          {/* Card 3: KPI Margen */}
          <div className="absolute bottom-10 right-10 glass-card p-md rounded-xl w-60 animate-float-slow border-l-4 border-tertiary">
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-md text-on-surface-variant">KPI Margen</span>
              <span
                className="material-symbols-outlined text-tertiary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                pie_chart
              </span>
            </div>
            <div className="font-numeral-xl text-numeral-xl text-on-surface">34.8%</div>
            <div className="font-body-sm text-tertiary font-bold">
              +2.3pp{" "}
              <span className="text-on-surface-variant font-normal">esta semana</span>
            </div>
          </div>
        </div>
      </section>

      {/* PANEL DERECHO (42%) */}
      <section className="w-full lg:w-[42%] h-full bg-white flex items-center justify-center p-md">
        <div className="w-full max-w-md space-y-xl">
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center gap-base mb-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                cooking
              </span>
            </div>
            <span className="font-display-md text-headline-sm text-primary tracking-tight">
              Copiloto
            </span>
          </div>

          <div className="space-y-xs">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Hola de nuevo, operador
            </h1>
            <p className="font-body-md text-on-surface-variant">
              Bienvenido al centro de control de tu restaurante.
            </p>
          </div>

          <form className="space-y-md" onSubmit={submit}>
            <div className="space-y-base">
              <label className="font-label-md text-on-surface block" htmlFor="email">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-xl pr-md py-sm rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary-container focus:border-primary transition-all bg-surface-container-lowest outline-none"
                />
              </div>
            </div>

            <div className="space-y-base">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-on-surface" htmlFor="password">
                  Contraseña
                </label>
                <a className="font-label-md text-primary hover:underline" href="#">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-xl pr-md py-sm rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary-container focus:border-primary transition-all bg-surface-container-lowest outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                  aria-label="Mostrar contraseña"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-xs">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
              />
              <label
                htmlFor="remember"
                className="font-body-sm text-on-surface-variant select-none"
              >
                Recordar sesión por 30 días
              </label>
            </div>

            {error && (
              <p className="font-body-sm text-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-md btn-terracota-gradient font-label-md rounded-xl text-lg tracking-wide uppercase disabled:opacity-60"
            >
              {loading ? "Entrando…" : "Entrar al tablero"}
            </button>
          </form>

          <div className="space-y-md">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant" />
              </div>
              <span className="relative px-sm bg-white font-body-sm text-outline">
                O continúa con
              </span>
            </div>
            <div className="grid grid-cols-2 gap-sm">
              <button
                type="button"
                className="flex items-center justify-center gap-xs py-sm border border-outline-variant rounded-xl hover:bg-surface-container-low transition-all"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface">
                  account_circle
                </span>
                <span className="font-label-md text-on-surface">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-xs py-sm border border-outline-variant rounded-xl hover:bg-surface-container-low transition-all"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface">
                  window
                </span>
                <span className="font-label-md text-on-surface">Microsoft</span>
              </button>
            </div>
          </div>

          <p className="text-center font-body-sm text-on-surface-variant">
            ¿Nuevo en Copiloto?{" "}
            <a className="text-primary font-bold hover:underline" href="#">
              Solicita un demo
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
