// Helper visual reutilizable para todas las paginas del dashboard mientras
// estan en estado scaffold. Solo encabezado y un placeholder.

export function PageScaffold({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        {description && (
          <p className="mt-2 text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="rounded-lg border bg-card p-8">
        {children ?? (
          <p className="text-sm text-muted-foreground">
            Vista placeholder. La implementación llega en la fase correspondiente
            del roadmap.
          </p>
        )}
      </div>
    </div>
  );
}
