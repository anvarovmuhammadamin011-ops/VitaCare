import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Star } from "lucide-react";
import { careServices, quickServices, seedProviders } from "../data/mockData";

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

export default function Nurses() {
  const navigate = useNavigate();
  const catalog = [...quickServices, ...careServices];

  return (
    <div className="flex flex-col gap-4 pb-6">
      <header className="px-4 pb-2 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft size={16} /> Orqaga
        </button>
        <h1 className="text-h2 font-bold text-neutral-900">Hamshiralar</h1>
        <p className="mt-1 text-small text-neutral-500">Hamshirani tanlang va uning xizmatlarini band qiling</p>
      </header>

      <div className="flex flex-col gap-3 px-4">
        {seedProviders.map((p) => {
          const names = catalog.filter((s) => p.services?.includes(s.id)).map((s) => s.name);
          return (
            <button
              key={p.id}
              onClick={() => navigate(`/xizmat-savati/hamshira/${p.id}`)}
              className="flex w-full items-center gap-3 rounded-card border border-neutral-200 bg-white p-4 text-left transition hover:border-primary/40 active:scale-[0.99]"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary-dark">
                {initials(p.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold text-neutral-900">{p.name}</span>
                <span className="mt-0.5 flex items-center gap-1 text-label text-neutral-500">
                  <Star size={12} className="fill-warning text-warning" /> {p.rating} ({p.reviewCount} ta sharh)
                  · {p.experienceYears} yil tajriba
                </span>
                <span className="mt-1 block truncate text-label text-neutral-400">{names.join(", ")}</span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-neutral-300" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
