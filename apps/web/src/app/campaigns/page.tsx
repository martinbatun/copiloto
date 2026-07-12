"use client";

import type { CampaignDTO } from "@copiloto/shared";
import { AppShell } from "@/components/AppShell";
import { useCampaigns } from "@/lib/hooks/useOpsData";
import { formatMoney } from "@/lib/format";

const STATUS: Record<string, { label: string; cls: string; border: string }> = {
  DRAFT: { label: "Borrador", cls: "bg-surface-container-highest text-on-surface-variant", border: "border-l-outline" },
  SCHEDULED: { label: "Programada", cls: "bg-secondary-container/20 text-secondary", border: "border-l-secondary" },
  SENDING: { label: "En curso", cls: "bg-primary-container/20 text-primary", border: "border-l-primary" },
  SENT: { label: "Enviada", cls: "bg-emerald-100 text-emerald-700", border: "border-l-tertiary" },
  PAUSED: { label: "Pausada", cls: "bg-amber-100 text-amber-700", border: "border-l-secondary" },
  FAILED: { label: "Fallida", cls: "bg-error-container text-error", border: "border-l-error" },
};

export default function Page() {
  const { data, isLoading, error } = useCampaigns();

  return (
    <AppShell>
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-3">
        <div>
          <h1 className="font-display-md text-display-md text-on-surface">Campañas de WhatsApp</h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl">
            Automatiza la comunicación con tus clientes para aumentar la frecuencia de visita.
          </p>
        </div>
        <button className="bg-primary text-white px-md py-sm rounded-xl font-label-md flex items-center gap-xs shadow-md hover:bg-primary-container transition-all w-fit">
          <span className="material-symbols-outlined text-[18px]">add</span> Nueva campaña
        </button>
      </header>

      {error && (
        <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4">
          <p className="font-bold">No pudimos cargar las campañas</p>
          <p className="text-sm">{String((error as Error).message)}</p>
        </div>
      )}

      <div className="flex flex-col gap-md">
        {isLoading || !data ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 bg-surface-container-high/70 rounded-2xl animate-pulse" />)
        ) : data.campaigns.length === 0 ? (
          <div className="bg-white border border-outline-variant card-shadow rounded-2xl p-xl text-center text-on-surface-variant">
            Aún no hay campañas.
          </div>
        ) : (
          data.campaigns.map((c) => <CampaignCard key={c.id} c={c} />)
        )}
      </div>
    </AppShell>
  );
}

function CampaignCard({ c }: { c: CampaignDTO }) {
  const st = STATUS[c.status] ?? STATUS.DRAFT!;
  return (
    <div className={`bg-white rounded-2xl border-l-4 ${st.border} border border-outline-variant p-md card-shadow`}>
      <div className="flex flex-col md:flex-row justify-between gap-md">
        <div className="flex items-center gap-md">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
          </div>
          <div>
            <span className={`inline-block px-sm py-0.5 rounded-full font-label-md text-[10px] uppercase mb-1 ${st.cls}`}>{st.label}</span>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">{c.templateId}</h4>
            <p className="text-body-sm text-on-surface-variant">
              Segmento: {c.segmentName ?? "—"} · {c.channel} · {c.sends} {c.sends === 1 ? "envío" : "envíos"}
            </p>
          </div>
        </div>
        <div className="flex gap-md items-center">
          <Metric label="Apertura" value={`${c.openRatePct}%`} />
          <Metric label="Respuesta" value={`${c.responseRatePct}%`} tone="primary" />
          <Metric label="Conversión" value={formatMoney(c.conversionCents)} tone="secondary" />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "primary" | "secondary" }) {
  const color = tone === "primary" ? "text-primary" : tone === "secondary" ? "text-secondary" : "text-on-surface";
  return (
    <div className="p-sm bg-surface-container-lowest rounded-xl border border-outline-variant text-center min-w-[92px]">
      <p className="font-label-md text-on-surface-variant text-[11px]">{label}</p>
      <p className={`font-numeral-xl text-[22px] ${color}`}>{value}</p>
    </div>
  );
}
