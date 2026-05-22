import { AppShell } from "@/components/AppShell";
import { PageScaffold } from "@/components/PageScaffold";

export default function Page() {
  return (
    <AppShell>
      <PageScaffold
        title="Reservas"
        description="Bookings vía WhatsApp y web. Lista de espera, no-shows y recuperación."
      />
    </AppShell>
  );
}
