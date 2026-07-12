import Link from "next/link";

// Landing publica de Copiloto. Una sola pagina con tres ideas: que es,
// como funciona, llamado a accion (demo). Toda la UX del producto vive
// detras del login.

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-on-surface">
      <header className="glass-nav sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-xs">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[14px] text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                cooking
              </span>
            </div>
            <span className="font-display-md text-[15px] font-extrabold tracking-tight text-primary">
              Copiloto
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="#pilares" className="text-on-surface-variant hover:text-on-surface">
              Pilares
            </Link>
            <Link href="#producto" className="text-on-surface-variant hover:text-on-surface">
              Producto
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 btn-terracota-gradient rounded-full text-sm font-bold"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 talavera-pattern" />
        <div className="container relative py-24 text-center">
          <p className="mb-3 font-label-md text-primary uppercase tracking-widest">
            Smart Ops Co-pilot
          </p>
          <h1 className="font-display-lg text-display-lg text-on-surface leading-tight">
            La capa de IA <br />
            que vive sobre tu POS.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-body-lg text-on-surface-variant">
            Te dice qué hacer en los próximos 30 minutos y lo ejecuta en un clic
            cuando lo apruebas. Mejor margen, menos merma, mejor servicio — sin
            cambiar el sistema que ya usas.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="px-6 py-3 btn-terracota-gradient rounded-full font-bold tracking-wide uppercase"
            >
              Agendar demo
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-full border border-outline-variant bg-white text-on-surface font-bold hover:bg-surface-container-low transition-colors"
            >
              Entrar al panel
            </Link>
          </div>
          <p className="mx-auto mt-12 max-w-md font-body-sm text-on-surface-variant">
            5–8 puntos de margen en 90 días. Onboarding en 72 horas. POS que ya
            usas, en español, con WhatsApp como canal nativo.
          </p>
        </div>
      </section>

      <section id="pilares" className="container py-16">
        <h2 className="mb-12 text-center font-display-md text-display-md text-on-surface">
          Seis pilares, un solo producto
        </h2>
        <div className="grid gap-gutter md:grid-cols-3">
          <PillarCard
            tag="A"
            icon="trending_up"
            title="Motor de demanda"
            body="Un solo forecast alimenta staffing, par levels e inventario. MAPE 7d objetivo: 10%."
          />
          <PillarCard
            tag="B"
            icon="auto_awesome"
            title="Co-piloto de turno"
            body="Asistente conversacional con acciones ejecutables y human-in-the-loop."
          />
          <PillarCard
            tag="C"
            icon="groups"
            title="CRM propio"
            body="El dato del huésped es tuyo. Segmentación automática y campañas con guardrails."
          />
          <PillarCard
            tag="D"
            icon="chat"
            title="Agente FOH (WhatsApp)"
            body="Bot que toma reservas, confirma, recupera no-shows y responde al menú."
          />
          <PillarCard
            tag="E"
            icon="restaurant"
            title="Costeo dinámico"
            body="Food cost en vivo con cada factura OCR'd. Alertas y propuestas de reformulación."
          />
          <PillarCard
            tag="F"
            icon="visibility"
            title="Visión (fase 2)"
            body="Cámaras en estación de basura y prep para identificar desperdicio."
          />
        </div>
      </section>

      <footer className="mt-16 border-t border-outline-variant">
        <div className="container py-8 text-center font-body-sm text-on-surface-variant">
          © Copiloto Ops 2026 · Privado
        </div>
      </footer>
    </main>
  );
}

function PillarCard({
  tag,
  icon,
  title,
  body,
}: {
  tag: string;
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-outline-variant card-shadow p-6 transition-transform hover:-translate-y-0.5">
      <div className="flex items-center gap-3 mb-3">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-container text-white">
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
        <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
          Pilar {tag}
        </span>
      </div>
      <h3 className="font-headline-sm text-headline-sm text-on-surface">{title}</h3>
      <p className="mt-2 font-body-sm text-on-surface-variant">{body}</p>
    </div>
  );
}
