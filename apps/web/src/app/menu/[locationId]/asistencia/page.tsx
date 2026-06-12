"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";
import { CustomerTopBar, CustomerBottomNav } from "@/components/menu/chrome";

// Asistencia del comensal: acciones rápidas para llamar al mesero / pedir
// cuenta. Por ahora son disparadores locales (toast); se conectan al agente
// FOH / notificaciones de piso más adelante.
const ACTIONS = [
  { icon: "room_service", label: "Llamar al mesero", desc: "Un mesero pasará a tu mesa." },
  { icon: "request_quote", label: "Pedir la cuenta", desc: "Avisamos a caja que estás listo." },
  { icon: "local_drink", label: "Pedir agua / cubiertos", desc: "Te lo llevan en un momento." },
];

export default function AsistenciaPage() {
  const { locationId } = useParams<{ locationId: string }>();
  return (
    <div className="min-h-screen bg-canvas">
      <CustomerTopBar locationId={locationId} />

      <main className="pt-20 pb-40 px-margin-mobile max-w-2xl mx-auto">
        <header className="mb-6">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-1">
            Asistencia
          </h1>
          <p className="font-body-sm text-on-surface-variant">
            ¿Necesitas algo? Avísanos sin levantarte.
          </p>
        </header>

        <div className="space-y-4">
          {ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => toast.success(a.label, { description: a.desc })}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 card-shadow rounded-xl p-4 flex items-center gap-4 text-left hover:-translate-y-0.5 transition-all active:scale-[0.99]"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">{a.icon}</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface">{a.label}</p>
                <p className="font-body-sm text-on-surface-variant">{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </main>

      <CustomerBottomNav locationId={locationId} active="asistencia" />
    </div>
  );
}
