// Home del admin del agente. Por basePath /agent, esta ruta vive en /agent.
export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container py-12">
        <h1 className="font-display text-3xl font-bold">Copiloto Agent · Admin</h1>
        <p className="mt-2 text-muted-foreground">
          Inbox de conversaciones de WhatsApp, gestión de templates y flujos.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Tile title="Inbox" subtitle="Conversaciones activas y handoffs a humano." />
          <Tile title="Templates" subtitle="Templates de WhatsApp aprobados por Meta." />
          <Tile title="Flujos" subtitle="State machines: reserva, recuperación de no-show, feedback." />
        </div>
      </div>
    </main>
  );
}

function Tile({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
