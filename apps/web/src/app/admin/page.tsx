import { AppShell } from "@/components/AppShell";
import { PageScaffold } from "@/components/PageScaffold";

export default function Page() {
  return (
    <AppShell>
      <PageScaffold
        title="Admin"
        description="Usuarios, roles, integraciones y auditoría."
      />
    </AppShell>
  );
}
