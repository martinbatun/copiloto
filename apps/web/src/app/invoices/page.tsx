import { AppShell } from "@/components/AppShell";

const INVOICES = [
  { name: "Sigma Alimentos", ref: "INV-2023-098", date: "24 May 2024", total: "$12,450.00", status: "DETECTADO", active: true },
  { name: "Lacteos Polanco", ref: "LP-8821", date: "23 May 2024", total: "$5,890.50", status: "PENDIENTE" },
  { name: "Pan Artesanal MX", ref: "FAC-0021", date: "22 May 2024", total: "$2,100.00", status: "PENDIENTE" },
  { name: "Verduras MX", ref: "VMX-2299", date: "21 May 2024", total: "$3,640.00", status: "PENDIENTE" },
  { name: "Frutas Selectas", ref: "FS-0078", date: "20 May 2024", total: "$1,210.40", status: "PENDIENTE" },
];

export default function Page() {
  return (
    <AppShell>
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Facturas y proveedores
          </h1>
          <p className="text-on-surface-variant font-body-md">
            OCR + extracción IA · alimenta automáticamente costos por receta y par levels.
          </p>
        </div>
        <button className="bg-primary text-white px-md py-sm rounded-xl font-label-md flex items-center gap-xs shadow-md hover:bg-primary-container transition-all w-fit">
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          Subir factura
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Lista */}
        <aside className="lg:col-span-4 bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden flex flex-col min-h-[640px]">
          <div className="p-md border-b border-outline-variant">
            <h2 className="font-headline-sm text-headline-sm mb-base text-on-surface">
              Facturas pendientes
            </h2>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar proveedor…"
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-sm transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-sm space-y-sm">
            {INVOICES.map((i) => (
              <button
                key={i.ref}
                className={`w-full text-left p-md rounded-xl bg-white card-shadow transition-all ring-1 ring-outline-variant border-l-4 ${
                  i.active ? "border-primary ring-primary/40" : "border-outline-variant hover:border-primary/50"
                }`}
              >
                <div className="flex justify-between items-start mb-base">
                  <span className="font-label-md text-on-surface">{i.name}</span>
                  <span
                    className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                      i.active
                        ? "bg-primary-fixed text-on-primary-fixed"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}
                  >
                    {i.status}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-on-surface-variant text-[12px]">
                    <p>Ref: {i.ref}</p>
                    <p>Fecha: {i.date}</p>
                  </div>
                  <p className={`font-bold font-body-lg ${i.active ? "text-primary" : "text-on-surface"}`}>
                    {i.total}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Detail */}
        <section className="lg:col-span-8 bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 flex-1">
            <div className="p-md bg-surface-container flex flex-col">
              <div className="flex items-center justify-between mb-sm">
                <h3 className="font-label-md uppercase tracking-wider text-on-surface-variant">
                  Preview del documento
                </h3>
                <div className="flex gap-xs">
                  <button className="p-1 hover:bg-white rounded transition-colors">
                    <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                  </button>
                  <button className="p-1 hover:bg-white rounded transition-colors">
                    <span className="material-symbols-outlined text-[18px]">zoom_out</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-white rounded-lg overflow-hidden relative border border-outline-variant">
                <div className="absolute inset-0 bg-white p-md font-mono text-[11px] text-gray-500 select-none">
                  <div className="border-b-2 border-gray-100 pb-md mb-md flex justify-between">
                    <div>
                      <h4 className="text-[13px] font-bold text-gray-800">
                        SIGMA ALIMENTOS S.A. DE C.V.
                      </h4>
                      <p>AV. CONSTITUYENTES 100, CDMX</p>
                    </div>
                    <div className="text-right">
                      <p>FACTURA: INV-2023-098</p>
                      <p>FECHA: 24/05/2024</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-sm border-b border-gray-100 mb-base pb-base font-bold text-gray-600 text-[10px]">
                    <span>PRODUCTO</span>
                    <span>CANT</span>
                    <span>P.U.</span>
                    <span>TOTAL</span>
                  </div>
                  <div className="space-y-md">
                    <PdfRow product="JAMON PECHUGA PAVO" qty="20 KG" unit="$180.00" total="$3,600.00" />
                    <PdfRow product="AGUACATE HASS 1RA" qty="30 KG" unit="$65.00" total="$1,950.00" />
                    <PdfRow product="CEBOLLA BLANCA" qty="15 KG" unit="$32.00" total="$480.00" highlight />
                  </div>
                  <div className="mt-lg pt-lg border-t-2 border-gray-100">
                    <p className="text-right font-bold text-gray-800 text-[12px]">
                      TOTAL: $12,450.00
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
              </div>
            </div>

            <div className="p-md flex flex-col bg-white overflow-hidden border-l border-outline-variant">
              <div className="flex items-center gap-base mb-md">
                <span
                  className="material-symbols-outlined text-secondary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Extracción IA</h3>
              </div>
              <div className="flex-1 overflow-y-auto space-y-md pr-1">
                <ExtractRow name="Aguacate Hass 1ra" qty="30" unit="$65.00" />
                <ExtractRow
                  name="Cebolla Blanca"
                  qty="15"
                  unit="$32.00"
                  alert="El precio subió un 11% respecto a la semana pasada."
                />
                <ExtractRow name="Jamón Pechuga de Pavo" qty="20" unit="$180.00" />
              </div>
            </div>
          </div>

          <footer className="bg-white border-t border-outline-variant px-lg py-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-xl flex-wrap">
              <TotalCol label="Subtotal" value="$10,732.76" />
              <TotalCol label="IVA (16%)" value="$1,717.24" />
              <div className="flex flex-col px-md border-l border-outline-variant">
                <span className="text-[10px] font-bold text-primary uppercase">Total Factura</span>
                <span className="font-numeral-xl text-primary">$12,450.00</span>
              </div>
            </div>
            <div className="flex items-center gap-md">
              <button className="flex items-center gap-sm px-md py-sm rounded-xl border-2 border-emerald-500 text-emerald-600 font-label-md hover:bg-emerald-50 transition-all">
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Pedir aclaración
              </button>
              <button className="px-xl py-sm bg-primary text-white rounded-xl font-label-md shadow-lg shadow-primary/20 hover:bg-primary-container transition-all">
                Aprobar y registrar
              </button>
            </div>
          </footer>
        </section>
      </div>
    </AppShell>
  );
}

function PdfRow({
  product,
  qty,
  unit,
  total,
  highlight,
}: {
  product: string;
  qty: string;
  unit: string;
  total: string;
  highlight?: boolean;
}) {
  return (
    <div className={`grid grid-cols-4 gap-sm py-1 ${highlight ? "bg-secondary-container/30 rounded -mx-1 px-1" : ""}`}>
      <span>{product}</span>
      <span>{qty}</span>
      <span>{unit}</span>
      <span>{total}</span>
    </div>
  );
}

function ExtractRow({
  name,
  qty,
  unit,
  alert,
}: {
  name: string;
  qty: string;
  unit: string;
  alert?: string;
}) {
  return (
    <div
      className={`p-sm rounded-xl border bg-surface-container-lowest relative overflow-hidden ${
        alert ? "border-secondary bg-secondary-container/5" : "border-outline-variant"
      }`}
    >
      {alert && (
        <div className="absolute top-0 right-0 px-2 py-1 bg-secondary text-white text-[10px] font-bold rounded-bl-lg">
          ALERTA PRECIO
        </div>
      )}
      <label className="text-[10px] font-bold text-on-surface-variant uppercase">
        Nombre del producto
      </label>
      <input
        type="text"
        defaultValue={name}
        className="w-full bg-transparent border-none font-label-md p-0 focus:ring-0 text-on-surface mt-1"
      />
      <div className="grid grid-cols-2 gap-sm mt-sm">
        <div>
          <label className="text-[10px] font-bold text-on-surface-variant uppercase">Cantidad (KG)</label>
          <input
            type="number"
            defaultValue={qty}
            className="w-full bg-surface-container-low border border-outline-variant rounded p-1 text-sm font-body-sm"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-on-surface-variant uppercase">Precio unit.</label>
          <input
            type="text"
            defaultValue={unit}
            className={`w-full bg-surface-container-low border rounded p-1 text-sm font-body-sm ${
              alert ? "border-secondary text-secondary font-bold" : "border-outline-variant"
            }`}
          />
        </div>
      </div>
      {alert && (
        <div className="mt-sm p-xs bg-secondary-container/20 rounded-lg flex items-center gap-xs">
          <span className="material-symbols-outlined text-secondary text-[16px]">trending_up</span>
          <p className="text-[11px] text-on-secondary-container font-bold">{alert}</p>
        </div>
      )}
    </div>
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
