import { AppShell } from "@/components/AppShell";
import { PageScaffold } from "@/components/PageScaffold";

export default function Page() {
  return (
    <AppShell>
      <PageScaffold
        title="Co-piloto"
        description='Pregúntale en lenguaje natural. Ej: "¿por qué bajó mi ticket promedio?"'
      />
    </AppShell>
  );
}
