import { useState } from "react";
import {
  Banknote,
  Bell,
  Building2,
  Camera,
  Check,
  Clock,
  Copy,
  FileText,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  Power,
  QrCode,
  ShieldCheck,
  Star,
  Trash2,
  Truck,
  Upload,
  Wallet,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Sheet from "../../components/ui/Sheet";
import Pill from "../../components/ui/Pill";
import MapPickerSheet from "../../components/MapPickerSheet";
import { Toggle, ToggleRow } from "../../components/ui/Toggle";
import IdentityForm from "../../components/profile/IdentityForm";
import { useAuth } from "../../store/AuthContext";
import { useProviderProfile } from "../../store/ProviderProfileContext";
import { useSettings } from "../../store/SettingsContext";
import { useActivityLog } from "../../store/ActivityLogContext";
import { usePharmacy } from "../../store/PharmacyContext";
import { useToast } from "../../store/ToastContext";
import { downloadJson } from "../../utils/exportData";

const inputClass =
  "mt-1 h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "text-label font-semibold text-neutral-500";
const tabs = [
  { id: "apteka", label: "Apteka" },
  { id: "litsenziya", label: "Litsenziya" },
  { id: "bank", label: "Bank" },
  { id: "filial", label: "Filiallar" },
  { id: "tolov", label: "To'lov" },
  { id: "sharh", label: "Sharh" },
];

function formatSom(n) {
  return `${(n ?? 0).toLocaleString("uz-UZ")} so'm`;
}

function maskCard(number) {
  const digits = (number ?? "").replace(/\s/g, "");
  if (digits.length < 4) return number;
  return `•••• ${digits.slice(-4)}`;
}

export default function PharmacistProfile() {
  const { user, logout: authLogout, updateProfile, requestAccountDeletion, cancelAccountDeletion } = useAuth();
  const provider = useProviderProfile();
  const { getSettings, updateSettings } = useSettings();
  const { logActivity, activityFor } = useActivityLog();
  const { completed, avgRating, replyToOrder } = usePharmacy();
  const { notify } = useToast();

  const [tab, setTab] = useState("apteka");
  const [sheet, setSheet] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState({});
  const [courierName, setCourierName] = useState("");

  const myName = user.pharmacyName ?? `${user.firstName} ${user.lastName}`;
  const p = provider.getProviderProfile(user.phone);
  const settings = getSettings(user.phone);

  function closeSheet() {
    setSheet(null);
  }

  function log(action) {
    logActivity(myName, action);
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatar: reader.result });
      log("Profil rasmi yangilandi");
    };
    reader.readAsDataURL(file);
  }

  function saveIdentity(fields) {
    updateProfile(fields);
    log("Shaxsiy ma'lumotlar tahrirlandi");
    notify("Ma'lumotlar saqlandi");
    closeSheet();
  }

  function saveLicense(fields) {
    provider.updateProviderProfile(user.phone, { license: fields });
    log("Litsenziya ma'lumotlari yangilandi");
    notify("Saqlandi");
    closeSheet();
  }

  function saveBranch(branch) {
    provider.addBranch(user.phone, branch);
    log(`Yangi filial qo'shildi: ${branch.name}`);
    notify("Filial qo'shildi");
    closeSheet();
  }

  function copyProfileLink() {
    const link = `${window.location.origin}/dorixona?apteka=${encodeURIComponent(user.phone)}`;
    navigator.clipboard
      ?.writeText(link)
      .then(() => {
        log("Profil havolasi nusxalandi");
        notify("Havola nusxalandi");
      })
      .catch(() => notify("Havolani nusxalab bo'lmadi — brauzer ruxsat bermadi"));
  }

  function handleExportData() {
    downloadJson(`vitacare-${user.phone.replace(/\D/g, "")}.json`, {
      account: { ...user, password: undefined },
      providerProfile: p,
      settings,
      completedOrders: completed,
      activity: activityFor(myName),
    });
    log("Ma'lumotlar yuklab olindi (GDPR)");
    notify("Ma'lumotlaringiz JSON fayl sifatida yuklandi");
  }

  function handleDeactivate() {
    updateProfile({ deactivated: true });
    log("Hisob faolsizlantirildi (30 kun)");
    notify("Hisobingiz faolsizlantirildi");
    setConfirmDeactivate(false);
  }

  function handleDeleteRequest() {
    requestAccountDeletion();
    log("Hisobni butunlay o'chirish so'ralindi (72 soat)");
    notify("Hisobingiz 72 soatdan so'ng o'chiriladi — bekor qilishingiz mumkin");
    setConfirmDelete(false);
  }

  function logout() {
    authLogout();
    notify("Hisobdan chiqdingiz");
  }

  const deletionHoursLeft = user.deletionRequestedAt
    ? Math.max(0, 72 - Math.floor((Date.now() - user.deletionRequestedAt) / 3600000))
    : null;

  const itemCounts = completed.reduce((acc, o) => {
    o.items.forEach((item) => {
      acc[item.name] = (acc[item.name] ?? 0) + item.qty;
    });
    return acc;
  }, {});
  const topDrug = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0];
  const uniquePatients = new Set(completed.map((o) => o.patientName)).size;

  return (
    <div className="flex flex-col gap-6 pb-6">
      <header className="px-4 pb-2 pt-6">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-primary text-lg font-bold text-white">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <Building2 size={24} />
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-white text-neutral-500 shadow ring-1 ring-neutral-200">
              <Camera size={12} />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="truncate text-h3 font-bold text-neutral-900">{user.pharmacyName}</h1>
              {user.verified && (
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-secondary text-white" title="Tasdiqlangan">
                  <Check size={12} />
                </span>
              )}
            </div>
            <p className="truncate text-small text-neutral-500">{user.pharmacyAddress}</p>
          </div>
          <button onClick={copyProfileLink} aria-label="Profilni ulashish" className="shrink-0 text-neutral-400 hover:text-primary">
            <Copy size={18} />
          </button>
        </div>
        {user.deactivated && (
          <div className="mt-3 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-xs font-semibold text-warning">
            Hisobingiz faolsizlantirilgan
          </div>
        )}
      </header>

      <div className="px-4">
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-neutral-100 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`h-10 shrink-0 rounded-lg px-3 text-xs font-semibold transition ${
                tab === t.id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "apteka" && (
        <div className="flex flex-col gap-4 px-4">
          <Card className="border-neutral-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900">Shaxsiy ma'lumot</h2>
              <button onClick={() => setSheet({ type: "shaxsiy" })} className="text-neutral-400 hover:text-primary">
                <Pencil size={15} />
              </button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Row label="Telefon" value={user.phone} />
              <Row label="Email" value={user.email ?? "—"} />
            </dl>
          </Card>

          <Card className="border-neutral-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900">Apteka ma'lumotlari</h2>
              <button onClick={() => setSheet({ type: "apteka" })} className="text-neutral-400 hover:text-primary">
                <Pencil size={15} />
              </button>
            </div>
            <dl className="mt-3 flex flex-col gap-2 text-sm">
              <Row label="Rasmiy nomi" value={user.pharmacyName} />
              <div>
                <dt className="text-neutral-500">Manzil</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-neutral-900">
                  <MapPin size={13} className="shrink-0 text-primary" /> {user.pharmacyAddress}
                </dd>
              </div>
              <Row label="Website" value={p.contact.website || "—"} />
            </dl>
          </Card>

          <Card className="border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900">Ishlash soatlari</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Dush–Juma</label>
                <input
                  value={p.hours.weekday}
                  onChange={(e) => provider.updateNested(user.phone, "hours", { weekday: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Shan–Yak</label>
                <input
                  value={p.hours.weekend}
                  onChange={(e) => provider.updateNested(user.phone, "hours", { weekend: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-3">
              <label className={labelClass}>Bayramlarda</label>
              <input
                value={p.hours.holidayNote}
                onChange={(e) => provider.updateNested(user.phone, "hours", { holidayNote: e.target.value })}
                placeholder="Masalan: Yopiq"
                className={inputClass}
              />
            </div>
          </Card>
        </div>
      )}

      {tab === "litsenziya" && (
        <div className="flex flex-col gap-4 px-4">
          <Card className="border-neutral-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900">Davlat litsenziyasi</h2>
              <button onClick={() => setSheet({ type: "litsenziya" })} className="text-neutral-400 hover:text-primary">
                <Pencil size={15} />
              </button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Row label="Raqami" value={p.license.number || "—"} />
              <Row label="Bergan organ" value={p.license.issuer || "Sog'liq Vazirligi"} />
              <Row label="Muddati" value={p.license.expiry || "—"} />
              <Row label="Fayl" value={p.license.fileName || user.certificateFileName || "—"} />
            </dl>
          </Card>

          <Card className="border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900">Soliq registratsiyasi</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Row label="TIN raqami" value={p.bank.tin || "—"} />
            </dl>
            <button onClick={() => setSheet({ type: "bank" })} className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary-dark">
              <Pencil size={12} /> Tahrirlash
            </button>
          </Card>

          <Card className="border-neutral-100">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <QrCode size={15} className="text-primary" /> Retsept haqidagi ruxsat
            </h2>
            <div className="mt-3 flex flex-col gap-2.5">
              <ToggleRow
                label="Retsept bo'yicha dori sotish ruxsati"
                checked={p.prescriptionAllowed}
                onChange={(v) => provider.updateProviderProfile(user.phone, { prescriptionAllowed: v })}
              />
              <ToggleRow
                label="QR kodli retsept tizimi"
                checked={p.drugAlerts.qrScanner}
                onChange={(v) => provider.updateNested(user.phone, "drugAlerts", { qrScanner: v })}
              />
            </div>
          </Card>
        </div>
      )}

      {tab === "bank" && (
        <div className="flex flex-col gap-4 px-4">
          <Card className="border-neutral-100">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                <Banknote size={15} className="text-primary" /> To'lov rekvizitlari
              </h2>
              <button onClick={() => setSheet({ type: "bank" })} className="text-neutral-400 hover:text-primary">
                <Pencil size={15} />
              </button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Row label="Karta raqami" value={maskCard(user.bankCard)} />
              <Row label="IBAN" value={p.bank.iban || "—"} />
              <Row label="Bank nomi" value={p.bank.bankName || "—"} />
            </dl>
          </Card>

          <Card className="border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900">Oylik hisobi</h2>
            <dl className="mt-3 flex flex-col gap-2 text-sm">
              <Row label="Retsept zakazlari (5% komissiya)" value={`${completed.filter((o) => o.hasPrescription).length} ta`} />
              <Row label="Oddiy zakazlar (3% komissiya)" value={`${completed.filter((o) => !o.hasPrescription).length} ta`} />
              <Row label="Sof daromad" value={formatSom(completed.reduce((s, o) => s + o.total, 0))} />
            </dl>
            <p className="mt-2 text-xs text-neutral-400">To'liq hisobot "Pul" bo'limida</p>
          </Card>

          <Card className="border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900">Bonuslar</h2>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-neutral-600">
              <li>{avgRating >= 4.5 ? "✓" : "—"} Reyting bonusi (4.5+ reyting)</li>
              <li>✓ Yetkazib berish tezligi bonusi (ETA ichida yetkazilgan zakazlar uchun)</li>
            </ul>
          </Card>
        </div>
      )}

      {tab === "filial" && (
        <div className="flex flex-col gap-3 px-4">
          <Card className="border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <h3 className="text-sm font-bold text-neutral-900">{user.pharmacyName} (Bosh filial)</h3>
            </div>
            <p className="mt-1 text-sm text-neutral-600">{user.pharmacyAddress}</p>
          </Card>

          {p.branches.map((b) => (
            <Card key={b.id} className="border-neutral-100">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-neutral-900">{b.name}</h3>
                  <p className="mt-1 text-sm text-neutral-600">{b.address}</p>
                  {b.hours && <p className="mt-0.5 text-xs text-neutral-400">{b.hours}</p>}
                </div>
                <button onClick={() => provider.removeBranch(user.phone, b.id)} className="shrink-0 text-neutral-400 hover:text-error">
                  <Trash2 size={15} />
                </button>
              </div>
            </Card>
          ))}

          <Button variant="secondary" onClick={() => setSheet({ type: "filial" })} className="h-11 w-full justify-center text-sm">
            <Plus size={15} /> Yangi filial qo'shish
          </Button>
        </div>
      )}

      {tab === "tolov" && (
        <div className="flex flex-col gap-4 px-4">
          <Card className="border-neutral-100">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <Wallet size={15} className="text-secondary" /> Elektron hamyon
            </h2>
            <div className="mt-3 flex gap-2">
              {["Click", "Payme", "Apelsin"].map((w) => (
                <Pill
                  key={w}
                  active={(p.eWallets ?? []).includes(w)}
                  onClick={() => {
                    const cur = p.eWallets ?? [];
                    const next = cur.includes(w) ? cur.filter((x) => x !== w) : [...cur, w];
                    provider.updateProviderProfile(user.phone, { eWallets: next });
                  }}
                >
                  {w}
                </Pill>
              ))}
            </div>
          </Card>

          <Card className="border-neutral-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900">Naqd pul qabul qilish</h2>
              <Toggle checked={p.acceptsCash} onChange={(v) => provider.updateProviderProfile(user.phone, { acceptsCash: v })} />
            </div>
            <p className="mt-1 text-xs text-neutral-400">Bemor kuryerga naqd to'laydi, pul aptekaga o'tkaziladi</p>
          </Card>
        </div>
      )}

      {tab === "sharh" && (
        <div className="flex flex-col gap-4 px-4">
          <Card className="border-neutral-100">
            <div className="grid grid-cols-3 divide-x divide-neutral-100 text-center">
              <div>
                <p className="text-lg font-bold text-neutral-900">{avgRating ?? "—"}</p>
                <p className="text-[11px] text-neutral-400">O'rtacha reyting</p>
              </div>
              <div>
                <p className="text-lg font-bold text-neutral-900">{uniquePatients}</p>
                <p className="text-[11px] text-neutral-400">Jami bemor</p>
              </div>
              <div>
                <p className="truncate text-sm font-bold text-neutral-900">{topDrug ? topDrug[0] : "—"}</p>
                <p className="text-[11px] text-neutral-400">Eng ko'p so'ralgan</p>
              </div>
            </div>
          </Card>

          {completed
            .filter((o) => o.rating)
            .map((o) => (
              <Card key={o.id} className="border-neutral-100">
                <div className="flex items-center justify-between">
                  <span className="flex gap-0.5">
                    {Array.from({ length: o.rating }).map((_, i) => (
                      <Star key={i} size={14} className="fill-warning text-warning" />
                    ))}
                  </span>
                  <span className="text-xs text-neutral-400">{o.patientName}</span>
                </div>
                {o.comment && <p className="mt-1.5 text-sm text-neutral-700">"{o.comment}"</p>}
                {o.providerReply ? (
                  <div className="mt-2 rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                    <span className="font-semibold text-neutral-800">Javobingiz: </span>
                    {o.providerReply}
                  </div>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={replyDraft[o.id] ?? ""}
                      onChange={(e) => setReplyDraft((cur) => ({ ...cur, [o.id]: e.target.value }))}
                      placeholder="Javob yozing..."
                      className="h-9 flex-1 rounded-lg border border-neutral-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      onClick={() => {
                        if (!replyDraft[o.id]?.trim()) return;
                        replyToOrder(o.id, replyDraft[o.id].trim());
                        log(`Sharhga javob yozildi: ${o.id}`);
                        notify("Javob yuborildi");
                      }}
                      className="h-9 px-3 text-xs"
                    >
                      Yuborish
                    </Button>
                  </div>
                )}
              </Card>
            ))}
        </div>
      )}

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Bell size={15} className="text-secondary" /> Notifikatsiya
          </h2>
          <div className="mt-3 flex flex-col gap-2.5">
            <ToggleRow
              label="Yangi retsept order (Push)"
              checked={settings.notifications.push}
              onChange={(v) => updateSettings(user.phone, { notifications: { ...settings.notifications, push: v } })}
            />
            <ToggleRow
              label="Dori tayyorlandi (SMS bemorga)"
              checked={settings.notifications.sms}
              onChange={(v) => updateSettings(user.phone, { notifications: { ...settings.notifications, sms: v } })}
            />
            <ToggleRow
              label="Reyting alarmasi"
              checked={settings.notifications.ratingAlerts ?? true}
              onChange={(v) => updateSettings(user.phone, { notifications: { ...settings.notifications, ratingAlerts: v } })}
            />
          </div>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Package size={15} className="text-neutral-500" /> Dorilar boshqarish
          </h2>
          <div className="mt-3 flex flex-col gap-2.5">
            <ToggleRow
              label="Retsept tekshirish avtomatik"
              checked={p.drugAlerts.autoVerify}
              onChange={(v) => provider.updateNested(user.phone, "drugAlerts", { autoVerify: v })}
            />
            <ToggleRow
              label="Muddati tugayotgan dorilar ogohlantirishi"
              checked={p.drugAlerts.expiryWarnings}
              onChange={(v) => provider.updateNested(user.phone, "drugAlerts", { expiryWarnings: v })}
            />
          </div>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Truck size={15} className="text-neutral-500" /> Yetkazib berish
          </h2>
          <div className="mt-3">
            <label className={labelClass}>Standart vaqt</label>
            <div className="mt-1.5 flex gap-2">
              {["15 daqiqa", "30 daqiqa", "60 daqiqa"].map((eta) => (
                <Pill key={eta} active={p.delivery.defaultEta === eta} onClick={() => provider.updateNested(user.phone, "delivery", { defaultEta: eta })}>
                  {eta}
                </Pill>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <label className={labelClass}>Yetkazuvchilar</label>
            <ul className="mt-1.5 flex flex-col gap-1.5">
              {p.delivery.couriers.map((c) => (
                <li key={c} className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-1.5 text-sm">
                  {c}
                  <button onClick={() => provider.removeCourier(user.phone, c)} className="text-neutral-400 hover:text-error">
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2">
              <input
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                placeholder="Masalan: Javohir (Motosikl)"
                className="h-10 flex-1 rounded-xl border border-neutral-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                onClick={() => {
                  provider.addCourier(user.phone, courierName);
                  setCourierName("");
                }}
                className="h-10 px-4 text-xs"
              >
                Qo'shish
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <ShieldCheck size={15} className="text-primary" /> 2FA / Xavfsizlik
            </h2>
            <Toggle checked={settings.twoFactorEnabled} onChange={(v) => updateSettings(user.phone, { twoFactorEnabled: v })} />
          </div>
          <button onClick={() => setActivityOpen(true)} className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary-dark">
            <Clock size={12} /> Faollik jurnalini ko'rish
          </button>
        </Card>
      </section>

      <section className="flex flex-col gap-2 px-4">
        <Button variant="secondary" onClick={handleExportData} className="h-11 w-full justify-center text-sm">
          <FileText size={15} /> Ma'lumotlarimni yuklab olish (JSON)
        </Button>

        {user.deactivated ? (
          <Button
            variant="secondary"
            onClick={() => {
              updateProfile({ deactivated: false });
              log("Hisob qayta faollashtirildi");
              notify("Hisobingiz qayta faollashtirildi");
            }}
            className="h-11 w-full justify-center text-sm"
          >
            <Power size={15} /> Hisobni qayta faollashtirish
          </Button>
        ) : confirmDeactivate ? (
          <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm">
            <p className="text-neutral-700">Hisobingiz vaqtincha yashiriladi (30 kun ichida qayta faollashtirish mumkin).</p>
            <div className="mt-2 flex gap-2">
              <Button onClick={handleDeactivate} className="h-9 flex-1 justify-center text-xs">
                Ha, faolsizlantirish
              </Button>
              <Button variant="secondary" onClick={() => setConfirmDeactivate(false)} className="h-9 flex-1 text-xs">
                Orqaga
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setConfirmDeactivate(true)} className="h-11 w-full justify-center text-sm">
            <Building2 size={15} /> Hisobni faolsizlantirish
          </Button>
        )}

        {user.deletionRequestedAt ? (
          <div className="rounded-xl border border-error/20 bg-error/5 p-3 text-sm">
            <p className="text-neutral-700">
              Hisobingiz <b>{deletionHoursLeft} soat</b>dan so'ng butunlay o'chiriladi.
            </p>
            <Button variant="secondary" onClick={cancelAccountDeletion} className="mt-2 h-9 w-full text-xs">
              Bekor qilish
            </Button>
          </div>
        ) : confirmDelete ? (
          <div className="rounded-xl border border-error/20 bg-error/5 p-3 text-sm">
            <p className="text-neutral-700">Hisobingiz 72 soatdan so'ng butunlay o'chiriladi. Davom etasizmi?</p>
            <div className="mt-2 flex gap-2">
              <Button variant="danger" onClick={handleDeleteRequest} className="h-9 flex-1 justify-center text-xs">
                Ha, o'chirish
              </Button>
              <Button variant="secondary" onClick={() => setConfirmDelete(false)} className="h-9 flex-1 text-xs">
                Orqaga
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="danger" onClick={() => setConfirmDelete(true)} className="w-full justify-center text-sm">
            <Trash2 size={15} /> Hisobni butunlay o'chirish
          </Button>
        )}

        <Button variant="danger" onClick={logout} className="w-full justify-center text-sm">
          <LogOut size={16} /> Hisobdan chiqish
        </Button>
      </section>

      <Sheet open={sheet?.type === "shaxsiy"} onClose={closeSheet} title="Shaxsiy ma'lumotlar">
        <IdentityForm user={user} onSave={saveIdentity} />
      </Sheet>

      <Sheet open={sheet?.type === "apteka"} onClose={closeSheet} title="Apteka ma'lumotlari">
        <PharmacyForm
          user={user}
          initial={p.contact}
          onSave={(fields) => {
            updateProfile({ pharmacyName: fields.pharmacyName, pharmacyAddress: fields.pharmacyAddress });
            provider.updateNested(user.phone, "contact", { website: fields.website });
            log("Apteka ma'lumotlari yangilandi");
            notify("Saqlandi");
            closeSheet();
          }}
        />
      </Sheet>

      <Sheet open={sheet?.type === "litsenziya"} onClose={closeSheet} title="Litsenziya">
        <LicenseForm initial={p.license} onSave={saveLicense} />
      </Sheet>

      <Sheet
        open={sheet?.type === "bank"}
        onClose={closeSheet}
        title="Bank / soliq rekvizitlari"
      >
        <BankForm
          user={user}
          initial={p.bank}
          onSave={(fields) => {
            updateProfile({ bankCard: fields.bankCard });
            provider.updateNested(user.phone, "bank", { iban: fields.iban, bankName: fields.bankName, tin: fields.tin });
            log("Bank rekvizitlari yangilandi");
            notify("Saqlandi");
            closeSheet();
          }}
        />
      </Sheet>

      <Sheet open={sheet?.type === "filial"} onClose={closeSheet} title="Yangi filial">
        <BranchForm onSave={saveBranch} />
      </Sheet>

      <Sheet open={activityOpen} onClose={() => setActivityOpen(false)} title="Faollik jurnali">
        {activityFor(myName).length ? (
          <ul className="flex flex-col gap-2">
            {activityFor(myName).map((a) => (
              <li key={a.id} className="rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-sm">
                <p className="text-neutral-800">{a.action}</p>
                <p className="mt-1 text-[11px] text-neutral-400">{new Date(a.createdAt).toLocaleString("uz-UZ")}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-small text-neutral-400">Hali faoliyat qayd etilmagan</p>
        )}
      </Sheet>

    </div>
  );
}

function PharmacyForm({ user, initial, onSave }) {
  const [pharmacyName, setPharmacyName] = useState(user.pharmacyName ?? "");
  const [pharmacyAddress, setPharmacyAddress] = useState(user.pharmacyAddress ?? "");
  const [website, setWebsite] = useState(initial.website ?? "");
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Apteka nomi</label>
        <input value={pharmacyName} onChange={(e) => setPharmacyName(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Manzil</label>
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          className="mt-1 flex w-full items-start gap-2 rounded-xl border border-neutral-200 p-3 text-left text-sm hover:border-primary/40"
        >
          <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
          <span className="flex-1 text-neutral-800">{pharmacyAddress}</span>
        </button>
      </div>
      <div>
        <label className={labelClass}>Website (ixtiyoriy)</label>
        <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className={inputClass} />
      </div>
      <Button onClick={() => onSave({ pharmacyName, pharmacyAddress, website })} className="w-full justify-center">
        <Check size={16} /> Saqlash
      </Button>
      <MapPickerSheet open={mapOpen} onClose={() => setMapOpen(false)} onConfirm={setPharmacyAddress} />
    </div>
  );
}

function LicenseForm({ initial, onSave }) {
  const [number, setNumber] = useState(initial.number);
  const [issuer, setIssuer] = useState(initial.issuer);
  const [expiry, setExpiry] = useState(initial.expiry);
  const [fileName, setFileName] = useState(initial.fileName);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Litsenziya raqami</label>
        <input value={number} onChange={(e) => setNumber(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Bergan organ</label>
        <input value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="Sog'liqni saqlash vazirligi" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Amal qilish muddati</label>
        <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Fayl</label>
        <label className="mt-1 flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-neutral-200 px-3 text-sm text-neutral-500 hover:border-primary/40">
          <Upload size={16} className="shrink-0 text-neutral-400" />
          <span className="min-w-0 flex-1 truncate">{fileName || "Fayl tanlash"}</span>
          <input type="file" accept="image/*,.pdf" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} className="hidden" />
        </label>
      </div>
      <Button onClick={() => onSave({ number, issuer, expiry, fileName })} className="w-full justify-center">
        <Check size={16} /> Saqlash
      </Button>
    </div>
  );
}

function BankForm({ user, initial, onSave }) {
  const [bankCard, setBankCard] = useState(user.bankCard ?? "");
  const [iban, setIban] = useState(initial.iban);
  const [bankName, setBankName] = useState(initial.bankName);
  const [tin, setTin] = useState(initial.tin);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Karta raqami</label>
        <input value={bankCard} onChange={(e) => setBankCard(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>IBAN</label>
        <input value={iban} onChange={(e) => setIban(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Bank nomi</label>
        <input value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>TIN raqami</label>
        <input value={tin} onChange={(e) => setTin(e.target.value)} className={inputClass} />
      </div>
      <Button onClick={() => onSave({ bankCard, iban, bankName, tin })} className="w-full justify-center">
        <Check size={16} /> Saqlash
      </Button>
    </div>
  );
}

function BranchForm({ onSave }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Filial nomi</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: 2-filial" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Manzil</label>
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          className="mt-1 flex w-full items-start gap-2 rounded-xl border border-neutral-200 p-3 text-left text-sm hover:border-primary/40"
        >
          <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
          <span className="flex-1 text-neutral-800">{address || "Manzilni xaritadan tanlang"}</span>
        </button>
      </div>
      <div>
        <label className={labelClass}>Ishlash soatlari</label>
        <input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="09:00-20:00" className={inputClass} />
      </div>
      <Button
        onClick={() => {
          if (!name.trim() || !address.trim()) return;
          onSave({ name: name.trim(), address: address.trim(), hours: hours.trim() });
        }}
        className="w-full justify-center"
      >
        <Check size={16} /> Qo'shish
      </Button>
      <MapPickerSheet open={mapOpen} onClose={() => setMapOpen(false)} onConfirm={setAddress} />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-semibold text-neutral-900">{value}</dd>
    </div>
  );
}
