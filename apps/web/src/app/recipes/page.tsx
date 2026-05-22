import { AppShell } from "@/components/AppShell";
import { PageScaffold } from "@/components/PageScaffold";

export default function Page() {
  return (
    <AppShell>
      <PageScaffold
        title="Recetas y costeo"
        description="Food cost actualizado con cada factura OCR'd. Alertas cuando un plato cruza el umbral."
      />
    </AppShell>
  );
}
