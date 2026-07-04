"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { AdminMenuItem, AdminMenuCategory } from "@copiloto/shared";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { formatMoney } from "@/lib/format";
import {
  useAdminMenu,
  useUpsertMenuItem,
  useDeleteMenuItem,
  useUpsertCategory,
  useDeleteCategory,
  useUploadMenuImage,
} from "@/lib/hooks/useMenuAdmin";

const UNCATEGORIZED = "__none__";

export default function Page() {
  const { currentLocation } = useAuth();
  const locationId = currentLocation?.id;
  const { data, isLoading, error } = useAdminMenu(locationId);

  const upsertItem = useUpsertMenuItem(locationId);
  const deleteItem = useDeleteMenuItem(locationId);
  const upsertCat = useUpsertCategory(locationId);
  const deleteCat = useDeleteCategory(locationId);

  const [editingItem, setEditingItem] = useState<Partial<AdminMenuItem> | null>(null);
  const [editingCat, setEditingCat] = useState<Partial<AdminMenuCategory> | null>(null);
  const [confirm, setConfirm] = useState<
    { kind: "item" | "cat"; id: string; name: string } | null
  >(null);

  // Agrupa items por categoría (respetando el orden de categorías + "Sin categoría").
  const groups = useMemo(() => {
    if (!data) return [];
    const byCat = new Map<string, AdminMenuItem[]>();
    for (const it of data.items) {
      const key = it.categoryId ?? UNCATEGORIZED;
      if (!byCat.has(key)) byCat.set(key, []);
      byCat.get(key)!.push(it);
    }
    const out = data.categories.map((c) => ({
      cat: c,
      items: byCat.get(c.id) ?? [],
    }));
    const orphans = byCat.get(UNCATEGORIZED) ?? [];
    if (orphans.length > 0) {
      out.push({ cat: { id: UNCATEGORIZED, name: "Sin categoría", sortKey: 9999 }, items: orphans });
    }
    return out;
  }, [data]);

  function onConfirmDelete() {
    if (!confirm) return;
    const done = () => {
      toast.success(confirm.kind === "item" ? "Platillo eliminado" : "Categoría eliminada");
      setConfirm(null);
    };
    const fail = (e: unknown) =>
      toast.error("No se pudo eliminar", { description: String((e as Error).message) });
    if (confirm.kind === "item") deleteItem.mutate(confirm.id, { onSuccess: done, onError: fail });
    else deleteCat.mutate(confirm.id, { onSuccess: done, onError: fail });
  }

  return (
    <AppShell>
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Carta{currentLocation ? ` · ${currentLocation.name}` : ""}
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Gestiona categorías y platillos de tu menú digital.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditingCat({ name: "", sortKey: (data?.categories.length ?? 0) + 1 })}
            className="px-md py-2 bg-white border border-outline-variant rounded-lg font-label-md flex items-center gap-xs hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
            Nueva categoría
          </button>
          <button
            type="button"
            onClick={() => setEditingItem({ active: true, tags: [] })}
            className="px-md py-2 bg-primary text-white rounded-lg font-label-md flex items-center gap-xs hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nuevo platillo
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4">
          <p className="font-bold">No pudimos cargar la carta</p>
          <p className="text-sm">{String((error as Error).message)}</p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-container-high/70 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {data && groups.length === 0 && (
        <div className="bg-white border border-outline-variant card-shadow rounded-xl p-xl text-center text-on-surface-variant">
          Aún no hay platillos. Crea una categoría y agrega tu primer platillo.
        </div>
      )}

      {data &&
        groups.map(({ cat, items }) => (
          <section key={cat.id} className="bg-white rounded-xl border border-outline-variant card-shadow overflow-hidden">
            <div className="px-md py-3 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                  restaurant_menu
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">{cat.name}</h2>
                <span className="bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded-full text-xs font-bold">
                  {items.length}
                </span>
              </div>
              {cat.id !== UNCATEGORIZED && (
                <div className="flex gap-1">
                  <IconBtn icon="edit" title="Renombrar" onClick={() => setEditingCat(cat)} />
                  <IconBtn
                    icon="delete"
                    title="Eliminar categoría"
                    danger
                    onClick={() => setConfirm({ kind: "cat", id: cat.id, name: cat.name })}
                  />
                </div>
              )}
            </div>
            <ul className="divide-y divide-outline-variant/60">
              {items.length === 0 ? (
                <li className="px-md py-4 text-sm text-on-surface-variant">Sin platillos.</li>
              ) : (
                items.map((it) => (
                  <ItemRow
                    key={it.id}
                    item={it}
                    onEdit={() => setEditingItem(it)}
                    onToggle={() =>
                      upsertItem.mutate(
                        { id: it.id, active: !it.active },
                        { onError: (e) => toast.error(String((e as Error).message)) }
                      )
                    }
                    onDelete={() => setConfirm({ kind: "item", id: it.id, name: it.name })}
                  />
                ))
              )}
            </ul>
          </section>
        ))}

      {editingItem && (
        <ItemEditor
          item={editingItem}
          categories={data?.categories ?? []}
          saving={upsertItem.isPending}
          onClose={() => setEditingItem(null)}
          onSave={(body) =>
            upsertItem.mutate(
              { id: editingItem.id, ...body },
              {
                onSuccess: () => {
                  toast.success(editingItem.id ? "Platillo actualizado" : "Platillo creado");
                  setEditingItem(null);
                },
                onError: (e) =>
                  toast.error("No se pudo guardar", { description: String((e as Error).message) }),
              }
            )
          }
        />
      )}

      {editingCat && (
        <CategoryEditor
          category={editingCat}
          saving={upsertCat.isPending}
          onClose={() => setEditingCat(null)}
          onSave={(body) =>
            upsertCat.mutate(
              { id: editingCat.id, ...body },
              {
                onSuccess: () => {
                  toast.success(editingCat.id ? "Categoría actualizada" : "Categoría creada");
                  setEditingCat(null);
                },
                onError: (e) =>
                  toast.error("No se pudo guardar", { description: String((e as Error).message) }),
              }
            )
          }
        />
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.kind === "item" ? "Eliminar platillo" : "Eliminar categoría"}
          message={
            confirm.kind === "item"
              ? `¿Eliminar “${confirm.name}”? Dejará de aparecer en el menú.`
              : `¿Eliminar la categoría “${confirm.name}”? Sus platillos quedarán sin categoría (no se borran).`
          }
          pending={deleteItem.isPending || deleteCat.isPending}
          onCancel={() => setConfirm(null)}
          onConfirm={onConfirmDelete}
        />
      )}
    </AppShell>
  );
}

function IconBtn({
  icon,
  title,
  onClick,
  danger,
}: {
  icon: string;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
        danger
          ? "text-on-surface-variant hover:text-error hover:bg-error-container/40"
          : "text-on-surface-variant hover:bg-surface-container-high"
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}

function ItemRow({
  item,
  onEdit,
  onToggle,
  onDelete,
}: {
  item: AdminMenuItem;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <li className={`px-md py-3 flex items-center gap-4 ${item.active ? "" : "opacity-55"}`}>
      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container flex items-center justify-center">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-on-surface-variant">restaurant</span>
        )}
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-on-surface truncate">{item.name}</span>
          {!item.active && (
            <span className="bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
              Inactivo
            </span>
          )}
          {item.tags.map((t) => (
            <span
              key={t}
              className="bg-secondary-container/20 text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase"
            >
              {t}
            </span>
          ))}
        </div>
        {item.description && (
          <p className="text-body-sm text-on-surface-variant truncate">{item.description}</p>
        )}
      </div>
      <span className="font-label-md text-label-md text-primary whitespace-nowrap">
        {formatMoney(item.priceCents)}
      </span>
      <div className="flex gap-1">
        <IconBtn
          icon={item.active ? "visibility" : "visibility_off"}
          title={item.active ? "Ocultar del menú" : "Mostrar en el menú"}
          onClick={onToggle}
        />
        <IconBtn icon="edit" title="Editar" onClick={onEdit} />
        <IconBtn icon="delete" title="Eliminar" danger onClick={onDelete} />
      </div>
    </li>
  );
}

// ─── Modales ──────────────────────────────────────────────────

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant sticky top-0 bg-white">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white";
const labelCls = "block font-label-md text-on-surface-variant mb-1";

function ItemEditor({
  item,
  categories,
  saving,
  onClose,
  onSave,
}: {
  item: Partial<AdminMenuItem>;
  categories: AdminMenuCategory[];
  saving: boolean;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => void;
}) {
  const [name, setName] = useState(item.name ?? "");
  const [description, setDescription] = useState(item.description ?? "");
  const [pricePesos, setPricePesos] = useState(
    item.priceCents != null ? String(item.priceCents / 100) : ""
  );
  const [categoryId, setCategoryId] = useState(item.categoryId ?? "");
  const [tags, setTags] = useState((item.tags ?? []).join(", "));
  const [rating, setRating] = useState(item.rating != null ? String(item.rating) : "");
  const [imageUrl, setImageUrl] = useState<string | null>(item.imageUrl ?? null);
  const [active, setActive] = useState(item.active ?? true);
  const upload = useUploadMenuImage();

  const price = Number(pricePesos);
  const valid = name.trim().length >= 2 && pricePesos !== "" && !Number.isNaN(price) && price >= 0;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    upload.mutate(file, {
      onSuccess: (r) => setImageUrl(r.url),
      onError: (err) =>
        toast.error("No se pudo subir la imagen", { description: String((err as Error).message) }),
    });
  }

  function submit() {
    if (!valid) return;
    onSave({
      name: name.trim(),
      description: description.trim() || null,
      priceCents: Math.round(price * 100),
      categoryId: categoryId || null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      rating: rating === "" ? null : Number(rating),
      imageUrl,
      active,
    });
  }

  return (
    <ModalShell title={item.id ? "Editar platillo" : "Nuevo platillo"} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Nombre *</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Tacos al pastor" />
        </div>
        <div>
          <label className={labelCls}>Descripción</label>
          <textarea
            className={inputCls}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Con piña, cebolla y cilantro"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Precio (MXN) *</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.01"
              value={pricePesos}
              onChange={(e) => setPricePesos(e.target.value)}
              placeholder="185.00"
            />
          </div>
          <div>
            <label className={labelCls}>Categoría</label>
            <select className={inputCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Tags (separados por coma)</label>
            <input className={inputCls} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Vegano, Picante" />
          </div>
          <div>
            <label className={labelCls}>Rating (0–5)</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="4.8"
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Imagen</label>
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container flex items-center justify-center flex-shrink-0">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant">image</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="px-3 py-2 bg-white border border-outline-variant rounded-lg font-label-md text-sm cursor-pointer hover:bg-surface-container-low flex items-center gap-2 w-fit">
                <span className="material-symbols-outlined text-[18px]">
                  {upload.isPending ? "progress_activity" : "upload"}
                </span>
                {upload.isPending ? "Subiendo…" : "Subir imagen"}
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={upload.isPending} />
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="text-sm text-error hover:underline w-fit"
                >
                  Quitar imagen
                </button>
              )}
            </div>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 accent-primary" />
          <span className="font-label-md text-on-surface">Visible en el menú</span>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-outline-variant font-label-md hover:bg-surface-container-low">
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!valid || saving || upload.isPending}
            className="px-4 py-2 rounded-lg bg-primary text-white font-label-md hover:bg-primary-container disabled:opacity-50 transition-colors"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function CategoryEditor({
  category,
  saving,
  onClose,
  onSave,
}: {
  category: Partial<AdminMenuCategory>;
  saving: boolean;
  onClose: () => void;
  onSave: (body: { name: string; sortKey?: number }) => void;
}) {
  const [name, setName] = useState(category.name ?? "");
  const [sortKey, setSortKey] = useState(String(category.sortKey ?? 0));
  const valid = name.trim().length >= 2;
  return (
    <ModalShell title={category.id ? "Editar categoría" : "Nueva categoría"} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Nombre *</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Entradas" />
        </div>
        <div>
          <label className={labelCls}>Orden</label>
          <input className={inputCls} type="number" min="0" value={sortKey} onChange={(e) => setSortKey(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-outline-variant font-label-md hover:bg-surface-container-low">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => valid && onSave({ name: name.trim(), sortKey: Number(sortKey) || 0 })}
            disabled={!valid || saving}
            className="px-4 py-2 rounded-lg bg-primary text-white font-label-md hover:bg-primary-container disabled:opacity-50 transition-colors"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function ConfirmModal({
  title,
  message,
  pending,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">{title}</h3>
        <p className="font-body-md text-on-surface-variant mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-outline-variant font-label-md hover:bg-surface-container-low">
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="px-4 py-2 rounded-lg bg-error text-on-error font-label-md hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {pending ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
