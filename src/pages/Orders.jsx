import { useState } from "react";
import { Activity, MapPin, Clock, User, Phone, MessageSquare, RotateCcw, Star, XCircle, ImagePlus } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useOrders } from "../store/OrdersContext";
import { useAuth } from "../store/AuthContext";
import { useToast } from "../store/ToastContext";

function reorderPayload(o, user) {
  return {
    type: o.type,
    title: o.title,
    items: o.items,
    patientName: user ? `${user.firstName} ${user.lastName}` : o.patientName,
    patientAge: user?.age ?? o.patientAge,
    address: o.address,
    time: o.time,
    price: o.price,
    hours: o.hours,
    paid: false,
    provider: o.provider,
    providerPhone: o.providerPhone ?? null,
    providerType: o.providerType,
  };
}

function orderTitle(o) {
  return o.items ? o.items.map((item) => item.title).join(", ") : o.title;
}

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

const activeBadge = {
  yangi: { tone: "info", label: "Tasdiqlash kutilmoqda" },
  "qabul qilingan": { tone: "info", label: "Rejalashtirildi" },
  yolda: { tone: "warning", label: "Yo'lda" },
};

const tabs = [
  { id: "aktiv", label: "Aktiv" },
  { id: "tugallangan", label: "Tugallangan" },
  { id: "bekor", label: "Bekor qilindi" },
];

export default function Orders() {
  const [tab, setTab] = useState("aktiv");
  const { active, completed, cancelled, addOrder, cancelOrder, canFreeCancel, rateOrder } = useOrders();
  const { user } = useAuth();
  const { notify } = useToast();

  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [ratingOpenId, setRatingOpenId] = useState(null);
  const [draftStars, setDraftStars] = useState(0);
  const [draftComment, setDraftComment] = useState("");
  const [draftPhoto, setDraftPhoto] = useState(null);

  function reorder(o) {
    addOrder(reorderPayload(o, user));
    setTab("aktiv");
    notify(`${orderTitle(o)} qayta buyurtma qilindi`);
  }

  function confirmCancel(o) {
    const refund = canFreeCancel(o);
    cancelOrder(
      o.id,
      refund ? "Foydalanuvchi tomonidan bekor qilindi (pul qaytarildi)" : "Foydalanuvchi tomonidan bekor qilindi (to'lov qaytarilmadi)"
    );
    notify(refund ? "Bekor qilindi — pulingiz to'liq qaytariladi" : "Bekor qilindi — 24 soatlik muddat o'tgani uchun to'lov qaytarilmaydi");
    setConfirmCancelId(null);
  }

  function openRating(o) {
    setRatingOpenId(o.id);
    setDraftStars(o.rating ?? 0);
    setDraftComment(o.comment ?? "");
    setDraftPhoto(o.photo ?? null);
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraftPhoto(reader.result);
    reader.readAsDataURL(file);
  }

  function saveRating(o) {
    if (!draftStars) {
      notify("Yulduzlarni tanlang");
      return;
    }
    rateOrder(o.id, draftStars, { comment: draftComment.trim() || undefined, photo: draftPhoto || undefined });
    notify("Baholaganingiz uchun rahmat!");
    setRatingOpenId(null);
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader title="Buyurtmalar" subtitle="Barcha buyurtmalaringiz shu yerda" />

      <div className="px-4">
        <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`h-10 flex-1 rounded-lg text-sm font-semibold transition ${
                tab === t.id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4">
        {tab === "aktiv" &&
          (active.length ? (
            active.map((o) => {
              const badge = activeBadge[o.status] ?? activeBadge.yangi;
              return (
                <Card
                  key={o.id}
                  className={`border-neutral-100 border-l-4 ${o.status === "yolda" ? "border-l-warning" : "border-l-secondary"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-label font-medium text-neutral-400">{o.id}</span>
                    <Badge tone={badge.tone}>{badge.label}</Badge>
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
                    <h3 className="mt-2 flex items-center gap-1.5 text-base font-semibold text-neutral-900">
                      <Activity size={15} className="text-warning" /> {o.title}
                    </h3>
                  )}
                  <div className="mt-2 flex flex-col gap-1 text-sm text-neutral-600">
                    {o.provider ? (
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-neutral-400" /> {o.provider}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-neutral-400">
                        <User size={14} /> Xizmat ko'rsatuvchi qidirilmoqda...
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-neutral-400" /> {o.address}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-neutral-400" /> {o.time}
                      {o.hours && ` (${o.hours} soat)`}
                    </span>
                  </div>
                  {o.note && <p className="mt-1 text-label text-neutral-500">"{o.note}"</p>}
                  <p className="mt-2 text-base font-semibold text-neutral-900">
                    {formatSom(o.price)}{" "}
                    <span className="text-xs font-normal text-neutral-400">
                      ({o.paid ? "to'landi" : "to'lovga tayyor"})
                    </span>
                  </p>
                  {o.provider && (
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
                        onClick={() => notify(`${o.provider} bilan qo'ng'iroq: tez orada mavjud bo'ladi`)}
                        className="h-10 flex-1 text-sm"
                      >
                        <Phone size={14} /> Qo'ng'iroq
                      </Button>
                    </div>
                  )}
                  {confirmCancelId === o.id ? (
                    <div className="mt-2 flex flex-col gap-2 rounded-xl border border-error/20 bg-error/5 p-3">
                      <p className="text-label text-neutral-600">
                        {canFreeCancel(o)
                          ? "So'nggi 24 soat ichida bekor qilyapsiz — to'lovingiz to'liq qaytariladi."
                          : "24 soatlik bepul bekor qilish muddati tugagan — to'lov qaytarilmaydi."}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="danger"
                          onClick={() => confirmCancel(o)}
                          className="h-9 flex-1 justify-center text-xs"
                        >
                          Ha, bekor qilish
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setConfirmCancelId(null)}
                          className="h-9 flex-1 text-xs"
                        >
                          Orqaga
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmCancelId(o.id)}
                      className="mt-2 text-xs font-medium text-error hover:underline"
                    >
                      Buyurtmani bekor qilish
                    </button>
                  )}
                </Card>
              );
            })
          ) : (
            <EmptyState text="Aktiv buyurtmalar yo'q" />
          ))}

        {tab === "tugallangan" &&
          (completed.length ? (
            completed.map((o) => (
              <Card key={o.id} className="border-neutral-100 border-l-4 border-l-primary">
                <div className="flex items-center justify-between">
                  <span className="text-label font-medium text-neutral-400">{o.id}</span>
                  <Badge tone="success">Tayyor</Badge>
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
                  <h3 className="mt-2 flex items-center gap-1.5 text-base font-semibold text-neutral-900">
                    <Activity size={15} className="text-primary" /> {o.title}
                  </h3>
                )}
                <div className="mt-2 flex flex-col gap-1 text-sm text-neutral-600">
                  <span className="flex items-center gap-1.5">
                    <User size={14} className="text-neutral-400" /> {o.provider}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-neutral-400" /> {o.address}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-neutral-400" /> {o.time}
                  </span>
                </div>
                {ratingOpenId === o.id ? (
                  <div className="mt-2 flex flex-col gap-2 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" onClick={() => setDraftStars(n)} aria-label={`${n} yulduz`}>
                          <Star size={20} className={n <= draftStars ? "fill-warning text-warning" : "text-neutral-300"} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={draftComment}
                      onChange={(e) => setDraftComment(e.target.value)}
                      placeholder="Izoh qoldiring (ixtiyoriy)"
                      rows={2}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex items-center gap-2">
                      <label className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 hover:bg-white">
                        <ImagePlus size={14} /> Rasm qo'shish
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      </label>
                      {draftPhoto && <img src={draftPhoto} alt="" className="h-9 w-9 rounded-lg object-cover" />}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => saveRating(o)} className="h-9 flex-1 text-xs">
                        Saqlash
                      </Button>
                      <Button variant="secondary" onClick={() => setRatingOpenId(null)} className="h-9 flex-1 text-xs">
                        Bekor qilish
                      </Button>
                    </div>
                  </div>
                ) : o.rating ? (
                  <button type="button" onClick={() => openRating(o)} className="mt-2 flex flex-col items-start gap-1.5">
                    <span className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={16} className={n <= o.rating ? "fill-warning text-warning" : "text-neutral-200"} />
                      ))}
                    </span>
                    {o.comment && <span className="text-label italic text-neutral-500">"{o.comment}"</span>}
                    {o.photo && <img src={o.photo} alt="" className="h-14 w-14 rounded-lg object-cover" />}
                  </button>
                ) : (
                  <Button variant="secondary" onClick={() => openRating(o)} className="mt-2 h-9 w-full text-xs">
                    <Star size={13} /> Baholash
                  </Button>
                )}
                <p className="mt-2 text-base font-semibold text-neutral-900">
                  {formatSom(o.price)} <span className="text-xs font-normal text-neutral-400">(to'landi)</span>
                </p>
                <Button onClick={() => reorder(o)} variant="secondary" className="mt-3 h-10 w-full text-sm">
                  <RotateCcw size={14} /> Qayta buyurtma
                </Button>
              </Card>
            ))
          ) : (
            <EmptyState text="Tugallangan buyurtmalar yo'q" />
          ))}

        {tab === "bekor" &&
          (cancelled.length ? (
            cancelled.map((o) => (
              <Card key={o.id} className="border-neutral-100 border-l-4 border-l-error">
                <div className="flex items-center justify-between">
                  <span className="text-label font-medium text-neutral-400">{o.id}</span>
                  <Badge tone="error">
                    <XCircle size={12} className="mr-1" /> Bekor qilindi
                  </Badge>
                </div>
                {o.items ? (
                  <ul className="mt-2 flex flex-col gap-0.5">
                    {o.items.map((item) => (
                      <li key={item.title} className="text-base font-semibold text-neutral-900">
                        {item.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <h3 className="mt-2 flex items-center gap-1.5 text-base font-semibold text-neutral-900">
                    <Activity size={15} className="text-error" /> {o.title}
                  </h3>
                )}
                <div className="mt-2 flex flex-col gap-1 text-sm text-neutral-600">
                  <span className="flex items-center gap-1.5">
                    <User size={14} className="text-neutral-400" /> {o.provider}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-neutral-400" /> {o.address}
                  </span>
                </div>
                <p className="mt-1 text-label text-neutral-400">{o.reason}</p>
                <p className="mt-2 text-base font-semibold text-neutral-900">{formatSom(o.price)}</p>
                <Button onClick={() => reorder(o)} variant="secondary" className="mt-3 h-10 w-full text-sm">
                  <RotateCcw size={14} /> Qayta buyurtma
                </Button>
              </Card>
            ))
          ) : (
            <EmptyState text="Bekor qilingan buyurtmalar yo'q" />
          ))}
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
