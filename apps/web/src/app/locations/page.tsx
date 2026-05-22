import { AppShell } from "@/components/AppShell";
import { PageScaffold } from "@/components/PageScaffold";

export default function Page() {
  return (
    <AppShell>
      <PageScaffold
        title="Sucursales"
        description="Alta, credenciales del POS y permisos de usuarios por sucursal."
      />
    </AppShell>
  );
}
