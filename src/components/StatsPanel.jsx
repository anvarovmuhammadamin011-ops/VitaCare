import { Repeat, Star, TrendingUp } from "lucide-react";
import Card from "./ui/Card";

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

// Payout history is the only genuinely time-series data this mock backend has
// (seedPayouts / seedPharmacyPayouts), so the trend bars reuse it rather than
// inventing a denser fake daily series.
export default function StatsPanel({ payouts, topService, repeatRate, avgRating, reviewCount }) {
  const chronological = [...payouts].reverse();
  const max = Math.max(...chronological.map((p) => p.amount), 1);

  return (
    <Card className="border-neutral-100">
      <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary/10 text-secondary">
          <TrendingUp size={14} />
        </span>
        Statistika
      </h2>

      <div className="mt-4 flex items-end gap-2" style={{ height: 72 }}>
        {chronological.map((p) => (
          <div key={p.date} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md bg-secondary/70"
              style={{ height: `${Math.max(8, (p.amount / max) * 56)}px` }}
              title={`${p.date}: ${formatSom(p.amount)}`}
            />
            <span className="text-[10px] text-neutral-400">{p.date.slice(5)}</span>
          </div>
        ))}
      </div>
      <p className="mt-1 text-center text-[11px] text-neutral-400">To'lovlar dinamikasi</p>

      <div className="mt-4 flex flex-col gap-2">
        {topService && (
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-[11px] font-semibold text-neutral-400">Eng ko'p buyurtma qilingan</p>
            <p className="mt-0.5 truncate text-sm font-bold text-neutral-900">
              {topService.label}{" "}
              <span className="font-normal text-neutral-500">
                · {topService.count} {topService.unit ?? "marta"}
              </span>
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400">
              <Repeat size={11} /> Takroriy bemorlar
            </p>
            <p className="mt-0.5 text-sm font-bold text-neutral-900">{repeatRate}%</p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400">
              <Star size={11} /> Reyting trendi
            </p>
            <p className="mt-0.5 text-sm font-bold text-neutral-900">
              {avgRating ? `${avgRating}/5` : "—"} <span className="font-normal text-neutral-400">({reviewCount})</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
