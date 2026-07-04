import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Star } from "lucide-react";
import { useAuth } from "../store/AuthContext";
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
  const { accounts } = useAuth();
  const catalog = [...quickServices, ...careServices];

  const seedList = seedProviders.map((p) => ({
    id: p.id,
    link: p.id,
    name: p.name,
    specialtyLine: catalog.filter((s) => p.services?.includes(s.id)).map((s) => s.name).join(", "),
    experienceYears: p.experienceYears,
    rating: p.rating,
    reviewCount: p.reviewCount,
  }));

  const realList = accounts
    .filter((a) => a.role === "doktor" && a.verified !== false && a.providerKind === "hamshira")
    .map((a) => ({
      id: a.phone,
      link: encodeURIComponent(a.phone),
      name: `${a.firstName} ${a.lastName}`,
      specialtyLine: a.specialty,
      experienceYears: a.experienceYears,
      rating: null,
      reviewCount: 0,
    }));

  const nurses = [...realList, ...seedList];

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
        {nurses.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/xizmat-savati/hamshira/${p.link}`)}
            className="flex w-full items-center gap-3 rounded-card border border-neutral-200 bg-white p-4 text-left transition hover:border-primary/40 active:scale-[0.99]"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary-dark">
              {initials(p.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-bold text-neutral-900">{p.name}</span>
              <span className="mt-0.5 flex items-center gap-1 text-label text-neutral-500">
                {p.rating ? (
                  <>
                    <Star size={12} className="fill-warning text-warning" /> {p.rating} ({p.reviewCount} ta sharh) ·{" "}
                  </>
                ) : (
                  <span className="rounded-full bg-secondary/10 px-1.5 py-0.5 text-[10px] font-bold text-secondary">
                    Yangi
                  </span>
                )}
                {p.experienceYears} yil tajriba
              </span>
              <span className="mt-1 block truncate text-label text-neutral-400">{p.specialtyLine}</span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-neutral-300" />
          </button>
        ))}
      </div>
    </div>
  );
}
