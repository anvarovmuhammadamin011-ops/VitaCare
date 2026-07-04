import { useNavigate } from "react-router-dom";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { useAuth } from "../store/AuthContext";
import { useProviderProfile } from "../store/ProviderProfileContext";

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

export default function Doctors() {
  const navigate = useNavigate();
  const { accounts } = useAuth();
  const { getProviderProfile } = useProviderProfile();
  const doctors = accounts.filter(
    (a) => a.role === "doktor" && a.verified !== false && a.providerKind !== "hamshira"
  );

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
        <p className="mt-1 text-small text-neutral-500">Doktorni tanlang, soatiga band qiling</p>
      </header>

      <div className="grid grid-cols-2 gap-3 px-4">
        {doctors.length ? (
          doctors.map((d) => {
            const name = `Dr. ${d.firstName} ${d.lastName}`;
            const hourlyRate = getProviderProfile(d.phone).hourlyRate;
            return (
              <button
                key={d.phone}
                onClick={() => navigate(`/doktor-band-qilish/${encodeURIComponent(d.phone)}`)}
                className="flex flex-col items-start gap-3 rounded-card border border-neutral-100 bg-white p-4 text-left transition active:scale-[0.98] hover:border-neutral-200"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary/10 text-sm font-bold text-secondary">
                  {initials(name)}
                </span>
                <span className="w-full">
                  <span className="block text-sm font-bold leading-tight text-neutral-900">{name}</span>
                  <span className="mt-1 flex items-center gap-1 text-label text-neutral-500">
                    <Stethoscope size={11} /> {d.specialty}
                  </span>
                  <span className="mt-1 block text-small font-semibold text-primary-dark">
                    {formatSom(hourlyRate)}/soat
                  </span>
                </span>
              </button>
            );
          })
        ) : (
          <div className="col-span-2 rounded-card border border-dashed border-neutral-200 py-12 text-center text-small text-neutral-400">
            Hozircha ro'yxatdan o'tgan doktorlar yo'q
          </div>
        )}
      </div>
    </div>
  );
}
