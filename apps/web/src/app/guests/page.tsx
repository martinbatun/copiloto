import { AppShell } from "@/components/AppShell";
import { PageScaffold } from "@/components/PageScaffold";

export default function Page() {
  return (
    <AppShell>
      <PageScaffold
        title="Huéspedes"
        description="CRM propio. Perfil unificado a partir de ventas, reservas y WhatsApp."
      />
    </AppShell>
  );
}
