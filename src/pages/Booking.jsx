import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Map, MapPin, Star } from "lucide-react";
import Button from "../components/ui/Button";
import MapPickerSheet from "../components/MapPickerSheet";
import { useOrders } from "../store/OrdersContext";
import { useAuth } from "../store/AuthContext";
import { useToast } from "../store/ToastContext";
import { careServices, quickServices, seedProviders, userProfile } from "../data/mockData";

const timeSlots = ["09:00-10:00", "11:00-12:00", "14:00-15:00", "16:00-17:00", "18:00-19:00"];
const MAX_DAYS_AHEAD = 30;

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

export default function Booking() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { addOrder } = useOrders();
  const { user, accounts } = useAuth();
  const { notify } = useToast();

  const service = useMemo(
    () => [...quickServices, ...careServices].find((s) => s.id === serviceId),
    [serviceId]
  );
  const hasDuration = Boolean(service?.pricePerHour);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState(timeSlots[0]);
  const [hours, setHours] = useState(service?.minHours ?? 1);
  const [address, setAddress] = useState(
    () => userProfile.addresses.find((a) => a.primary)?.detail ?? userProfile.addresses[0].detail
  );
  const [mapOpen, setMapOpen] = useState(false);
  const [providerId, setProviderId] = useState(null);

  const providerOptions = useMemo(() => {
    const real = accounts
      .filter((a) => a.role === "doktor" && a.verified !== false)
      .map((a) => ({
        id: a.phone,
        name: `Dr. ${a.firstName} ${a.lastName}`,
        specialty: a.specialty,
        rating: null,
        providerType: "real",
        phone: a.phone,
      }));
    const seed = seedProviders.map((p) => ({ ...p, providerType: "seed", phone: null }));
    return [...real, ...seed].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [accounts]);

  const selectedProvider = providerOptions.find((p) => p.id === providerId) ?? null;

  if (!service) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 pt-16 text-center">
        <p className="text-body text-neutral-500">Xizmat topilmadi</p>
        <Button variant="secondary" onClick={() => navigate("/xizmatlar")}>
          Xizmatlarga qaytish
        </Button>
      </div>
    );
  }

  const totalPrice = hasDuration ? service.pricePerHour * hours : service.price;
  const maxDate = new Date(Date.now() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  function pickBest() {
    if (providerOptions.length) setProviderId(providerOptions[0].id);
  }

  function handleConfirm() {
    if (!selectedProvider) {
      notify("Hamshira yoki doktor tanlang");
      return;
    }

    addOrder({
      type: "service",
      title: service.name,
      patientName: user ? `${user.firstName} ${user.lastName}` : undefined,
      patientAge: user?.age,
      address,
      time: `${date} ${slot}`,
      price: totalPrice,
      hours: hasDuration ? hours : undefined,
      paid: false,
      provider: selectedProvider.name,
      providerPhone: selectedProvider.providerType === "real" ? selectedProvider.phone : null,
      providerType: selectedProvider.providerType,
      confirmAt: selectedProvider.providerType === "seed" ? Date.now() + 2500 : undefined,
    });

    notify(`${service.name} buyurtma qilindi — ${selectedProvider.name} tasdiqlashini kutmoqda`);
    navigate("/buyurtmalar");
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <header className="px-4 pb-2 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft size={16} /> Orqaga
        </button>
        <h1 className="text-h2 font-bold text-neutral-900">{service.name} band qilish</h1>
        <p className="mt-1 text-small text-neutral-500">
          {hasDuration ? `${formatSom(service.pricePerHour)}/soat` : formatSom(service.price)}
        </p>
      </header>

      <div className="flex flex-col gap-4 px-4">
        <div>
          <label className="text-label font-semibold text-neutral-500">Sana</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            max={maxDate}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 h-12 w-full rounded-xl border border-neutral-200 px-3 text-body focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="mt-1 text-[11px] text-neutral-400">30 kungacha oldinga band qilishingiz mumkin</p>
        </div>

        <div>
          <label className="text-label font-semibold text-neutral-500">Vaqt</label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {timeSlots.map((s) => (
              <button
                key={s}
                onClick={() => setSlot(s)}
                className={`h-11 rounded-xl border text-sm font-semibold transition ${
                  slot === s
                    ? "border-primary bg-primary/10 text-primary-dark"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {hasDuration && (
          <div>
            <label className="text-label font-semibold text-neutral-500">Davomiyligi</label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {Array.from(
                { length: service.maxHours - service.minHours + 1 },
                (_, i) => service.minHours + i
              ).map((h) => (
                <button
                  key={h}
                  onClick={() => setHours(h)}
                  className={`h-11 rounded-xl border text-sm font-semibold transition ${
                    hours === h
                      ? "border-primary bg-primary/10 text-primary-dark"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  {h} soat
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-label font-semibold text-neutral-500">Manzil</label>
          <button
            onClick={() => setMapOpen(true)}
            className="mt-1 flex w-full items-start gap-2 rounded-xl border border-neutral-200 p-3 text-left text-sm hover:border-primary/40"
          >
            <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
            <span className="flex-1 text-neutral-800">{address}</span>
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
              <Map size={14} /> Xaritadan
            </span>
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-label font-semibold text-neutral-500">Hamshira / Doktor tanlang</label>
            <button type="button" onClick={pickBest} className="text-xs font-semibold text-primary">
              Eng yaxshisini tanlash
            </button>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {providerOptions.map((p) => {
              const active = providerId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setProviderId(p.id)}
                  className={`flex items-center gap-3 rounded-card border p-3 text-left transition ${
                    active ? "border-primary bg-primary/10" : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${
                      active ? "bg-primary text-white" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {initials(p.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-bold ${active ? "text-primary-dark" : "text-neutral-900"}`}>
                      {p.name}
                    </span>
                    <span className="block truncate text-label text-neutral-500">{p.specialty}</span>
                  </span>
                  {p.rating ? (
                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-neutral-600">
                      <Star size={13} className="fill-warning text-warning" /> {p.rating}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] font-bold text-secondary">
                      Yangi
                    </span>
                  )}
                  {active && <Check size={16} className="shrink-0 text-primary" />}
                </button>
              );
            })}
            {providerOptions.length === 0 && (
              <p className="text-small text-neutral-400">Hozircha mavjud hamshira yo'q</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
          <span className="text-small text-neutral-500">Jami</span>
          <span className="text-lg font-bold text-neutral-900">{formatSom(totalPrice)}</span>
        </div>

        <Button onClick={handleConfirm} className="w-full justify-center">
          Tasdiqlash
        </Button>
      </div>

      <MapPickerSheet open={mapOpen} onClose={() => setMapOpen(false)} onConfirm={setAddress} />
    </div>
  );
}
