import { AppShell } from "@/components/AppShell";
import { PageScaffold } from "@/components/PageScaffold";

export default function Page() {
  return (
    <AppShell>
      <PageScaffold
        title="Resumen del día"
        description="Margen estimado, anomalías activas, recomendaciones pendientes."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Kpi label="Margen del día" value="—" hint="vs baseline 30d" />
          <Kpi label="Recomendaciones pendientes" value="—" hint="aprueba o rechaza" />
          <Kpi label="Anomalías activas" value="—" hint="últimas 24h" />
        </div>
      </PageScaffold>
    </AppShell>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md border bg-background p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
