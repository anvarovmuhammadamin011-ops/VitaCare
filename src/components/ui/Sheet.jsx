import { X } from "lucide-react";
import { useEffect } from "react";

// Module-level so stacked sheets (e.g. a map picker opened on top of a
// booking sheet) don't let the inner one's cleanup re-enable page scroll
// while the outer one is still open.
let openSheetCount = 0;

export default function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    openSheetCount += 1;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      openSheetCount = Math.max(0, openSheetCount - 1);
      if (openSheetCount === 0) document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Yopish"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/40"
      />
      <div className="relative z-10 max-h-[88svh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 pb-8 shadow-2xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-200" />
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Yopish"
            className="grid h-8 w-8 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
