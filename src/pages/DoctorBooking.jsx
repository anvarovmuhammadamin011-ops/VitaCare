import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Map, MapPin, Minus, Plus, Stethoscope } from "lucide-react";
import Button from "../components/ui/Button";
import MapPickerSheet from "../components/MapPickerSheet";
import { useOrders } from "../store/OrdersContext";
import { useAuth } from "../store/AuthContext";
import { useProviderProfile } from "../store/ProviderProfileContext";
import { useToast } from "../store/ToastContext";
import { userProfile } from "../data/mockData";

const timeSlots = ["09:00-10:00", "11:00-12:00", "14:00-15:00", "16:00-17:00", "18:00-19:00"];
const MAX_DAYS_AHEAD = 30;
const MIN_HOURS = 1;

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

export default function DoctorBooking() {
  const { phone } = useParams();
  const navigate = useNavigate();
  const { addOrder } = useOrders();
  const { user, accounts } = useAuth();
  const { getProviderProfile } = useProviderProfile();
  const { notify } = useToast();

  const doctorPhone = decodeURIComponent(phone ?? "");
  const doctor = useMemo(
    () => accounts.find((a) => a.phone === doctorPhone && a.role === "doktor"),
    [accounts, doctorPhone]
  );
  const hourlyRate = getProviderProfile(doctorPhone).hourlyRate;
  const isNurse = doctor?.providerKind === "hamshira";

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState(timeSlots[0]);
  const [hours, setHours] = useState(MIN_HOURS);
  const [address, setAddress] = useState(
    () => userProfile.addresses.find((a) => a.primary)?.detail ?? userProfile.addresses[0].detail
  );
  const [mapOpen, setMapOpen] = useState(false);

  if (!doctor) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 pt-16 text-center">
        <p className="text-body text-neutral-500">Topilmadi</p>
        <Button variant="secondary" onClick={() => navigate("/xizmatlar")}>
          Xizmatlarga qaytish
        </Button>
      </div>
    );
  }

  const name = isNurse ? `${doctor.firstName} ${doctor.lastName} (Hamshira)` : `Dr. ${doctor.firstName} ${doctor.lastName}`;
  const maxDate = new Date(Date.now() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const totalPrice = hourlyRate * hours;

  function updateHours(next) {
    setHours(Math.max(MIN_HOURS, Math.round(next) || MIN_HOURS));
  }

  function handleConfirm() {
    addOrder({
      type: "service",
      title: isNurse ? `${doctor.specialty} xizmati` : `${doctor.specialty} konsultatsiyasi`,
      patientName: user ? `${user.firstName} ${user.lastName}` : undefined,
      patientAge: user?.age,
      address,
      time: `${date} ${slot}`,
      price: totalPrice,
      hours,
      paid: false,
      provider: name,
      providerPhone: doctor.phone,
      providerType: "real",
    });

    notify(`${name} band qilindi — tasdiqlashini kutmoqda`);
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
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary/10 text-secondary">
            <Stethoscope size={20} />
          </span>
          <div>
            <h1 className="text-h2 font-bold text-neutral-900">{name}</h1>
            <p className="mt-0.5 text-small text-neutral-500">
              {doctor.specialty} · {formatSom(hourlyRate)}/soat
            </p>
          </div>
        </div>
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

        <div>
          <label className="text-label font-semibold text-neutral-500">Davomiyligi (soat)</label>
          <p className="mt-0.5 text-[11px] text-neutral-400">Kamida 1 soat — soatiga to'lanadi</p>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateHours(hours - 1)}
              disabled={hours <= MIN_HOURS}
              aria-label="Soatni kamaytirish"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-neutral-200 text-neutral-600 disabled:opacity-40"
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              min={MIN_HOURS}
              step="1"
              value={hours}
              onChange={(e) => updateHours(Number(e.target.value))}
              className="h-11 w-20 rounded-xl border border-neutral-200 text-center text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => updateHours(hours + 1)}
              aria-label="Soatni oshirish"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-neutral-200 text-neutral-600"
            >
              <Plus size={16} />
            </button>
            <span className="text-sm text-neutral-500">soat</span>
          </div>
        </div>

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

        <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
          <span className="text-small text-neutral-500">
            {formatSom(hourlyRate)} × {hours} soat
          </span>
          <span className="text-lg font-bold text-neutral-900">{formatSom(totalPrice)}</span>
        </div>

        <Button onClick={handleConfirm} className="w-full justify-center">
          <Check size={16} /> Tasdiqlash
        </Button>
      </div>

      <MapPickerSheet open={mapOpen} onClose={() => setMapOpen(false)} onConfirm={setAddress} />
    </div>
  );
}
