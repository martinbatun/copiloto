"use client";

import type { ReservationDTO, ReservationStatus } from "@copiloto/shared";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { useReservations } from "@/lib/hooks/useOpsData";

const STATUS_META: Record<
  ReservationStatus,
  { label: string; badge: string; dot: string }
> = {
  CONFIRMED: { label: "Confirmada", badge: "bg-primary-container text-on-primary-container", dot: "bg-primary" },
  SEATED: { label: "En mesa", badge: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  COMPLETED: { label: "Completada", badge: "bg-surface-container-high text-on-surface-variant", dot: "bg-outline" },
  PENDING: { label: "Pendiente", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  NO_SHOW: { label: "No llegó", badge: "bg-error-container text-on-error-container", dot: "bg-error" },
  CANCELLED: { label: "Cancelada", badge: "bg-surface-container-high text-on-surface-variant line-through", dot: "bg-outline" },
  WAITLIST: { label: "En espera", badge: "bg-secondary-container text-on-secondary-container", dot: "bg-secondary" },
};

const DATE_FMT = new Intl.DateTimeFormat("es-MX", {
  weekday: "long", day: "numeric", month: "long", timeZone: "UTC",
});

export default function Page() {
  const { currentLocation } = useAuth();
  const { data, isLoading, error } = useReservations(currentLocation?.id);

  const prettyDate = data
    ? DATE_FMT.format(new Date(`${data.date}T12:00:00Z`))
    : "";

  return (
    <AppShell>
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Reservas{data ? ` — ${data.locationName}` : ""}
          </h1>
          <p className="font-body-md text-on-surface-variant capitalize">
            {prettyDate || "Agenda del día"}
          </p>
        </div>
      </header>

      {error && (
        <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4">
          <p className="font-bold">No pudimos cargar las reservas</p>
          <p className="text-sm">{String((error as Error).message)}</p>
        </div>
      )}

      {/* Resumen */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-gutter">
        {isLoading || !data ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface-container-high/70 rounded-xl animate-pulse" />
          ))
        ) : (
          <>
            <KpiCard label="Reservas" value={String(data.summary.total)} accent="border-l-primary" />
            <KpiCard label="Comensales" value={String(data.summary.covers)} accent="border-l-secondary" />
            <KpiCard label="Confirmadas" value={String(data.summary.confirmed)} accent="border-l-primary-container" />
            <KpiCard label="En mesa" value={String(data.summary.seated)} accent="border-l-tertiary" tone="ok" />
            <KpiCard label="No llegaron" value={String(data.summary.noShow)} accent="border-l-error" tone={data.summary.noShow > 0 ? "bad" : undefined} />
            <KpiCard label="En espera" value={String(data.summary.waitlist)} accent="border-l-secondary-container" />
          </>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Agenda */}
        <div className="lg:col-span-8 bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden flex flex-col">
          <div className="p-md border-b border-outline-variant bg-surface-container-lowest">
            <h2 className="font-headline-sm text-headline-sm flex items-center gap-xs text-on-surface">
              <span className="material-symbols-outlined text-primary">schedule</span>
              Agenda del día
            </h2>
          </div>
          <div className="divide-y divide-outline-variant/60">
            {isLoading || !data ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 bg-surface-container-high/50 animate-pulse" />
              ))
            ) : data.reservations.length === 0 ? (
              <div className="p-xl text-center text-on-surface-variant">
                No hay reservas agendadas para hoy.
              </div>
            ) : (
              data.reservations.map((r) => <AgendaRow key={r.id} r={r} />)
            )}
          </div>
        </div>

        {/* Lista de espera */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <div className="bg-white border border-outline-variant rounded-xl card-shadow p-md border-l-4 border-secondary">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-headline-sm text-headline-sm flex items-center gap-xs text-on-surface">
                <span className="material-symbols-outlined text-secondary">hourglass_top</span>
                Lista de espera
              </h3>
              {data && (
                <span className="bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full font-label-md text-sm">
                  {data.summary.waitlist} esperando
                </span>
              )}
            </div>
            <div className="flex flex-col gap-sm">
              {isLoading || !data ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-14 bg-surface-container-high/50 rounded-lg animate-pulse" />
                ))
              ) : data.waitlist.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant py-sm">Sin lista de espera.</p>
              ) : (
                data.waitlist.map((r) => (
                  <div key={r.id} className="flex justify-between items-center p-sm bg-surface-container-low rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-label-md text-on-surface">{r.guestName} · {r.partySize}p</span>
                      {r.notes && <span className="text-body-sm text-on-surface-variant">{r.notes}</span>}
                    </div>
                    <a href={`tel:${r.guestPhone}`} className="material-symbols-outlined text-secondary" aria-label="Llamar">
                      call
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md text-body-sm text-on-surface-variant flex gap-sm items-start">
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
            <p>
              Las reservas llegan por WhatsApp, web o walk-in. Los estados
              (confirmada, en mesa, no llegó) se actualizan desde el flujo del anfitrión.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function AgendaRow({ r }: { r: ReservationDTO }) {
  const meta = STATUS_META[r.status];
  return (
    <div className="flex items-center gap-md p-md hover:bg-surface-container-lowest">
      <div className="w-14 shrink-0 text-center">
        <div className="font-numeral-xl text-headline-sm text-on-surface">{r.time}</div>
      </div>
      <div className="w-px self-stretch bg-outline-variant/60" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-label-md text-on-surface font-bold">{r.guestName}</span>
          <span className="text-body-sm text-on-surface-variant">· {r.partySize} personas</span>
        </div>
        {r.notes && <p className="text-body-sm text-on-surface-variant truncate">{r.notes}</p>}
      </div>
      <div className="flex items-center gap-sm shrink-0">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-md text-xs ${meta.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
        <a href={`tel:${r.guestPhone}`} className="material-symbols-outlined text-outline hover:text-primary text-[20px]" aria-label="Llamar">
          call
        </a>
      </div>
    </div>
  );
}

function KpiCard({ label, value, accent, tone }: { label: string; value: string; accent: string; tone?: "ok" | "bad" }) {
  const color = tone === "ok" ? "text-emerald-600" : tone === "bad" ? "text-error" : "text-on-surface";
  return (
    <div className={`bg-white p-md rounded-xl border border-outline-variant card-shadow border-l-4 ${accent}`}>
      <p className="font-label-md text-on-surface-variant">{label}</p>
      <p className={`font-numeral-xl text-numeral-xl mt-xs ${color}`}>{value}</p>
    </div>
  );
}
