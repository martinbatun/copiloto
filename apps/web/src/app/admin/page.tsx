"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { AdminTenantDTO } from "@copiloto/shared";
import { AppShell } from "@/components/AppShell";
import { useAdminTenants } from "@/lib/hooks/useOpsData";
import { ApiError } from "@/lib/api";
import { formatMoney } from "@/lib/format";

export default function Page() {
  const { data, isLoading, error } = useAdminTenants();
  const forbidden = error instanceof ApiError && error.status === 403;

  return (
    <AppShell>
      <header>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Panel de plataforma</h1>
        <p className="text-on-surface-variant font-body-md">
          Cuentas (tenants) de Copiloto y su actividad. Solo staff de Copiloto (rol ADMIN).
        </p>
      </header>

      {forbidden ? (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl p-6">
          <p className="font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">lock</span>
            Acceso restringido
          </p>
          <p className="text-sm mt-1">
            Este panel es solo para staff de Copiloto (rol <code className="font-mono">ADMIN</code>). Tu
            usuario no tiene ese rol. Para verlo en el demo, inicia sesión como{" "}
            <code className="font-mono">soporte@copiloto.mx</code>.
          </p>
        </div>
      ) : error ? (
        <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4">
          <p className="font-bold">No pudimos cargar el panel</p>
          <p className="text-sm">{String((error as Error).message)}</p>
        </div>
      ) : (
        <>
          {/* Resumen */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-gutter">
            {isLoading || !data ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 bg-surface-container-high/70 rounded-xl animate-pulse" />
              ))
            ) : (
              <>
                <Kpi label="Cuentas" value={String(data.summary.tenants)} accent="border-l-primary" />
                <Kpi label="Sucursales" value={String(data.summary.locations)} accent="border-l-secondary" />
                <Kpi label="Usuarios" value={String(data.summary.users)} accent="border-l-tertiary" />
                <Kpi label="Pedidos" value={String(data.summary.orders)} accent="border-l-primary-container" />
                <Kpi label="Ventas del mes" value={formatMoney(data.summary.monthRevenueCents)} accent="border-l-primary" />
              </>
            )}
          </section>

          {/* Tabla de tenants */}
          <div className="bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden">
            <div className="p-md border-b border-outline-variant bg-surface-container-lowest">
              <h2 className="font-headline-sm text-headline-sm flex items-center gap-xs text-on-surface">
                <span className="material-symbols-outlined text-primary">apartment</span>
                Cuentas
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-on-surface-variant border-b border-outline-variant">
                    <th className="p-md font-label-md">Cuenta</th>
                    <th className="p-md font-label-md text-center">Sucursales</th>
                    <th className="p-md font-label-md text-center">Usuarios</th>
                    <th className="p-md font-label-md text-center">Pedidos</th>
                    <th className="p-md font-label-md text-right">Ventas del mes</th>
                    <th className="p-md font-label-md text-right">Última actividad</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading || !data ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-outline-variant/50">
                        <td colSpan={6} className="p-md">
                          <div className="h-6 bg-surface-container-high/50 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : data.tenants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-xl text-center text-on-surface-variant">
                        Sin cuentas registradas.
                      </td>
                    </tr>
                  ) : (
                    data.tenants.map((t) => <TenantRow key={t.id} t={t} />)
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

function TenantRow({ t }: { t: AdminTenantDTO }) {
  return (
    <tr className="border-b border-outline-variant/50 hover:bg-surface-container-lowest">
      <td className="p-md">
        <div className="font-bold text-on-surface">{t.name}</div>
        <div className="text-xs text-on-surface-variant">
          {t.slug} · {t.country} · {t.currency}
        </div>
      </td>
      <td className="p-md text-center text-on-surface">{t.locations}</td>
      <td className="p-md text-center text-on-surface">{t.users}</td>
      <td className="p-md text-center text-on-surface">{t.orders}</td>
      <td className="p-md text-right font-numeral-xl text-on-surface">{formatMoney(t.monthRevenueCents)}</td>
      <td className="p-md text-right text-on-surface-variant">
        {t.lastActivityAt
          ? formatDistanceToNow(new Date(t.lastActivityAt), { addSuffix: true, locale: es })
          : "—"}
      </td>
    </tr>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className={`bg-white p-md rounded-xl border border-outline-variant card-shadow border-l-4 ${accent}`}>
      <p className="font-label-md text-on-surface-variant">{label}</p>
      <p className="font-numeral-xl text-numeral-xl mt-xs text-on-surface">{value}</p>
    </div>
  );
}
