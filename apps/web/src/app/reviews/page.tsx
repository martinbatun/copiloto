"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { ReviewDTO } from "@copiloto/shared";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { useReviews } from "@/lib/hooks/useOpsData";

const SOURCE_LABEL: Record<string, string> = {
  google: "Google", tripadvisor: "Tripadvisor", whatsapp: "WhatsApp", direct: "Directo",
};

export default function Page() {
  const { currentLocation } = useAuth();
  const { data, isLoading, error } = useReviews(currentLocation?.id);

  return (
    <AppShell>
      <header>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Reseñas</h1>
        <p className="text-on-surface-variant font-body-md">
          Lo que dicen tus clientes en Google, Tripadvisor y WhatsApp.
        </p>
      </header>

      {error && (
        <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4">
          <p className="font-bold">No pudimos cargar las reseñas</p>
          <p className="text-sm">{String((error as Error).message)}</p>
        </div>
      )}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-surface-container-high/70 rounded-xl animate-pulse" />)
        ) : (
          <>
            <KpiCard label="Rating promedio" value={`${data.summary.avgRating} ★`} accent="border-l-primary" />
            <KpiCard label="Reseñas" value={String(data.summary.count)} accent="border-l-secondary" />
            <KpiCard label="% positivas" value={`${data.summary.positivePct}%`} accent="border-l-tertiary" />
            <KpiCard label="Sentimiento" value={data.summary.avgSentiment.toFixed(2)} accent="border-l-primary-container" tone={data.summary.avgSentiment >= 0 ? "ok" : "bad"} />
          </>
        )}
      </section>

      {data && data.topics.length > 0 && (
        <div>
          <h3 className="font-headline-sm text-headline-sm mb-sm text-on-surface">Temas más mencionados</h3>
          <div className="flex flex-wrap gap-2">
            {data.topics.map((t) => (
              <span key={t.topic} className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-sm">
                {t.topic.replace(/_/g, " ")} · {t.count}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-sm">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-surface-container-high/70 rounded-xl animate-pulse" />)
        ) : data.reviews.length === 0 ? (
          <div className="bg-white border border-outline-variant card-shadow rounded-xl p-xl text-center text-on-surface-variant">
            Aún no hay reseñas.
          </div>
        ) : (
          data.reviews.map((r) => <ReviewCard key={r.id} r={r} />)
        )}
      </div>
    </AppShell>
  );
}

function ReviewCard({ r }: { r: ReviewDTO }) {
  const sentimentTone = r.sentiment == null ? "" : r.sentiment >= 0.3 ? "text-emerald-600" : r.sentiment <= -0.3 ? "text-error" : "text-on-surface-variant";
  return (
    <div className="bg-white border border-outline-variant card-shadow rounded-xl p-md">
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold">
            {"★".repeat(r.rating)}<span className="text-outline-variant">{"★".repeat(5 - r.rating)}</span>
          </span>
          <span className="text-xs font-bold uppercase text-on-surface-variant">{SOURCE_LABEL[r.source] ?? r.source}</span>
        </div>
        <span className="text-xs text-on-surface-variant">
          {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true, locale: es })}
        </span>
      </div>
      {r.text && <p className="text-body-md text-on-surface">{r.text}</p>}
      <div className="flex gap-2 mt-2 flex-wrap items-center">
        {r.sentiment != null && (
          <span className={`text-[11px] font-bold ${sentimentTone}`}>sentimiento {r.sentiment.toFixed(2)}</span>
        )}
        {r.topics.map((t) => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">{t.replace(/_/g, " ")}</span>
        ))}
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
