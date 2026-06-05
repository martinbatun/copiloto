// Encabezado reutilizable + card grande de contenido sobre el canvas
// off-white del DS Stitch.

export function PageScaffold({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-gutter">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display-md text-[28px] font-bold text-on-surface">
            {title}
          </h1>
          {description && (
            <p className="mt-1 font-body-md text-on-surface-variant">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-xs">{actions}</div>}
      </header>
      <div className="bg-white rounded-[20px] border border-outline-variant card-shadow p-6 md:p-8">
        {children ?? (
          <p className="text-body-sm text-on-surface-variant">
            Vista placeholder. La implementación llega en la fase correspondiente
            del roadmap.
          </p>
        )}
      </div>
    </section>
  );
}
