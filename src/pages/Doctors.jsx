import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Stethoscope } from "lucide-react";
import { useAuth } from "../store/AuthContext";

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

export default function Doctors() {
  const navigate = useNavigate();
  const { accounts } = useAuth();
  const doctors = accounts.filter((a) => a.role === "doktor" && a.verified !== false);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <header className="px-4 pb-2 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft size={16} /> Orqaga
        </button>
        <h1 className="text-h2 font-bold text-neutral-900">Doktorlar</h1>
        <p className="mt-1 text-small text-neutral-500">Doktorni tanlang va xizmatlarini band qiling</p>
      </header>

      <div className="flex flex-col gap-3 px-4">
        {doctors.length ? (
          doctors.map((d) => {
            const name = `Dr. ${d.firstName} ${d.lastName}`;
            return (
              <button
                key={d.phone}
                onClick={() => navigate(`/xizmat-savati/doktor/${encodeURIComponent(d.phone)}`)}
                className="flex w-full items-center gap-3 rounded-card border border-neutral-200 bg-white p-4 text-left transition hover:border-primary/40 active:scale-[0.99]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary/10 text-sm font-bold text-secondary">
                  {initials(name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold text-neutral-900">{name}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-label text-neutral-500">
                    <Stethoscope size={12} /> {d.specialty} · {d.experienceYears} yil tajriba
                  </span>
                  {d.serviceCity && (
                    <span className="mt-1 block text-label text-neutral-400">{d.serviceCity}</span>
                  )}
                </span>
                <ChevronRight size={18} className="shrink-0 text-neutral-300" />
              </button>
            );
          })
        ) : (
          <div className="rounded-card border border-dashed border-neutral-200 py-12 text-center text-small text-neutral-400">
            Hozircha ro'yxatdan o'tgan doktorlar yo'q
          </div>
        )}
      </div>
    </div>
  );
}
