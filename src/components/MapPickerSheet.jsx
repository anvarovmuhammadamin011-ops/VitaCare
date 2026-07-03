import { useMemo, useRef, useState } from "react";
import { Check, MapPin } from "lucide-react";
import Sheet from "./ui/Sheet";
import Button from "./ui/Button";
import { useCity } from "../store/CityContext";

const streetPool = [
  "Mirobod ko'chasi",
  "Bobur ko'chasi",
  "Amir Temur shoh ko'chasi",
  "Yusuf Xos Hojib ko'chasi",
  "Navoiy ko'chasi",
  "Istiqlol ko'chasi",
  "Mustaqillik ko'chasi",
  "Bunyodkor ko'chasi",
  "Shifokorlar ko'chasi",
  "Universitet ko'chasi",
  "Bog'bon ko'chasi",
  "Yoshlik ko'chasi",
];

const LIMIT = 150;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function zoneAddress(city, x, y) {
  const col = Math.round((x + LIMIT) / 50);
  const row = Math.round((y + LIMIT) / 50);
  const idx = ((row * 5 + col) % streetPool.length + streetPool.length) % streetPool.length;
  const house = 2 + (Math.abs(col * 7 + row * 13) % 48);
  return `${city}, ${streetPool[idx]}, ${house}-uy`;
}

export default function MapPickerSheet({ open, onClose, onConfirm }) {
  const { city } = useCity();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef(null);

  const address = useMemo(() => zoneAddress(city, -offset.x, -offset.y), [city, offset]);

  function handlePointerDown(e) {
    dragState.current = { startX: e.clientX, startY: e.clientY, origin: offset };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setOffset({
      x: clamp(dragState.current.origin.x + dx, -LIMIT, LIMIT),
      y: clamp(dragState.current.origin.y + dy, -LIMIT, LIMIT),
    });
  }

  function handlePointerUp() {
    dragState.current = null;
  }

  function handleConfirm() {
    onConfirm(address);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Manzilni xaritadan tanlang">
      <div
        className="relative h-72 w-full touch-none overflow-hidden rounded-2xl bg-[#e7edf0]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          className="absolute -inset-40"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            backgroundImage:
              "repeating-linear-gradient(0deg, #cfdadf 0 2px, transparent 2px 50px), repeating-linear-gradient(90deg, #cfdadf 0 2px, transparent 2px 50px)",
          }}
        >
          <div className="absolute left-[20%] top-[20%] h-24 w-28 rounded-[45%] bg-emerald-200/70" />
          <div className="absolute left-[62%] top-[55%] h-20 w-24 rounded-[40%] bg-emerald-200/70" />
          <div className="absolute left-[8%] top-[62%] h-24 w-20 rounded-[35%] bg-sky-200/70" />
          <div className="absolute left-[55%] top-[12%] h-16 w-24 rounded-[35%] bg-sky-200/60" />
        </div>

        <p className="pointer-events-none absolute inset-x-0 top-2 text-center text-xs font-medium text-neutral-500">
          Xaritani surib, manzilni belgilang
        </p>

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 translate-y-1 rounded-full bg-black/25 blur-[2px]" />
        <MapPin
          size={36}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full fill-primary text-primary-dark drop-shadow-md"
          strokeWidth={1.5}
        />
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700">
        <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
        {address}
      </div>

      <Button onClick={handleConfirm} className="mt-4 w-full justify-center">
        <Check size={16} /> Manzilni tasdiqlash
      </Button>
    </Sheet>
  );
}
