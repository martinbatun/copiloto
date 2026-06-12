"use client";

interface Chip {
  id: string;
  name: string;
}

/** Chips horizontales de categoría (pill scroll). "Todo" = id null. */
export function CategoryChips({
  categories,
  active,
  onChange,
}: {
  categories: Chip[];
  active: string | null;
  onChange: (id: string | null) => void;
}) {
  const base =
    "flex-shrink-0 px-6 py-3 rounded-full font-label-md text-label-md transition-transform active:scale-95";
  return (
    <div className="flex gap-3 overflow-x-auto category-scroll pb-4 -mx-margin-mobile px-margin-mobile">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={
          active === null
            ? `${base} bg-primary text-on-primary shadow-md`
            : `${base} bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest`
        }
      >
        Todo
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.id)}
          className={
            active === c.id
              ? `${base} bg-primary text-on-primary shadow-md`
              : `${base} bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest`
          }
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
