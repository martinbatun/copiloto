import { AppShell } from "@/components/AppShell";
import { PageScaffold } from "@/components/PageScaffold";

export default function Page() {
  return (
    <AppShell>
      <PageScaffold
        title="Inventario"
        description="Par levels sugeridos, conteos físicos y varianza vs ventas."
      />
    </AppShell>
  );
}
