import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function TagList({ items, onAdd, onRemove, placeholder, tone = "neutral" }) {
  const [value, setValue] = useState("");
  const toneClass = tone === "warning" ? "bg-warning/10 text-warning" : "bg-neutral-100 text-neutral-700";

  function handleAdd() {
    const v = value.trim();
    if (!v) return;
    onAdd(v);
    setValue("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${toneClass}`}
          >
            {item}
            <button type="button" onClick={() => onRemove(item)} aria-label={`${item} o'chirish`}>
              <X size={13} />
            </button>
          </span>
        ))}
        {items.length === 0 && <p className="text-small text-neutral-400">Hali qo'shilmagan</p>}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          className="h-10 flex-1 rounded-xl border border-neutral-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-white"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
