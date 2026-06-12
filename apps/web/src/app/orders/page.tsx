"use client";

import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import type { OrderStatus, OrderSummaryDTO } from "@copiloto/shared";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { useOpsOrders, useOrderHistory, useUpdateOrder } from "@/lib/hooks/useOrders";
import { formatMoney } from "@/lib/format";
import { armChime, playChime } from "@/lib/chime";

const SOUND_KEY = "copiloto:orders:sound";

// Columnas activas del board. SERVED/CANCELLED salen del tablero.
const COLUMNS: {
  status: OrderStatus;
  title: string;
  icon: string;
  accent: string;
  chip: string;
  next: OrderStatus;
  nextLabel: string;
}[] = [
  {
    status: "PLACED",
    title: "Recibidos",
    icon: "receipt_long",
    accent: "border-l-primary",
    chip: "bg-primary/10 text-primary",
    next: "IN_KITCHEN",
    nextLabel: "Mandar a cocina",
  },
  {
    status: "IN_KITCHEN",
    title: "En cocina",
    icon: "skillet",
    accent: "border-l-secondary",
    chip: "bg-secondary/10 text-secondary",
    next: "READY",
    nextLabel: "Marcar listo",
  },
  {
    status: "READY",
    title: "Listos para entregar",
    icon: "room_service",
    accent: "border-l-tertiary",
    chip: "bg-tertiary/10 text-tertiary",
    next: "SERVED",
    nextLabel: "Entregar",
  },
];

export default function Page() {
  const { currentLocation } = useAuth();
  const locationId = currentLocation?.id;
  const { data, isLoading, error, isFetching } = useOpsOrders(locationId);
  const update = useUpdateOrder(locationId);

  const [tab, setTab] = useState<"board" | "history">("board");
  const [soundOn, setSoundOn] = useState(false);

  const orders = data?.orders ?? [];
  const byStatus = (s: OrderStatus) => orders.filter((o) => o.status === s);

  // Carga la preferencia de sonido (persistida).
  useEffect(() => {
    setSoundOn(window.localStorage.getItem(SOUND_KEY) === "1");
  }, []);

  function toggleSound() {
    setSoundOn((on) => {
      const next = !on;
      window.localStorage.setItem(SOUND_KEY, next ? "1" : "0");
      if (next) {
        armChime(); // este click es el gesto que desbloquea el audio
        playChime(); // confirmación audible
      }
      return next;
    });
  }

  // Detección de pedidos nuevos: ids que no habíamos visto. En la primera carga
  // sólo sembramos el set (sin avisar). Después: toast siempre, campana si está
  // activada.
  const seenRef = useRef<Set<string>>(new Set());
  const initRef = useRef(false);
  useEffect(() => {
    if (!data) return;
    const ids = data.orders.map((o) => o.id);
    if (!initRef.current) {
      seenRef.current = new Set(ids);
      initRef.current = true;
      return;
    }
    const fresh = data.orders.filter((o) => !seenRef.current.has(o.id));
    ids.forEach((id) => seenRef.current.add(id));
    if (fresh.length > 0) {
      if (soundOn) playChime();
      const label =
        fresh.length === 1
          ? `Nuevo pedido ${fresh[0]?.code ?? ""}`
          : `${fresh.length} pedidos nuevos`;
      toast.success(label, { description: "Entró al tablero de cocina." });
    }
  }, [data, soundOn]);

  return (
    <AppShell>
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Pedidos{currentLocation ? ` · ${currentLocation.name}` : ""}
          </h1>
          <p className="font-body-md text-on-surface-variant flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Tablero en vivo · {orders.length} activos
            {isFetching && <span className="text-xs text-on-surface-variant">actualizando…</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle de sonido */}
          <button
            type="button"
            onClick={toggleSound}
            title={soundOn ? "Silenciar avisos" : "Activar sonido de pedidos"}
            className={`w-10 h-10 flex items-center justify-center rounded-full border transition-colors ${
              soundOn
                ? "bg-primary/10 border-primary text-primary"
                : "bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {soundOn ? "notifications_active" : "notifications_off"}
            </span>
          </button>

          {/* Tabs Tablero / Historial */}
          <div className="flex bg-surface-container-high rounded-full p-1">
            <TabButton active={tab === "board"} onClick={() => setTab("board")} icon="grid_view">
              Tablero
            </TabButton>
            <TabButton active={tab === "history"} onClick={() => setTab("history")} icon="history">
              Historial
            </TabButton>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <div>
            <p className="font-bold">No pudimos cargar los pedidos</p>
            <p className="text-sm">{String((error as Error).message)}</p>
          </div>
        </div>
      )}

      {tab === "board" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
          {COLUMNS.map((col) => {
            const list = byStatus(col.status);
            return (
              <section
                key={col.status}
                className="bg-surface-container-low rounded-xl border border-outline-variant/40 p-3"
              >
                <div className="flex items-center justify-between px-2 py-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                      {col.icon}
                    </span>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">{col.title}</h2>
                  </div>
                  <span className="bg-surface-container-highest text-on-surface-variant px-2.5 py-0.5 rounded-full text-xs font-bold">
                    {list.length}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)
                  ) : list.length === 0 ? (
                    <p className="text-center text-sm text-on-surface-variant py-8">Sin pedidos</p>
                  ) : (
                    list.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        accent={col.accent}
                        chip={col.chip}
                        nextLabel={col.nextLabel}
                        pending={update.isPending}
                        onAdvance={() => update.mutate({ id: order.id, status: col.next })}
                        onPaid={() => update.mutate({ id: order.id, paymentStatus: "PAID" })}
                        onCancel={() => update.mutate({ id: order.id, status: "CANCELLED" })}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <HistoryView locationId={locationId} />
      )}
    </AppShell>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full flex items-center gap-1.5 font-label-md text-[13px] transition-all ${
        active ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
      }`}
    >
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      {children}
    </button>
  );
}

function HistoryView({ locationId }: { locationId: string | undefined }) {
  const { data, isLoading, error } = useOrderHistory(locationId);
  const orders = data?.orders ?? [];

  const servedTotal = orders
    .filter((o) => o.status === "SERVED")
    .reduce((acc, o) => acc + o.totalCents, 0);
  const servedCount = orders.filter((o) => o.status === "SERVED").length;
  const cancelledCount = orders.filter((o) => o.status === "CANCELLED").length;

  return (
    <section className="bg-white rounded-xl border border-outline-variant card-shadow overflow-hidden">
      <div className="p-md border-b border-outline-variant flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center bg-surface-container-low">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Historial de hoy</h2>
        <div className="flex gap-2 text-xs">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
            {servedCount} servidos · {formatMoney(servedTotal)}
          </span>
          {cancelledCount > 0 && (
            <span className="bg-error/10 text-error px-3 py-1 rounded-full font-bold">
              {cancelledCount} cancelados
            </span>
          )}
        </div>
      </div>

      {error && (
        <p className="p-md text-sm text-error">{String((error as Error).message)}</p>
      )}

      {isLoading ? (
        <div className="p-md space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-surface-container-high/70 rounded animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="p-xl text-center text-on-surface-variant font-body-md">
          Aún no hay pedidos cerrados hoy.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant">
                {["Código", "Artículos", "Pago", "Estado", "Hora", "Total"].map((h) => (
                  <th
                    key={h}
                    className="px-md py-3 font-label-md text-on-surface-variant text-sm whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {orders.map((o) => (
                <HistoryRow key={o.id} order={o} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function HistoryRow({ order }: { order: OrderSummaryDTO }) {
  const cancelled = order.status === "CANCELLED";
  const itemsLabel = order.items.map((i) => `${i.qty}× ${i.name}`).join(", ");
  const time = new Date(order.createdAt).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <tr className="hover:bg-surface-container-lowest transition-colors">
      <td className="px-md py-3 font-bold text-on-surface">{order.code}</td>
      <td className="px-md py-3 text-body-sm text-on-surface-variant max-w-xs truncate" title={itemsLabel}>
        {itemsLabel}
      </td>
      <td className="px-md py-3">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            order.paymentStatus === "PAID"
              ? "bg-primary/10 text-primary"
              : "bg-secondary-fixed/40 text-secondary"
          }`}
        >
          {order.paymentStatus === "PAID" ? "Pagado" : "Sin pagar"}
        </span>
      </td>
      <td className="px-md py-3">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            cancelled ? "bg-error/10 text-error" : "bg-surface-container-highest text-on-surface-variant"
          }`}
        >
          {cancelled ? "Cancelado" : "Servido"}
        </span>
      </td>
      <td className="px-md py-3 text-body-sm text-on-surface-variant">{time}</td>
      <td className={`px-md py-3 font-label-md ${cancelled ? "text-on-surface-variant line-through" : "text-primary"}`}>
        {formatMoney(order.totalCents)}
      </td>
    </tr>
  );
}

function OrderCard({
  order,
  accent,
  chip,
  nextLabel,
  pending,
  onAdvance,
  onPaid,
  onCancel,
}: {
  order: OrderSummaryDTO;
  accent: string;
  chip: string;
  nextLabel: string;
  pending: boolean;
  onAdvance: () => void;
  onPaid: () => void;
  onCancel: () => void;
}) {
  const ago = formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es });
  const paid = order.paymentStatus === "PAID";

  return (
    <div className={`bg-white rounded-xl border border-outline-variant/30 border-l-4 ${accent} card-shadow p-4`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg font-numeral-xl text-lg ${chip}`}>
            {order.code}
          </span>
          {order.tableLabel && (
            <span className="text-xs text-on-surface-variant font-bold">{order.tableLabel}</span>
          )}
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${
            paid ? "bg-primary/10 text-primary" : "bg-secondary-fixed/40 text-secondary"
          }`}
        >
          {paid ? "Pagado" : order.paymentMethod === "MOBILE" ? "Pago móvil" : "Pago en caja"}
        </span>
      </div>

      <ul className="space-y-0.5 mb-3">
        {order.items.map((it) => (
          <li key={it.id} className="flex justify-between text-body-sm">
            <span className="text-on-surface">
              <span className="font-bold">{it.qty}×</span> {it.name}
            </span>
            <span className="text-on-surface-variant">{formatMoney(it.totalCents)}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-outline-variant/40 pt-2 mb-3">
        <span className="text-xs text-on-surface-variant">{ago}</span>
        <span className="font-label-md text-label-md text-primary">{formatMoney(order.totalCents)}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={onAdvance}
          className="flex-1 bg-primary text-white px-3 py-2 rounded-lg font-label-md text-xs flex items-center justify-center gap-1 hover:bg-primary-container transition-colors disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          {nextLabel}
        </button>
        {!paid && (
          <button
            type="button"
            disabled={pending}
            onClick={onPaid}
            title="Marcar como pagado"
            className="px-3 py-2 rounded-lg border border-primary text-primary font-label-md text-xs flex items-center gap-1 hover:bg-primary/5 transition-colors disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[16px]">payments</span>
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          title="Cancelar pedido"
          className="px-2 py-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-outline-variant/30 card-shadow p-4 animate-pulse">
      <div className="h-7 w-16 bg-surface-container-high rounded-lg mb-3" />
      <div className="h-4 w-full bg-surface-container-high/70 rounded mb-2" />
      <div className="h-4 w-2/3 bg-surface-container-high/70 rounded mb-3" />
      <div className="h-8 w-full bg-surface-container-high rounded" />
    </div>
  );
}
