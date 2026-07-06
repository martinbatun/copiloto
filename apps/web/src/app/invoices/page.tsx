"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { InvoiceDTO } from "@copiloto/shared";
import { AppShell } from "@/components/AppShell";
import { useInvoices } from "@/lib/hooks/useOpsData";
import { formatMoney } from "@/lib/format";

export default function Page() {
  const { data, isLoading, error } = useInvoices();
  const invoices = useMemo(() => data?.invoices ?? [], [data]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && invoices.length > 0) setSelectedId(invoices[0]!.id);
  }, [invoices, selectedId]);

  const selected = invoices.find((i) => i.id === selectedId) ?? null;

  return (
    <AppShell>
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Facturas y proveedores</h1>
          <p className="text-on-surface-variant font-body-md">
            Costos de compra por proveedor que alimentan el costeo de recetas.
          </p>
        </div>
        <button className="bg-primary text-white px-md py-sm rounded-xl font-label-md flex items-center gap-xs shadow-md hover:bg-primary-container transition-all w-fit">
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          Subir factura
        </button>
      </header>

      {error && (
        <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4">
          <p className="font-bold">No pudimos cargar las facturas</p>
          <p className="text-sm">{String((error as Error).message)}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Lista */}
        <aside className="lg:col-span-4 bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden flex flex-col">
          <div className="p-md border-b border-outline-variant">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Facturas</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-sm space-y-sm">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-surface-container-high/70 rounded-xl animate-pulse" />
              ))
            ) : invoices.length === 0 ? (
              <p className="text-on-surface-variant text-center py-8">Sin facturas registradas.</p>
            ) : (
              invoices.map((inv) => {
                const active = inv.id === selectedId;
                return (
                  <button
                    key={inv.id}
                    onClick={() => setSelectedId(inv.id)}
                    className={`w-full text-left p-md rounded-xl bg-white card-shadow transition-all ring-1 border-l-4 ${
                      active ? "border-primary ring-primary/40" : "border-outline-variant ring-outline-variant hover:border-primary/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-base">
                      <span className="font-label-md text-on-surface">{inv.supplierName ?? "Proveedor"}</span>
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                        inv.statusLabel === "Pendiente" ? "bg-surface-container-highest text-on-surface-variant" : "bg-primary-fixed text-on-primary-fixed"
                      }`}>
                        {inv.statusLabel}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-on-surface-variant text-[12px]">
                        <p>Folio: {inv.id.slice(-10)}</p>
                        <p>{inv.invoicedAt ? format(new Date(inv.invoicedAt), "d MMM yyyy", { locale: es }) : "—"}</p>
                      </div>
                      <p className={`font-bold font-body-lg ${active ? "text-primary" : "text-on-surface"}`}>
                        {formatMoney(inv.totalCents)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Detalle */}
        <section className="lg:col-span-8 bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden flex flex-col">
          {selected ? (
            <InvoiceDetail invoice={selected} />
          ) : (
            <div className="p-xl text-center text-on-surface-variant">
              {isLoading ? "Cargando…" : "Selecciona una factura."}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function InvoiceDetail({ invoice }: { invoice: InvoiceDTO }) {
  return (
    <>
      <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">{invoice.supplierName ?? "Proveedor"}</h3>
          <p className="text-body-sm text-on-surface-variant">Folio: {invoice.id.slice(-10)}</p>
        </div>
        <span className="px-3 py-1 text-[11px] font-bold rounded-full uppercase bg-surface-container-high text-on-surface-variant">
          {invoice.statusLabel}
        </span>
      </div>

      <div className="p-md flex-1 overflow-y-auto">
        <div className="border border-outline-variant rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-[11px] uppercase tracking-wider font-bold text-outline">
              <tr>
                <th className="px-md py-sm">Producto</th>
                <th className="px-md py-sm text-right">Cantidad</th>
                <th className="px-md py-sm text-right">P. unit.</th>
                <th className="px-md py-sm text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-body-sm divide-y divide-outline-variant/60">
              {invoice.lines.map((l) => (
                <tr key={l.id}>
                  <td className="px-md py-sm">{l.description}</td>
                  <td className="px-md py-sm text-right">
                    {l.qty} {l.unit}
                  </td>
                  <td className="px-md py-sm text-right">
                    {formatMoney(l.unitCostCents)}/{l.unit}
                  </td>
                  <td className="px-md py-sm text-right font-bold">{formatMoney(l.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="bg-white border-t border-outline-variant px-lg py-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-xl flex-wrap">
          <TotalCol label="Subtotal" value={formatMoney(invoice.subtotalCents)} />
          <TotalCol label="IVA (16%)" value={formatMoney(invoice.taxCents)} />
          <div className="flex flex-col px-md border-l border-outline-variant">
            <span className="text-[10px] font-bold text-primary uppercase">Total factura</span>
            <span className="font-numeral-xl text-primary">{formatMoney(invoice.totalCents)}</span>
          </div>
        </div>
        <button className="px-xl py-sm bg-primary text-white rounded-xl font-label-md shadow-lg shadow-primary/20 hover:bg-primary-container transition-all">
          Aprobar y registrar
        </button>
      </footer>
    </>
  );
}

function TotalCol({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-on-surface-variant uppercase">{label}</span>
      <span className="font-label-md text-on-surface">{value}</span>
    </div>
  );
}
