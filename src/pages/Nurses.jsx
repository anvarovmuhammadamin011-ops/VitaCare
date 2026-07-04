import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { useAuth } from "../store/AuthContext";
import { useProviderProfile } from "../store/ProviderProfileContext";
import { careServices, quickServices, seedProviders } from "../data/mockData";

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

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
  const { getProviderProfile } = useProviderProfile();
  const catalog = [...quickServices, ...careServices];

  const realList = accounts
    .filter((a) => a.role === "doktor" && a.verified !== false && a.providerKind === "hamshira")
    .map((a) => ({
      id: a.phone,
      name: `${a.firstName} ${a.lastName}`,
      specialtyLine: a.specialty,
      hourlyRate: getProviderProfile(a.phone).hourlyRate,
      onClick: () => navigate(`/doktor-band-qilish/${encodeURIComponent(a.phone)}`),
    }));

  const seedList = seedProviders.map((p) => ({
    id: p.id,
    name: p.name,
    specialtyLine: catalog.filter((s) => p.services?.includes(s.id)).map((s) => s.name).join(", "),
    rating: p.rating,
    reviewCount: p.reviewCount,
    onClick: () => navigate(`/xizmat-savati/hamshira/${p.id}`),
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
        <p className="mt-1 text-small text-neutral-500">Hamshirani tanlang, soatiga band qiling</p>
      </header>

      <div className="grid grid-cols-2 gap-3 px-4">
        {nurses.length ? (
          nurses.map((p) => (
            <button
              key={p.id}
              onClick={p.onClick}
              className="flex flex-col items-start gap-3 rounded-card border border-neutral-100 bg-white p-4 text-left transition active:scale-[0.98] hover:border-neutral-200"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary-dark">
                {initials(p.name)}
              </span>
              <span className="w-full">
                <span className="block text-sm font-bold leading-tight text-neutral-900">{p.name}</span>
                {p.rating ? (
                  <span className="mt-1 flex items-center gap-1 text-label text-neutral-500">
                    <Star size={11} className="fill-warning text-warning" /> {p.rating} ({p.reviewCount})
                  </span>
                ) : (
                  <span className="mt-1 block truncate text-label text-neutral-500">{p.specialtyLine}</span>
                )}
                <span className="mt-1 block text-small font-semibold text-primary-dark">
                  {p.hourlyRate ? `${formatSom(p.hourlyRate)}/soat` : "Band qilish"}
                </span>
              </span>
            </button>
          ))
        ) : (
          <div className="col-span-2 rounded-card border border-dashed border-neutral-200 py-12 text-center text-small text-neutral-400">
            Hozircha hamshiralar yo'q
          </div>
        )}
      </div>
    </div>
  );
}
