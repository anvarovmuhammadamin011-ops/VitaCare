import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Map, MapPin, Square, SquareCheck, Upload } from "lucide-react";
import Button from "../components/ui/Button";
import Pill from "../components/ui/Pill";
import MapPickerSheet from "../components/MapPickerSheet";
import { usePharmacy } from "../store/PharmacyContext";
import { useAuth } from "../store/AuthContext";
import { useToast } from "../store/ToastContext";
import { drugCategories, drugs, userProfile } from "../data/mockData";

const labelClass = "text-label font-semibold text-neutral-500";

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

export default function PharmacyOrder() {
  const navigate = useNavigate();
  const { addOrder } = usePharmacy();
  const { user } = useAuth();
  const { notify } = useToast();

  const [step, setStep] = useState("select");
  const [category, setCategory] = useState("Barchasi");
  const [selected, setSelected] = useState([]);
  const [address, setAddress] = useState(
    () => userProfile.addresses.find((a) => a.primary)?.detail ?? userProfile.addresses[0].detail
  );
  const [mapOpen, setMapOpen] = useState(false);
  const [note, setNote] = useState("");
  const [prescriptionFileName, setPrescriptionFileName] = useState("");

  const filteredDrugs = drugs.filter((d) => category === "Barchasi" || d.category === category);

  function toggleDrug(id) {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  const selectedItems = drugs.filter((d) => selected.includes(d.id)).map((d) => ({ name: d.name, qty: 1, price: d.price }));
  const total = selectedItems.reduce((sum, item) => sum + item.price, 0);

  function handleConfirmOrder() {
    if (!prescriptionFileName) {
      notify("Retseptni yuklang");
      return;
    }
    addOrder({
      hasPrescription: true,
      patientName: user ? `${user.firstName} ${user.lastName}` : undefined,
      patientAge: user?.age,
      items: selectedItems,
      total,
      address,
      phone: user?.phone,
      note: note.trim() || undefined,
      prescriptionFileName,
      documentRequired: false,
      time: "Bugun",
    });
    notify("Dori buyurtmangiz apteka(lar)ga yuborildi");
    navigate("/buyurtmalar");
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <header className="px-4 pb-2 pt-6">
        <button
          onClick={() => (step === "select" ? navigate(-1) : setStep(step === "confirm" ? "location" : "select"))}
          className="mb-4 flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft size={16} /> Orqaga
        </button>
        <h1 className="text-h2 font-bold text-neutral-900">Dorixona</h1>
        <p className="mt-1 text-small text-neutral-500">
          {step === "select" && "Kerakli dorilarni tanlang"}
          {step === "location" && "Yetkazib berish manzilini belgilang"}
          {step === "confirm" && "Buyurtmangizni tasdiqlang"}
        </p>
      </header>

      {step === "select" && (
        <div className="flex flex-col gap-4 px-4">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            <Pill active={category === "Barchasi"} onClick={() => setCategory("Barchasi")}>
              Barchasi
            </Pill>
            {drugCategories.map((c) => (
              <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </Pill>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {filteredDrugs.map((d) => {
              const active = selected.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => toggleDrug(d.id)}
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
                    <span className="block text-sm font-bold text-neutral-900">{d.name}</span>
                    <span className="block text-label text-neutral-500">{d.pack}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-neutral-900">{formatSom(d.price)}</span>
                </button>
              );
            })}
            {filteredDrugs.length === 0 && <p className="text-small text-neutral-400">Dori topilmadi</p>}
          </div>

          <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
            <span className="text-small text-neutral-500">Jami ({selectedItems.length} ta dori)</span>
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
            <h2 className="text-sm font-bold text-neutral-900">Tanlangan dorilarim</h2>
            <div className="mt-2 flex flex-col gap-2">
              {selectedItems.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl border border-neutral-100 px-3 py-2.5 text-sm"
                >
                  <span className="font-semibold text-neutral-900">{item.name}</span>
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
            <label className="text-label font-semibold text-neutral-500">Izoh (ixtiyoriy)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Masalan: yetkazib berish vaqti bo'yicha eslatma..."
              rows={3}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-body focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className={labelClass}>Retsept</label>
            <label className="mt-1 flex h-12 w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-neutral-200 px-3 text-sm text-neutral-500 hover:border-primary/40">
              <Upload size={16} className="shrink-0 text-neutral-400" />
              <span className="min-w-0 flex-1 truncate">
                {prescriptionFileName || "Retsept fotosini yuklang (JPG, PNG yoki PDF)"}
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setPrescriptionFileName(e.target.files?.[0]?.name ?? "")}
                className="hidden"
              />
            </label>
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
