import { useState } from "react";
import { Ban, Clock, MapPin, Pill as PillIcon, Stethoscope, User } from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Sheet from "../../components/ui/Sheet";
import { useAuth } from "../../store/AuthContext";
import { useOrders } from "../../store/OrdersContext";
import { usePharmacy } from "../../store/PharmacyContext";
import { useActivityLog } from "../../store/ActivityLogContext";
import { useToast } from "../../store/ToastContext";
import { canAccess } from "../../utils/adminPermissions";

function formatSom(n) {
  return `${(n ?? 0).toLocaleString("uz-UZ")} so'm`;
}

const statusBadge = {
  yangi: { tone: "info", label: "Yangi" },
  "qabul qilingan": { tone: "info", label: "Rejalashtirildi" },
  tayyorlanmoqda: { tone: "info", label: "Tayyorlanmoqda" },
  yolda: { tone: "warning", label: "Yo'lda" },
  tugallandi: { tone: "success", label: "Tugallandi" },
  "bekor qilindi": { tone: "error", label: "Bekor qilindi" },
};

const statusFilters = [
  { id: "faol", label: "Faol", match: (s) => !["tugallandi", "bekor qilindi"].includes(s) },
  { id: "tugallandi", label: "Tugallangan", match: (s) => s === "tugallandi" },
  { id: "bekor qilindi", label: "Bekor qilindi", match: (s) => s === "bekor qilindi" },
  { id: "barchasi", label: "Barchasi", match: () => true },
];

const typeFilters = [
  { id: "barchasi", label: "Barchasi" },
  { id: "xizmat", label: "Xizmat" },
  { id: "dorixona", label: "Dorixona" },
];

export default function AdminBookings() {
  const { user: admin } = useAuth();
  const { orders, cancelOrder } = useOrders();
  const { orders: pharmacyOrders, rejectOrder: rejectPharmacyOrder } = usePharmacy();
  const { logActivity } = useActivityLog();
  const { notify } = useToast();

  const [statusFilter, setStatusFilter] = useState("faol");
  const [typeFilter, setTypeFilter] = useState("barchasi");
  const [selected, setSelected] = useState(null);

  const canAct = canAccess(admin.adminLevel, "bookingActions");

  const combined = [
    ...orders.map((o) => ({
      kind: "xizmat",
      id: o.id,
      patientName: o.patientName,
      counterparty: o.provider ?? "Xizmat ko'rsatuvchi qidirilmoqda...",
      title: o.items ? o.items.map((i) => i.title).join(", ") : o.title,
      amount: o.price,
      status: o.status,
      time: o.time,
      raw: o,
    })),
    ...pharmacyOrders.map((o) => ({
      kind: "dorixona",
      id: o.id,
      patientName: o.patientName,
      counterparty: o.hasPrescription ? "Retsept zakaz" : "Oddiy zakaz",
      title: o.items.map((i) => `${i.name} x${i.qty}`).join(", "),
      amount: o.total,
      status: o.status,
      time: o.time,
      raw: o,
    })),
  ];

  const activeStatusFilter = statusFilters.find((f) => f.id === statusFilter);
  const filtered = combined.filter(
    (b) => activeStatusFilter.match(b.status) && (typeFilter === "barchasi" || b.kind === typeFilter)
  );

  function log(action) {
    logActivity(`${admin.firstName} ${admin.lastName}`, action);
  }

  function handleCancel(b) {
    if (b.kind === "xizmat") cancelOrder(b.id, "Admin tomonidan bekor qilindi");
    else rejectPharmacyOrder(b.id, "Admin tomonidan bekor qilindi");
    log(`Buyurtma #${b.id} bekor qilindi`);
    notify("Buyurtma bekor qilindi");
    setSelected(null);
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      <header className="px-4 pb-2 pt-6">
        <h1 className="text-h2 font-bold text-neutral-900">Buyurtmalar</h1>
        <p className="mt-1 text-small text-neutral-500">Barcha buyurtmalarni kuzatib boring</p>
      </header>

      <div className="flex flex-col gap-2 px-4">
        <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`h-9 flex-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === f.id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {typeFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={`h-8 rounded-full border px-3 text-xs font-semibold transition ${
                typeFilter === f.id
                  ? "border-primary bg-primary/10 text-primary-dark"
                  : "border-neutral-200 text-neutral-500"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4">
        {filtered.length ? (
          filtered.map((b) => {
            const badge = statusBadge[b.status] ?? statusBadge.yangi;
            return (
              <button
                key={`${b.kind}-${b.id}`}
                onClick={() => setSelected(b)}
                className="flex w-full flex-col gap-2 rounded-card border border-neutral-200 bg-white p-4 text-left transition hover:border-primary/40 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-label font-medium text-neutral-400">
                    {b.kind === "xizmat" ? <Stethoscope size={12} /> : <PillIcon size={12} />} #{b.id}
                  </span>
                  <Badge tone={badge.tone}>{badge.label}</Badge>
                </div>
                <h3 className="text-sm font-bold text-neutral-900">{b.title}</h3>
                <div className="flex flex-col gap-0.5 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <User size={11} /> {b.patientName} · {b.counterparty}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {b.time}
                  </span>
                </div>
                <p className="text-sm font-semibold text-neutral-900">{formatSom(b.amount)}</p>
              </button>
            );
          })
        ) : (
          <div className="rounded-card border border-dashed border-neutral-200 py-12 text-center text-small text-neutral-400">
            Bu bo'limda buyurtmalar yo'q
          </div>
        )}
      </div>

      <Sheet open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `Buyurtma #${selected.id}` : ""}>
        {selected && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <Badge tone={(statusBadge[selected.status] ?? statusBadge.yangi).tone}>
                {(statusBadge[selected.status] ?? statusBadge.yangi).label}
              </Badge>
              <span className="text-xs text-neutral-400">{selected.kind === "xizmat" ? "Tibbiy xizmat" : "Dorixona"}</span>
            </div>
            <p className="font-semibold text-neutral-900">{selected.title}</p>
            <dl className="flex flex-col gap-1.5 text-neutral-600">
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-neutral-400" /> {selected.patientName}
              </span>
              <span className="flex items-center gap-1.5">
                {selected.kind === "xizmat" ? <Stethoscope size={13} className="text-neutral-400" /> : <PillIcon size={13} className="text-neutral-400" />}
                {selected.counterparty}
              </span>
              {selected.raw.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-neutral-400" /> {selected.raw.address}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-neutral-400" /> {selected.time}
              </span>
            </dl>
            <p className="border-t border-neutral-100 pt-2 text-base font-bold text-neutral-900">{formatSom(selected.amount)}</p>

            {!["tugallandi", "bekor qilindi"].includes(selected.status) &&
              (canAct ? (
                <Button variant="danger" onClick={() => handleCancel(selected)} className="w-full justify-center text-sm">
                  <Ban size={14} /> Buyurtmani bekor qilish
                </Button>
              ) : (
                <p className="text-center text-xs text-neutral-400">Sizning ruxsat darajangiz bu amalga ega emas</p>
              ))}
          </div>
        )}
      </Sheet>
    </div>
  );
}
