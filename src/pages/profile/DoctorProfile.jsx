import { useState } from "react";
import {
  Award,
  Banknote,
  Bell,
  Building2,
  Camera,
  Check,
  Clock,
  Copy,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  Power,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  UserCog,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Sheet from "../../components/ui/Sheet";
import Pill from "../../components/ui/Pill";
import TagList from "../../components/ui/TagList";
import { Toggle, ToggleRow } from "../../components/ui/Toggle";
import IdentityForm from "../../components/profile/IdentityForm";
import { useAuth } from "../../store/AuthContext";
import { useProviderProfile } from "../../store/ProviderProfileContext";
import { useSettings } from "../../store/SettingsContext";
import { useActivityLog } from "../../store/ActivityLogContext";
import { useDoctor } from "../../store/DoctorContext";
import { useOrders } from "../../store/OrdersContext";
import { useToast } from "../../store/ToastContext";
import { doctorSpecialties, nurseSpecialties, majorCities } from "../../data/roles";
import { careServices } from "../../data/mockData";
import { downloadJson } from "../../utils/exportData";

const inputClass =
  "mt-1 h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "text-label font-semibold text-neutral-500";
const weekDays = ["Dush", "Sesh", "Chor", "Pay", "Juma", "Shan", "Yak"];
const tabs = [
  { id: "shaxsiy", label: "Shaxsiy" },
  { id: "sertifikat", label: "Sertifikat" },
  { id: "shahar", label: "Shahar" },
  { id: "bank", label: "Bank" },
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

export default function DoctorProfile() {
  const { user, logout: authLogout, updateProfile, requestAccountDeletion, cancelAccountDeletion } = useAuth();
  const provider = useProviderProfile();
  const { getSettings, updateSettings } = useSettings();
  const { logActivity, activityFor } = useActivityLog();
  const { completed, avgRating, reviewCount } = useDoctor();
  const { replyToOrder } = useOrders();
  const { notify } = useToast();

  const [tab, setTab] = useState("shaxsiy");
  const [sheet, setSheet] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState({});

  const myName = user.providerKind === "hamshira" ? `${user.firstName} ${user.lastName} (Hamshira)` : `Dr. ${user.firstName} ${user.lastName}`;
  const p = provider.getProviderProfile(user.phone);
  const settings = getSettings(user.phone);
  const specialtyOptions = user.providerKind === "hamshira" ? nurseSpecialties : doctorSpecialties;

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

  function saveCertificate(cert) {
    provider.addCertificate(user.phone, cert);
    log(`Sertifikat qo'shildi: ${cert.name}`);
    notify("Sertifikat qo'shildi");
    closeSheet();
  }

  function copyProfileLink() {
    const link = `${window.location.origin}/doktorlar?doktor=${encodeURIComponent(user.phone)}`;
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

  function handleReactivate() {
    updateProfile({ deactivated: false });
    log("Hisob qayta faollashtirildi");
    notify("Hisobingiz qayta faollashtirildi");
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

  const nameCounts = completed.reduce((acc, o) => {
    acc[o.patientName] = (acc[o.patientName] ?? 0) + 1;
    return acc;
  }, {});
  const uniquePatients = Object.keys(nameCounts).length;
  const repeatRate = uniquePatients
    ? Math.round((Object.values(nameCounts).filter((c) => c > 1).length / uniquePatients) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6 pb-6">
      <header className="px-4 pb-2 pt-6">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-primary text-lg font-bold text-white">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                `${user.firstName[0]}${user.lastName[0]}`
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-white text-neutral-500 shadow ring-1 ring-neutral-200">
              <Camera size={12} />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="truncate text-h3 font-bold text-neutral-900">{myName}</h1>
              {user.verified && (
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-secondary text-white" title="Tasdiqlangan">
                  <Check size={12} />
                </span>
              )}
            </div>
            <p className="text-small text-neutral-500">{user.specialty}</p>
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

      {tab === "shaxsiy" && (
        <div className="flex flex-col gap-4 px-4">
          <Card className="border-neutral-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900">Asosiy ma'lumotlar</h2>
              <button onClick={() => setSheet({ type: "shaxsiy" })} className="text-neutral-400 hover:text-primary">
                <Pencil size={15} />
              </button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Row label="Telefon" value={user.phone} />
              <Row label="Email" value={user.email ?? "—"} />
              <Row label="Tug'ilgan sana" value={user.birthDate ?? "—"} />
              <Row label="Jins" value={user.gender ?? "—"} />
              <Row label="Pasport/ID" value={user.passportId ?? "—"} />
            </dl>
          </Card>

          <Card className="border-neutral-100">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <UserCog size={15} className="text-primary" /> Ixtisoslashtirish
            </h2>
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              {specialtyOptions.map((s) => (
                <Pill
                  key={s}
                  active={user.specialty === s}
                  onClick={() => {
                    updateProfile({ specialty: s });
                    log(`Ixtisoslik o'zgartirildi: ${s}`);
                  }}
                >
                  {s}
                </Pill>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "sertifikat" && (
        <div className="flex flex-col gap-4 px-4">
          <Card className="border-neutral-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900">Litsenziya</h2>
              <button onClick={() => setSheet({ type: "litsenziya" })} className="text-neutral-400 hover:text-primary">
                <Pencil size={15} />
              </button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Row label="Raqami" value={p.license.number || "—"} />
              <Row label="Bergan organ" value={p.license.issuer || "—"} />
              <Row label="Muddati" value={p.license.expiry || "—"} />
              <Row label="Fayl" value={p.license.fileName || user.certificateFileName || "—"} />
            </dl>
          </Card>

          <Card className="border-neutral-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900">Sertifikatlar</h2>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {p.certificates.map((c) => (
                <li key={c.name} className="flex items-center justify-between rounded-xl border border-neutral-100 px-3 py-2 text-sm">
                  <span>
                    {c.name} <span className="text-neutral-400">· {c.year}</span>
                  </span>
                  <button onClick={() => provider.removeCertificate(user.phone, c.name)} className="text-neutral-400 hover:text-error">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <Button variant="ghost" onClick={() => setSheet({ type: "sertifikat" })} className="mt-2">
              <Plus size={14} /> Sertifikat qo'shish
            </Button>
          </Card>

          <Card className="border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900">Tajriba</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Row label="Jami tajriba" value={`${user.experienceYears ?? 0} yil`} />
            </dl>
            <div className="mt-3">
              <label className={labelClass}>Amaliy ko'nikmalar</label>
              <div className="mt-1">
                <TagList
                  items={p.skills}
                  onAdd={(v) => {
                    provider.addListItem(user.phone, "skills", v);
                    log(`Ko'nikma qo'shildi: ${v}`);
                  }}
                  onRemove={(v) => provider.removeListItem(user.phone, "skills", v)}
                  placeholder="Masalan: EKG o'tkazish"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "shahar" && (
        <div className="flex flex-col gap-4 px-4">
          <Card className="border-neutral-100">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <MapPin size={15} className="text-primary" /> Asosiy shahar
            </h2>
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              {majorCities.map((c) => (
                <Pill key={c} active={user.serviceCity === c} onClick={() => updateProfile({ serviceCity: c })}>
                  {c}
                </Pill>
              ))}
            </div>
          </Card>

          <Card className="border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900">Ishlash zonasi</h2>
            <div className="mt-3">
              <label className={labelClass}>Masofa</label>
              <div className="mt-1.5 flex gap-2">
                {[2, 5, 10, 20].map((km) => (
                  <Pill key={km} active={p.workZone.radiusKm === km} onClick={() => provider.updateNested(user.phone, "workZone", { radiusKm: km })}>
                    {km} km
                  </Pill>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <label className={labelClass}>Ish kunlari</label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {weekDays.map((d) => (
                  <Pill key={d} active={p.workZone.days.includes(d)} onClick={() => provider.toggleWorkDay(user.phone, d)} className="text-xs">
                    {d}
                  </Pill>
                ))}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Ish boshlanishi</label>
                <input
                  type="time"
                  value={p.workZone.hoursFrom}
                  onChange={(e) => provider.updateNested(user.phone, "workZone", { hoursFrom: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Ish tugashi</label>
                <input
                  type="time"
                  value={p.workZone.hoursTo}
                  onChange={(e) => provider.updateNested(user.phone, "workZone", { hoursTo: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </Card>

          <Card className="border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900">Qo'shimcha shaharlar</h2>
            <div className="mt-2">
              <TagList
                items={p.extraCities}
                onAdd={(v) => provider.addListItem(user.phone, "extraCities", v)}
                onRemove={(v) => provider.removeListItem(user.phone, "extraCities", v)}
                placeholder="Masalan: Samarqand"
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
                <Banknote size={15} className="text-primary" /> Bank rekvizitlari
              </h2>
              <button onClick={() => setSheet({ type: "bank" })} className="text-neutral-400 hover:text-primary">
                <Pencil size={15} />
              </button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Row label="Karta raqami" value={maskCard(user.bankCard)} />
              <Row label="IBAN/SWIFT" value={p.bank.iban || "—"} />
              <Row label="Bank nomi" value={p.bank.bankName || "—"} />
              <Row label="TIN" value={p.bank.tin || "—"} />
            </dl>
          </Card>

          <Card className="border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900">Soliq toifasi</h2>
            <div className="mt-2 flex flex-col gap-2">
              {["Yakka tartibdagi tadbirkor", "Jismoniy shaxs"].map((t) => (
                <Pill key={t} active={p.bank.taxType === t} onClick={() => provider.updateNested(user.phone, "bank", { taxType: t })} className="justify-start text-left">
                  {t}
                </Pill>
              ))}
            </div>
          </Card>

          <Card className="border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900">Oylik hisobi</h2>
            <p className="mt-2 text-xl font-bold text-neutral-900">{formatSom(completed.reduce((s, o) => s + o.price, 0))}</p>
            <p className="text-xs text-neutral-400">To'liq to'lovlar tarixi "Pul" bo'limida</p>
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
                <p className="text-lg font-bold text-neutral-900">{repeatRate}%</p>
                <p className="text-[11px] text-neutral-400">Qaytaruvchi bemor</p>
              </div>
              <div>
                <p className="text-lg font-bold text-neutral-900">{reviewCount}</p>
                <p className="text-[11px] text-neutral-400">Jami sharh</p>
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
                {o.photo && <img src={o.photo} alt="" className="mt-2 h-16 w-16 rounded-lg object-cover" />}
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
              label="Yangi buyurtma (Push)"
              checked={settings.notifications.push}
              onChange={(v) => updateSettings(user.phone, { notifications: { ...settings.notifications, push: v } })}
            />
            <ToggleRow
              label="Yangi buyurtma (SMS)"
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
            <Power size={15} className="text-neutral-500" /> Ishlash rejimi
          </h2>
          <div className="mt-3 flex flex-col gap-2.5">
            <ToggleRow
              label="Online rejim"
              checked={p.availability.online}
              onChange={(v) => provider.updateNested(user.phone, "availability", { online: v })}
            />
            <ToggleRow
              label="Bugun ishlamayapman"
              checked={p.availability.offToday}
              onChange={(v) => provider.updateNested(user.phone, "availability", { offToday: v })}
            />
          </div>
          <div className="mt-3">
            <label className={labelClass}>Avtomatik javob (band bo'lganda)</label>
            <input
              value={p.availability.autoReply}
              onChange={(e) => provider.updateNested(user.phone, "availability", { autoReply: e.target.value })}
              placeholder="Masalan: Hozir band, 1 soatdan so'ng javob beraman"
              className={inputClass}
            />
          </div>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-900">Xizmat tarifi</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {careServices.slice(0, 6).map((s) => {
              const price = p.tariffs[s.id] ?? s.price ?? s.pricePerHour;
              return (
                <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-neutral-700">{s.name}</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => provider.setTariff(user.phone, s.id, Number(e.target.value))}
                    className="h-9 w-32 rounded-lg border border-neutral-200 px-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </li>
              );
            })}
          </ul>
          <div className="mt-3">
            <label className={labelClass}>Sug'urta qamrab oladigan qism</label>
            <div className="mt-1.5 flex gap-2">
              {[50, 80, 90, 100].map((pct) => (
                <Pill key={pct} active={p.insuranceCoveragePercent === pct} onClick={() => provider.updateProviderProfile(user.phone, { insuranceCoveragePercent: pct })}>
                  {pct}%
                </Pill>
              ))}
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
          <Upload size={15} className="rotate-180" /> Ma'lumotlarimni yuklab olish (JSON)
        </Button>

        {user.deactivated ? (
          <Button variant="secondary" onClick={handleReactivate} className="h-11 w-full justify-center text-sm">
            <Power size={15} /> Hisobni qayta faollashtirish
          </Button>
        ) : confirmDeactivate ? (
          <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm">
            <p className="text-neutral-700">Hisobingiz vaqtincha yashiriladi, 30 kun ichida qayta faollashtira olasiz.</p>
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

      <Sheet open={sheet?.type === "litsenziya"} onClose={closeSheet} title="Litsenziya">
        <LicenseForm initial={p.license} onSave={saveLicense} />
      </Sheet>

      <Sheet open={sheet?.type === "sertifikat"} onClose={closeSheet} title="Sertifikat qo'shish">
        <CertificateForm onSave={saveCertificate} />
      </Sheet>

      <Sheet open={sheet?.type === "bank"} onClose={closeSheet} title="Bank rekvizitlari">
        <BankForm user={user} initial={p.bank} onSave={(fields) => {
          updateProfile({ bankCard: fields.bankCard });
          provider.updateNested(user.phone, "bank", { iban: fields.iban, bankName: fields.bankName, tin: fields.tin });
          log("Bank rekvizitlari yangilandi");
          notify("Saqlandi");
          closeSheet();
        }} />
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

function CertificateForm({ onSave }) {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [fileName, setFileName] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Sertifikat nomi</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Kardiologiya" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Yil</label>
        <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Fayl</label>
        <label className="mt-1 flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-neutral-200 px-3 text-sm text-neutral-500 hover:border-primary/40">
          <Upload size={16} className="shrink-0 text-neutral-400" />
          <span className="min-w-0 flex-1 truncate">{fileName || "Fayl tanlash"}</span>
          <input type="file" accept="image/*,.pdf" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} className="hidden" />
        </label>
      </div>
      <Button
        onClick={() => {
          if (!name.trim()) return;
          onSave({ name: name.trim(), year: year.trim(), fileName });
        }}
        className="w-full justify-center"
      >
        <Award size={16} /> Qo'shish
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
        <label className={labelClass}>IBAN / SWIFT</label>
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

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-semibold text-neutral-900">{value}</dd>
    </div>
  );
}
