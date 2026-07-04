import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Map, MapPin, Square, SquareCheck } from "lucide-react";
import Button from "../components/ui/Button";
import MapPickerSheet from "../components/MapPickerSheet";
import { useOrders } from "../store/OrdersContext";
import { useAuth } from "../store/AuthContext";
import { useToast } from "../store/ToastContext";
import { careServices, quickServices, seedProviders, userProfile } from "../data/mockData";

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

function serviceLine(s) {
  if (s.pricePerHour) {
    return { price: s.pricePerHour, duration: `${s.minHours} soat` };
  }
  return { price: s.price, duration: s.duration ?? "" };
}

export default function ServiceCart() {
  const { providerType, providerId } = useParams();
  const navigate = useNavigate();
  const { addOrder, acceptOrder } = useOrders();
  const { user, accounts } = useAuth();
  const { notify } = useToast();

  const fullCatalog = useMemo(() => [...quickServices, ...careServices], []);

  const provider = useMemo(() => {
    if (providerType === "hamshira") {
      const nurse = seedProviders.find((p) => p.id === providerId);
      return nurse ? { name: nurse.name, phone: null, type: "seed", services: nurse.services } : null;
    }
    if (providerType === "doktor") {
      const decodedPhone = providerId ? decodeURIComponent(providerId) : null;
      const acc = accounts.find((a) => a.phone === decodedPhone && a.role === "doktor");
      return acc ? { name: `Dr. ${acc.firstName} ${acc.lastName}`, phone: acc.phone, type: "real", services: null } : null;
    }
    return null;
  }, [providerType, providerId, accounts]);

  const catalog = provider?.services ? fullCatalog.filter((s) => provider.services.includes(s.id)) : fullCatalog;

  const [step, setStep] = useState("select");
  const [selected, setSelected] = useState([]);
  const [address, setAddress] = useState(
    () => userProfile.addresses.find((a) => a.primary)?.detail ?? userProfile.addresses[0].detail
  );
  const [mapOpen, setMapOpen] = useState(false);
  const [timing, setTiming] = useState("darhol");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("14:00");
  const [note, setNote] = useState("");

  function toggleService(id) {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  const selectedItems = catalog
    .filter((s) => selected.includes(s.id))
    .map((s) => {
      const { price, duration } = serviceLine(s);
      return { title: s.name, price, duration };
    });
  const total = selectedItems.reduce((sum, item) => sum + item.price, 0);

  function handleConfirmOrder() {
    const order = addOrder({
      type: "service",
      items: selectedItems,
      patientName: user ? `${user.firstName} ${user.lastName}` : undefined,
      patientAge: user?.age,
      address,
      time: timing === "darhol" ? "Darhol" : `${date} ${time}`,
      price: total,
      note: note.trim() || undefined,
      paid: false,
      provider: provider?.name,
      providerPhone: provider?.phone ?? null,
      providerType: provider?.type,
    });

    if (provider?.type === "seed") {
      // Seed nurses can't log in to accept a request themselves, so confirm it now.
      acceptOrder(order.id);
    }

    notify(
      provider
        ? `Buyurtma ${provider.name}ga yuborildi`
        : "Buyurtma qilindi — xizmat ko'rsatuvchi qidirilmoqda"
    );
    navigate("/buyurtmalar");
  }

  const heading = provider ? `${provider.name} bilan band qilish` : "Hamshira xizmatidan tez foydalanish";

  return (
    <div className="flex flex-col gap-6 pb-6">
      <header className="px-4 pb-2 pt-6">
        <button
          onClick={() => (step === "select" ? navigate(-1) : setStep(step === "confirm" ? "location" : "select"))}
          className="mb-4 flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft size={16} /> Orqaga
        </button>
        <h1 className="text-h2 font-bold text-neutral-900">{heading}</h1>
        <p className="mt-1 text-small text-neutral-500">
          {step === "select" && "Kerakli xizmatlarni tanlang"}
          {step === "location" && "Manzilingizni belgilang"}
          {step === "confirm" && "Buyurtmangizni tasdiqlang"}
        </p>
      </header>

      {step === "select" && (
        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            {catalog.map((s) => {
              const { price, duration } = serviceLine(s);
              const active = selected.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleService(s.id)}
                  className={`flex items-center gap-3 rounded-card border p-3 text-left transition ${
                    active ? "border-primary bg-primary/10" : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  {active ? (
                    <SquareCheck size={20} className="shrink-0 text-primary" />
                  ) : (
                    <Square size={20} className="shrink-0 text-neutral-300" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-neutral-900">{s.name}</span>
                    <span className="block text-label text-neutral-500">{duration}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-neutral-900">{formatSom(price)}</span>
                </button>
              );
            })}
            {catalog.length === 0 && (
              <p className="text-small text-neutral-400">Bu bo'lim uchun xizmat topilmadi</p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
            <span className="text-small text-neutral-500">Jami ({selectedItems.length} ta xizmat)</span>
            <span className="text-lg font-bold text-neutral-900">{formatSom(total)}</span>
          </div>

          <Button
            onClick={() => setStep("location")}
            disabled={selectedItems.length === 0}
            className="w-full justify-center"
          >
            Davom etish
          </Button>
        </div>
      )}

      {step === "location" && (
        <div className="flex flex-col gap-4 px-4">
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

          <div className="flex flex-col gap-2">
            {userProfile.addresses.map((a) => (
              <button
                key={a.label}
                onClick={() => setAddress(a.detail)}
                className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition ${
                  address === a.detail ? "border-primary bg-primary/5" : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${a.primary ? "bg-primary" : "bg-neutral-300"}`} />
                <span className="font-semibold">{a.label}:</span> {a.detail}
              </button>
            ))}
          </div>

          <Button onClick={() => setStep("confirm")} className="w-full justify-center">
            Davom etish
          </Button>
        </div>
      )}

      {step === "confirm" && (
        <div className="flex flex-col gap-5 px-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Tanlangan xizmatlarim</h2>
            <div className="mt-2 flex flex-col gap-2">
              {selectedItems.map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-xl border border-neutral-100 px-3 py-2.5 text-sm">
                  <span>
                    <span className="font-semibold text-neutral-900">{item.title}</span>
                    <span className="ml-1.5 text-label text-neutral-500">{item.duration}</span>
                  </span>
                  <span className="font-semibold text-neutral-900">{formatSom(item.price)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
            <span className="text-small text-neutral-500">Jami summa</span>
            <span className="text-lg font-bold text-neutral-900">{formatSom(total)}</span>
          </div>

          <div>
            <label className="text-label font-semibold text-neutral-500">Qachon</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <button
                onClick={() => setTiming("darhol")}
                className={`h-11 rounded-xl border text-sm font-semibold transition ${
                  timing === "darhol" ? "border-primary bg-primary/10 text-primary-dark" : "border-neutral-200 text-neutral-600"
                }`}
              >
                Darhol
              </button>
              <button
                onClick={() => setTiming("vaqt")}
                className={`h-11 rounded-xl border text-sm font-semibold transition ${
                  timing === "vaqt" ? "border-primary bg-primary/10 text-primary-dark" : "border-neutral-200 text-neutral-600"
                }`}
              >
                Vaqt belgilash
              </button>
            </div>
            {timing === "vaqt" && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-11 rounded-xl border border-neutral-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-11 rounded-xl border border-neutral-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-label font-semibold text-neutral-500">Izoh (ixtiyoriy)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Masalan: allergiyalar, qo'shimcha talablar..."
              rows={3}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-body focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button onClick={handleConfirmOrder} className="w-full justify-center">
            <Check size={16} /> Buyurtma berish
          </Button>
        </div>
      )}

      <MapPickerSheet open={mapOpen} onClose={() => setMapOpen(false)} onConfirm={setAddress} />
    </div>
  );
}
