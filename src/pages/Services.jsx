import { useNavigate } from "react-router-dom";
import ServiceIcon from "../components/ServiceIcon";
import { careServices } from "../data/mockData";

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

export default function Services() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 pb-6">
      <header className="px-4 pb-2 pt-6">
        <h1 className="text-h2 font-bold text-neutral-900">Xizmatlar</h1>
        <p className="mt-1 text-small text-neutral-500">Kerakli xizmatni tanlang va band qiling</p>
      </header>

      <div className="grid grid-cols-2 gap-3 px-4">
        {careServices.map((s, i) => (
          <button
            key={s.id}
            onClick={() => navigate(`/band-qilish/${s.id}`)}
            className="flex flex-col items-start gap-3 rounded-card border border-neutral-100 bg-white p-4 text-left transition active:scale-[0.98] hover:border-neutral-200"
          >
            <span
              className={`grid h-11 w-11 place-items-center rounded-full ${
                i % 2 === 0 ? "bg-primary/10 text-primary-dark" : "bg-secondary/10 text-secondary"
              }`}
            >
              <ServiceIcon name={s.icon} size={20} strokeWidth={1.75} />
            </span>
            <span className="w-full">
              <span className="block text-sm font-bold leading-tight text-neutral-900">{s.name}</span>
              <span className="mt-1 block text-small text-neutral-500">
                {s.pricePerHour ? `${formatSom(s.pricePerHour)}/soat` : formatSom(s.price)}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
