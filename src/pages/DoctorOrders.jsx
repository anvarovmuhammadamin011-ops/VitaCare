import { useState } from "react";
import { MapPin, Clock, User, Phone, MessageSquare, Check, X, Navigation, Star } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useDoctor } from "../store/DoctorContext";
import { useToast } from "../store/ToastContext";

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

const tabs = [
  { id: "yangi", label: "Yangi" },
  { id: "faol", label: "Faol" },
  { id: "tugallandi", label: "Tugallandi" },
  { id: "bekor qilindi", label: "Bekor qilindi" },
];

export default function DoctorOrders() {
  const [tab, setTab] = useState("yangi");
  const { incoming, active, completed, cancelled, acceptOrder, rejectOrder, startTrip, completeOrder } = useDoctor();
  const { notify } = useToast();

  const listByTab = { yangi: incoming, faol: active, tugallandi: completed, "bekor qilindi": cancelled };
  const list = listByTab[tab];

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader title="Buyurtmalar" subtitle="Kelgan so'rovlarni ko'rib chiqing" />

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
                {o.status === "yolda" && <Badge tone="warning">Yo'lda</Badge>}
                {o.status === "qabul qilingan" && <Badge tone="info">Kutib olamiz</Badge>}
                {o.status === "tugallandi" && <Badge tone="success">Tugallandi</Badge>}
                {o.status === "bekor qilindi" && <Badge tone="error">Bekor qilindi</Badge>}
              </div>
              {o.items ? (
                <ul className="mt-2 flex flex-col gap-0.5">
                  {o.items.map((item) => (
                    <li key={item.title} className="text-base font-semibold text-neutral-900">
                      {item.title}{" "}
                      <span className="text-sm font-normal text-neutral-500">
                        · {item.duration} · {formatSom(item.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <h3 className="mt-2 text-base font-semibold text-neutral-900">{o.title}</h3>
              )}
              <div className="mt-2 flex flex-col gap-1 text-sm text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <User size={14} className="text-neutral-400" /> {o.patientName} ({o.patientAge} yoshli)
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-neutral-400" /> {o.address}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-neutral-400" /> {o.time}
                  {o.hours && ` (${o.hours} soat)`}
                </span>
              </div>
              {o.note && <p className="mt-2 text-label text-error">{o.note}</p>}
              <p className="mt-2 text-base font-semibold text-neutral-900">{formatSom(o.price)}</p>

              {tab === "yangi" && (
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => {
                      acceptOrder(o.id);
                      notify(`${o.title ?? "Buyurtma"} qabul qilindi`);
                    }}
                    className="h-10 flex-1 text-sm"
                  >
                    <Check size={14} /> Qabul qilish
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      rejectOrder(o.id);
                      notify(`${o.title ?? "Buyurtma"} bekor qilindi`);
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
                  {o.status === "qabul qilingan" ? (
                    <Button
                      onClick={() => {
                        startTrip(o.id);
                        notify("Holat: Yo'lda deb belgilandi");
                      }}
                      className="mt-2 h-10 w-full text-sm"
                    >
                      <Navigation size={14} /> Yo'lga chiqdim
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        completeOrder(o.id);
                        notify("Xizmat yakunlandi — daromad hisobingizga qo'shildi");
                      }}
                      className="mt-2 h-10 w-full text-sm"
                    >
                      <Check size={14} /> Yetib keldim / Yakunlash
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
