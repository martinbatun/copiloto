import { AppShell } from "@/components/AppShell";
import { PageScaffold } from "@/components/PageScaffold";

export default function Page() {
  return (
    <AppShell>
      <PageScaffold
        title="Staffing"
        description="Schedule sugerido por daypart. Side-effect del forecast."
      />
    </AppShell>
  );
}
