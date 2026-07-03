import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Map, MapPin } from "lucide-react";
import Button from "../components/ui/Button";
import MapPickerSheet from "../components/MapPickerSheet";
import { useOrders } from "../store/OrdersContext";
import { useAuth } from "../store/AuthContext";
import { useToast } from "../store/ToastContext";
import { careServices, quickServices, userProfile } from "../data/mockData";

const timeSlots = ["09:00-10:00", "11:00-12:00", "14:00-15:00", "16:00-17:00", "18:00-19:00"];

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

export default function Booking() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { addOrder } = useOrders();
  const { user } = useAuth();
  const { notify } = useToast();

  const service = useMemo(
    () => [...quickServices, ...careServices].find((s) => s.id === serviceId),
    [serviceId]
  );

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState(timeSlots[0]);
  const [address, setAddress] = useState(
    () => userProfile.addresses.find((a) => a.primary)?.detail ?? userProfile.addresses[0].detail
  );
  const [mapOpen, setMapOpen] = useState(false);

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

  function handleConfirm() {
    addOrder({
      type: "service",
      title: service.name,
      patientName: user ? `${user.firstName} ${user.lastName}` : undefined,
      patientAge: user?.age,
      address,
      time: `${date} ${slot}`,
      price: service.price,
      paid: false,
    });
    notify(`${service.name} buyurtma qilindi — xizmat ko'rsatuvchi qidirilmoqda`);
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
        <p className="mt-1 text-small text-neutral-500">{formatSom(service.price)}</p>
      </header>

      <div className="flex flex-col gap-4 px-4">
        <div>
          <label className="text-label font-semibold text-neutral-500">Sana</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 h-12 w-full rounded-xl border border-neutral-200 px-3 text-body focus:outline-none focus:ring-2 focus:ring-primary"
          />
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
          <span className="text-small text-neutral-500">Jami</span>
          <span className="text-lg font-bold text-neutral-900">{formatSom(service.price)}</span>
        </div>

        <Button onClick={handleConfirm} className="w-full justify-center">
          Tasdiqlash
        </Button>
      </div>

      <MapPickerSheet open={mapOpen} onClose={() => setMapOpen(false)} onConfirm={setAddress} />
    </div>
  );
}
