import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, ChevronDown, ArrowRight, Bell, MapPin, Pill as PillIcon, ShieldCheck } from "lucide-react";
import Wordmark from "../components/Wordmark";
import ServiceIcon from "../components/ServiceIcon";
import ServiceDetailSheet from "../components/ServiceDetailSheet";
import LocationSheet from "../components/LocationSheet";
import { useCity } from "../store/CityContext";
import { useToast } from "../store/ToastContext";
import { useReminders } from "../store/RemindersContext";
import { quickServices } from "../data/mockData";

export default function Home() {
  const navigate = useNavigate();
  const { city } = useCity();
  const { notify } = useToast();
  const { totalToday, takenCount } = useReminders();
  const [search, setSearch] = useState("");
  const [detailService, setDetailService] = useState(null);
  const [locationOpen, setLocationOpen] = useState(false);

  const filteredServices = useMemo(
    () => quickServices.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <div className="flex flex-col gap-9 pb-6">
      {/* HEADER */}
      <header className="px-4 pb-2 pt-6">
        <div className="flex items-center justify-between">
          <Wordmark className="h-8 w-auto" />
          <button
            onClick={() => notify("Notifikatsiyalar: tez orada qo'shiladi")}
            aria-label="Notifikatsiyalar"
            className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100"
          >
            <Bell size={20} />
          </button>
        </div>

        <button
          onClick={() => setLocationOpen(true)}
          className="mt-3 flex items-center gap-1 text-sm font-semibold text-neutral-700"
        >
          <MapPin size={15} className="text-primary" />
          {city}
          <ChevronDown size={15} className="text-neutral-400" />
        </button>

        {/* Hero banner */}
        <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-5 text-white shadow-md">
          <div className="max-w-[62%]">
            <h2 className="text-lg font-bold leading-snug">Hamshira xizmati endilikda bir qadam yaqin!</h2>
            <p className="mt-1 text-small text-white/80">Tez, ishonchli va qulay</p>
            <button
              onClick={() => navigate("/band-qilish/umumiy-hamshira")}
              aria-label="Band qilish"
              className="mt-4 grid h-10 w-10 place-items-center rounded-full bg-white text-primary-dark transition hover:bg-white/90"
            >
              <ArrowRight size={18} />
            </button>
          </div>
          <span className="pointer-events-none absolute -right-3 bottom-0 select-none text-[100px] leading-none">
            🧑‍⚕️
          </span>
        </div>

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
          onClick={() => navigate("/eslatmalar")}
          className="flex w-full items-center gap-4 rounded-card border border-secondary/20 bg-secondary/5 p-4 text-left transition hover:border-secondary/40 hover:bg-secondary/10 active:scale-[0.99]"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-white">
            <PillIcon size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold text-neutral-900">Dori eslatuvchilari</span>
            <span className="block text-small text-neutral-500">
              {totalToday
                ? `Bugun ${takenCount}/${totalToday} dori qabul qilindi`
                : "Dorilaringiz uchun eslatma o'rnating"}
            </span>
          </span>
          <ChevronRight size={20} className="shrink-0 text-neutral-300" />
        </button>

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
      <LocationSheet open={locationOpen} onClose={() => setLocationOpen(false)} />
    </div>
  );
}
