import { AppShell } from "@/components/AppShell";
import { PageScaffold } from "@/components/PageScaffold";

export default function Page() {
  return (
    <AppShell>
      <PageScaffold
        title="Anomalías"
        description="Voids, descuentos, drift de food cost, picos de refund."
      />
    </AppShell>
  );
}
