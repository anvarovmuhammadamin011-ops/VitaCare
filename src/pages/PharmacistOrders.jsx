import { useState } from "react";
import { MapPin, Clock, User, Phone, MessageSquare, Check, X, FileText, Truck, Star, PackageCheck } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { usePharmacy } from "../store/PharmacyContext";
import { useToast } from "../store/ToastContext";
import { useNotifications } from "../store/NotificationsContext";

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

const tabs = [
  { id: "yangi", label: "Yangi" },
  { id: "faol", label: "Faol" },
  { id: "tugallandi", label: "Tugallandi" },
  { id: "bekor qilindi", label: "Bekor qilindi" },
];

export default function PharmacistOrders() {
  const [tab, setTab] = useState("yangi");
  const { incoming, active, completed, cancelled, acceptOrder, rejectOrder, dispatchOrder, deliverOrder } = usePharmacy();
  const { notify } = useToast();
  const { pushNotification } = useNotifications();

  const listByTab = { yangi: incoming, faol: active, tugallandi: completed, "bekor qilindi": cancelled };
  const list = listByTab[tab];

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader title="Zakazlar" subtitle="Kelgan buyurtmalarni ko'rib chiqing" />

      <div className="px-4">
        <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`h-10 flex-1 rounded-lg text-xs font-semibold transition ${
                tab === t.id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4">
        {list.length ? (
          list.map((o) => (
            <Card key={o.id} className="border-neutral-100">
              <div className="flex items-center justify-between">
                <span className="text-label font-medium text-neutral-400">#{o.id}</span>
                <div className="flex items-center gap-1.5">
                  {o.hasPrescription && (
                    <span className="flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] font-bold text-secondary">
                      <FileText size={11} /> Retsept
                    </span>
                  )}
                  {o.status === "tayyorlanmoqda" && <Badge tone="info">Tayyorlanmoqda</Badge>}
                  {o.status === "yolda" && <Badge tone="warning">Yo'lda</Badge>}
                  {o.status === "tugallandi" && <Badge tone="success">Tugallandi</Badge>}
                  {o.status === "bekor qilindi" && <Badge tone="error">Bekor qilindi</Badge>}
                </div>
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
                <User size={14} className="text-neutral-400" /> {o.patientName} ({o.patientAge} yoshli)
              </div>

              <ul className="mt-2 flex flex-col gap-1 text-sm text-neutral-600">
                {o.items.map((item) => (
                  <li key={item.name}>
                    {item.name} <span className="text-neutral-400">× {item.qty}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex flex-col gap-1 text-sm text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-neutral-400" /> {o.address}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-neutral-400" /> {o.time}
                </span>
              </div>

              {o.documentRequired && (
                <p className="mt-2 text-label text-warning">Hujjat talab qilinadi (pasport)</p>
              )}

              {o.status === "yolda" && o.deliveryBoy && (
                <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-secondary/5 px-3 py-2 text-sm text-secondary">
                  <Truck size={14} /> {o.deliveryBoy} · {o.eta} qoldi
                </div>
              )}

              <p className="mt-2 text-base font-semibold text-neutral-900">{formatSom(o.total)}</p>

              {tab === "yangi" && (
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => {
                      acceptOrder(o.id);
                      notify(`#${o.id} buyurtma qabul qilindi`);
                      pushNotification(o.patientName, `#${o.id} buyurtmangiz qabul qilindi — tayyorlanmoqda`);
                    }}
                    className="h-10 flex-1 text-sm"
                  >
                    <Check size={14} /> Qabul qilish
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      rejectOrder(o.id);
                      notify(`#${o.id} buyurtma bekor qilindi`);
                      pushNotification(o.patientName, `#${o.id} buyurtmangiz bekor qilindi`);
                    }}
                    className="h-10 flex-1 text-sm"
                  >
                    <X size={14} /> Bekor qilish
                  </Button>
                </div>
              )}

              {tab === "faol" && (
                <>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => notify("Xabarlar tez orada mavjud bo'ladi")}
                      className="h-10 flex-1 text-sm"
                    >
                      <MessageSquare size={14} /> Chat
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => notify(`${o.patientName} bilan qo'ng'iroq: tez orada mavjud bo'ladi`)}
                      className="h-10 text-sm"
                    >
                      <Phone size={14} />
                    </Button>
                  </div>
                  {o.status === "tayyorlanmoqda" ? (
                    <Button
                      onClick={() => {
                        const { deliveryBoy, eta } = dispatchOrder(o.id);
                        notify("Tayyorlash tugallandi — delivery yubordi");
                        pushNotification(o.patientName, `${deliveryBoy} yo'lda — ${eta} qoldi`);
                      }}
                      className="mt-2 h-10 w-full text-sm"
                    >
                      <PackageCheck size={14} /> Tayyorlash tugallandi
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        deliverOrder(o.id);
                        notify("Buyurtma yetkazib berildi — daromad hisobingizga qo'shildi");
                        pushNotification(o.patientName, "Buyurtmangiz yetkazib berildi!");
                      }}
                      className="mt-2 h-10 w-full text-sm"
                    >
                      <Check size={14} /> Yetkazib berildi
                    </Button>
                  )}
                </>
              )}

              {tab === "tugallandi" && o.rating && (
                <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
                  <span className="flex gap-0.5">
                    {Array.from({ length: o.rating }).map((_, i) => (
                      <Star key={i} size={13} className="fill-warning text-warning" />
                    ))}
                  </span>
                  {o.comment && <span className="italic text-neutral-500">"{o.comment}"</span>}
                  {o.photo && <img src={o.photo} alt="" className="h-8 w-8 rounded-md object-cover" />}
                </div>
              )}

              {tab === "bekor qilindi" && o.reason && (
                <p className="mt-1 text-label text-neutral-400">{o.reason}</p>
              )}
            </Card>
          ))
        ) : (
          <EmptyState text="Bu bo'limda buyurtmalar yo'q" />
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-card border border-dashed border-neutral-200 py-12 text-center text-small text-neutral-400">
      {text}
    </div>
  );
}
