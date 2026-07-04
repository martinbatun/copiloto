"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";

interface Qr {
  label: string;
  url: string;
  dataUrl: string;
  file: string;
}

export default function Page() {
  const { currentLocation } = useAuth();
  const locationId = currentLocation?.id;
  const [count, setCount] = useState(8);
  const [qrs, setQrs] = useState<Qr[]>([]);
  const [building, setBuilding] = useState(false);

  useEffect(() => {
    if (!locationId) return;
    let cancelled = false;
    setBuilding(true);
    const origin = window.location.origin;
    const n = Math.min(50, Math.max(0, count));
    const specs: { label: string; mesa: string | null; file: string }[] = [
      { label: "Menú general", mesa: null, file: "menu-general" },
      ...Array.from({ length: n }, (_, i) => ({
        label: `Mesa ${i + 1}`,
        mesa: String(i + 1),
        file: `mesa-${i + 1}`,
      })),
    ];
    Promise.all(
      specs.map(async (s) => {
        const url = `${origin}/menu/${locationId}${s.mesa ? `?mesa=${encodeURIComponent(s.mesa)}` : ""}`;
        const dataUrl = await QRCode.toDataURL(url, { width: 320, margin: 1 });
        return { label: s.label, url, dataUrl, file: s.file };
      })
    ).then((res) => {
      if (!cancelled) {
        setQrs(res);
        setBuilding(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [locationId, count]);

  return (
    <AppShell>
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 qr-noprint">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            QR de mesas{currentLocation ? ` · ${currentLocation.name}` : ""}
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Imprime un QR por mesa. Al escanearlo, el cliente abre el menú con su mesa ya
            asignada.
          </p>
        </div>
        <div className="flex items-end gap-2">
          <label className="flex flex-col text-label-md text-on-surface-variant">
            Mesas
            <input
              type="number"
              min={0}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.min(50, Math.max(0, Number(e.target.value) || 0)))}
              className="mt-1 w-24 px-3 py-2 border border-outline-variant rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-md py-2 bg-primary text-white rounded-lg font-label-md flex items-center gap-xs hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Imprimir
          </button>
        </div>
      </header>

      {!currentLocation && (
        <p className="text-on-surface-variant">Selecciona una sucursal para generar sus QR.</p>
      )}

      {building && qrs.length === 0 && (
        <p className="text-on-surface-variant">Generando códigos…</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-gutter qr-grid">
        {qrs.map((q) => (
          <div
            key={q.file}
            className="bg-white border border-outline-variant card-shadow rounded-xl p-4 flex flex-col items-center text-center qr-card"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={q.dataUrl} alt={`QR ${q.label}`} className="w-full max-w-[200px] aspect-square" />
            <p className="font-headline-sm text-headline-sm text-on-surface mt-2">{q.label}</p>
            <p className="text-[11px] text-on-surface-variant break-all mt-1">{q.url}</p>
            <a
              href={q.dataUrl}
              download={`${q.file}.png`}
              className="qr-noprint mt-3 px-3 py-1.5 rounded-lg border border-primary text-primary font-label-md text-sm hover:bg-primary/5 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Descargar
            </a>
          </div>
        ))}
      </div>

      {/* En impresión: oculta el chrome del panel y deja solo los QR en grid. */}
      <style jsx global>{`
        @media print {
          header.glass-nav,
          nav,
          .qr-noprint,
          .fixed {
            display: none !important;
          }
          .main-canvas {
            padding: 0 !important;
          }
          .qr-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .qr-card {
            break-inside: avoid;
            box-shadow: none !important;
            border-color: #ddd !important;
          }
        }
      `}</style>
    </AppShell>
  );
}
