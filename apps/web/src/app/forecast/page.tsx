import { AppShell } from "@/components/AppShell";
import { PageScaffold } from "@/components/PageScaffold";

export default function Page() {
  return (
    <AppShell>
      <PageScaffold
        title="Forecast"
        description="Demanda esperada por daypart y canal. Output del motor LightGBM."
      />
    </AppShell>
  );
}
