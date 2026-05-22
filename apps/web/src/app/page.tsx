import Link from "next/link";
import { Button } from "@copiloto/ui/components/Button";

// Landing publica de Copiloto. Una sola pagina con tres ideas: que es,
// como funciona, llamado a accion (demo). Toda la UX del producto vive
// detras del login.

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold">
            copiloto
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="#producto" className="hover:underline">
              Producto
            </Link>
            <Link href="#pilares" className="hover:underline">
              Pilares
            </Link>
            <Link href="/login">
              <Button size="sm" variant="default">
                Entrar
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="container py-24 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
          Smart Ops Co-pilot
        </p>
        <h1 className="font-display text-5xl font-extrabold leading-tight md:text-6xl">
          La capa de IA <br />
          que vive sobre tu POS.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Te dice qué hacer en los próximos 30 minutos y lo ejecuta en un clic
          cuando lo apruebas. Mejor margen, menos merma, mejor servicio — sin
          cambiar el sistema que ya usas.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link href="/demo">
            <Button size="lg">Agendar demo</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Entrar al panel
            </Button>
          </Link>
        </div>
        <p className="mx-auto mt-12 max-w-md text-sm text-muted-foreground">
          5–8 puntos de margen en 90 días. Onboarding en 72 horas. POS que ya
          usas, en español, con WhatsApp como canal nativo.
        </p>
      </section>

      <section id="pilares" className="container py-16">
        <h2 className="mb-12 text-center font-display text-3xl font-bold">
          Seis pilares, un solo producto
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <PillarCard
            tag="A"
            title="Motor de demanda"
            body="Un solo forecast alimenta staffing, par levels e inventario. MAPE 7d objetivo: 10%."
          />
          <PillarCard
            tag="B"
            title="Co-piloto de turno"
            body="Asistente conversacional con acciones ejecutables y human-in-the-loop."
          />
          <PillarCard
            tag="C"
            title="CRM propio"
            body="El dato del huésped es tuyo. Segmentación automática y campañas con guardrails."
          />
          <PillarCard
            tag="D"
            title="Agente FOH (WhatsApp)"
            body="Bot que toma reservas, confirma, recupera no-shows y responde al menú."
          />
          <PillarCard
            tag="E"
            title="Costeo dinámico"
            body="Food cost en vivo con cada factura OCR'd. Alertas y propuestas de reformulación."
          />
          <PillarCard
            tag="F"
            title="Visión (fase 2)"
            body="Cámaras en estación de basura y prep para identificar desperdicio."
          />
        </div>
      </section>

      <footer className="mt-16 border-t">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          © Copiloto Ops 2026 · Privado
        </div>
      </footer>
    </main>
  );
}

function PillarCard({ tag, title, body }: { tag: string; title: string; body: string }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
        {tag}
      </div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
