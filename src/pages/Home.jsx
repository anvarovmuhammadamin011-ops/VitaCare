import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, ArrowRight, ShieldCheck } from "lucide-react";
import Wordmark from "../components/Wordmark";
import ServiceIcon from "../components/ServiceIcon";
import ServiceDetailSheet from "../components/ServiceDetailSheet";
import { quickServices } from "../data/mockData";

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [detailService, setDetailService] = useState(null);

  const filteredServices = useMemo(
    () => quickServices.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <div className="flex flex-col gap-9 pb-6">
      {/* HEADER */}
      <header className="px-4 pb-2 pt-6">
        <Wordmark />

        <h1 className="mt-6 text-h2 font-bold text-neutral-900">Assalomu alaykum 👋</h1>
        <p className="mt-1 text-small text-neutral-500">Bugun qanday yordam kerak?</p>

        {/* Search */}
        <div className="relative mt-5">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Xizmat qidirish..."
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-body text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/buyurtmalar")}
          className="mt-3 flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Buyurtmalar
          <ArrowRight size={16} />
        </button>
      </header>

      {/* TEZKOR XIZMATLAR */}
      <section className="px-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Tezkor xizmatlar</h2>
          <span className="text-label text-neutral-400">Bugun yetib keladi</span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-x-2 gap-y-4">
          {filteredServices.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setDetailService(s)}
              className="flex flex-col items-center gap-1.5 active:scale-[0.97]"
            >
              <span
                className={`grid h-16 w-16 place-items-center rounded-full ${
                  i % 2 === 0 ? "bg-primary/10 text-primary-dark" : "bg-secondary/10 text-secondary"
                }`}
              >
                <ServiceIcon name={s.icon} size={26} strokeWidth={1.75} />
              </span>
              <span className="text-center text-xs font-semibold leading-tight text-neutral-700">
                {s.name}
              </span>
            </button>
          ))}
          {filteredServices.length === 0 && (
            <p className="col-span-4 text-small text-neutral-400">Hech narsa topilmadi</p>
          )}
        </div>
      </section>

      {/* TEZKOR HAVOLALAR */}
      <section className="flex flex-col gap-3 px-4">
        <button
          onClick={() => navigate("/reimbursatsiya")}
          className="flex w-full items-center gap-4 rounded-card border border-primary/20 bg-primary/5 p-4 text-left transition hover:border-primary/40 hover:bg-primary/10 active:scale-[0.99]"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-white">
            <ShieldCheck size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold text-neutral-900">Reimbursatsiya dasturi</span>
            <span className="block text-small text-neutral-500">
              Shifokor yozgan dorilaringiz narxini qaytarib oling
            </span>
          </span>
          <ChevronRight size={20} className="shrink-0 text-neutral-300" />
        </button>
      </section>

      <ServiceDetailSheet
        service={detailService}
        onClose={() => setDetailService(null)}
        onBook={(s) => navigate(`/band-qilish/${s.id}`)}
      />
    </div>
  );
}
