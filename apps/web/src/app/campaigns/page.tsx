import { AppShell } from "@/components/AppShell";
import { PageScaffold } from "@/components/PageScaffold";

export default function Page() {
  return (
    <AppShell>
      <PageScaffold
        title="Campañas"
        description="WhatsApp / email / SMS con guardrails de volumen y opt-in."
      />
    </AppShell>
  );
}
