import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  Camera,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Globe,
  HeartPulse,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Star,
  Stethoscope,
  Trash2,
  Wallet,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Sheet from "../../components/ui/Sheet";
import Pill from "../../components/ui/Pill";
import TagList from "../../components/ui/TagList";
import { Toggle, ToggleRow } from "../../components/ui/Toggle";
import IdentityForm from "../../components/profile/IdentityForm";
import MapPickerSheet from "../../components/MapPickerSheet";
import { useAuth } from "../../store/AuthContext";
import { usePatientHealth } from "../../store/PatientHealthContext";
import { useSettings } from "../../store/SettingsContext";
import { useActivityLog } from "../../store/ActivityLogContext";
import { useOrders } from "../../store/OrdersContext";
import { useReminders } from "../../store/RemindersContext";
import { useToast } from "../../store/ToastContext";
import { downloadJson } from "../../utils/exportData";

const inputClass =
  "mt-1 h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "text-label font-semibold text-neutral-500";
const tabs = [
  { id: "sogliq", label: "Sog'liq" },
  { id: "manzil", label: "Manzillar" },
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

export default function PatientProfile() {
  const navigate = useNavigate();
  const { user, logout: authLogout, updateProfile, requestAccountDeletion, cancelAccountDeletion } = useAuth();
  const health = usePatientHealth();
  const { getSettings, updateSettings } = useSettings();
  const { logActivity, activityFor } = useActivityLog();
  const { completed } = useOrders();
  const { reminders } = useReminders();
  const { notify } = useToast();

  const [tab, setTab] = useState("sogliq");
  const [sheet, setSheet] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [otpStep, setOtpStep] = useState(null);
  const [activityOpen, setActivityOpen] = useState(false);

  const myName = `${user.firstName} ${user.lastName}`;
  const h = health.getHealth(user.phone);
  const settings = getSettings(user.phone);
  const reviews = completed
    .filter((o) => o.rating)
    .map((o) => ({
      id: o.id,
      rating: o.rating,
      text: o.comment,
      photo: o.photo,
      provider: o.provider,
      reply: o.providerReply,
    }));

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

  function saveMedical(fields) {
    health.updateHealth(user.phone, fields);
    log("Tibbiy ma'lumotlar tahrirlandi");
    notify("Ma'lumotlar saqlandi");
    closeSheet();
  }

  function saveAddress(fields, editingId) {
    if (editingId) {
      health.updateAddress(user.phone, editingId, fields);
      log(`Manzil tahrirlandi: ${fields.label}`);
    } else {
      health.addAddress(user.phone, fields);
      log(`Yangi manzil qo'shildi: ${fields.label}`);
    }
    notify("Manzil saqlandi");
    closeSheet();
  }

  function saveCard(fields) {
    health.addCard(user.phone, fields);
    log(`Yangi karta qo'shildi: ${fields.label}`);
    notify("Karta qo'shildi");
    closeSheet();
  }

  function toggleWallet(name) {
    const cur = h.eWallets ?? [];
    const next = cur.includes(name) ? cur.filter((w) => w !== name) : [...cur, name];
    health.updateHealth(user.phone, { eWallets: next });
  }

  function handleTwoFactorToggle() {
    if (settings.twoFactorEnabled) {
      updateSettings(user.phone, { twoFactorEnabled: false });
      log("2FA o'chirildi");
      notify("2FA o'chirildi");
      return;
    }
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setOtpStep({ code, value: "" });
  }

  function confirmTwoFactor() {
    if (otpStep.value !== otpStep.code) {
      notify("Kod noto'g'ri");
      return;
    }
    updateSettings(user.phone, { twoFactorEnabled: true });
    log("2FA yoqildi");
    notify("2FA yoqildi");
    setOtpStep(null);
  }

  function handleExportData() {
    downloadJson(`vitacare-${user.phone.replace(/\D/g, "")}.json`, {
      account: { ...user, password: undefined },
      health: h,
      settings,
      orders: completed,
      reminders,
      activity: activityFor(myName),
    });
    log("Ma'lumotlar yuklab olindi (GDPR)");
    notify("Ma'lumotlaringiz JSON fayl sifatida yuklandi");
  }

  function handleDeleteRequest() {
    requestAccountDeletion();
    log("Hisobni o'chirish so'ralindi (72 soat)");
    notify("Hisobingiz 72 soatdan so'ng o'chiriladi — bekor qilishingiz mumkin");
    setConfirmDelete(false);
  }

  function handleCancelDeletion() {
    cancelAccountDeletion();
    log("Hisobni o'chirish bekor qilindi");
    notify("Hisobni o'chirish bekor qilindi");
  }

  function logout() {
    authLogout();
    notify("Hisobdan chiqdingiz");
  }

  const deletionHoursLeft = user.deletionRequestedAt
    ? Math.max(0, 72 - Math.floor((Date.now() - user.deletionRequestedAt) / 3600000))
    : null;

  return (
    <div className="flex flex-col gap-6 pb-6">
      <header className="px-4 pb-2 pt-6">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-primary text-lg font-bold text-white">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                myName.split(" ").filter(Boolean).map((w) => w[0]).join("")
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-white text-neutral-500 shadow ring-1 ring-neutral-200">
              <Camera size={12} />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-h3 font-bold text-neutral-900">{myName}</h1>
            <p className="text-small text-neutral-500">{user.phone}</p>
          </div>
        </div>
      </header>

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

      {tab === "sogliq" && (
        <div className="flex flex-col gap-4 px-4">
          <Card className="border-neutral-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900">Asosiy ma'lumotlar</h2>
              <button onClick={() => setSheet({ type: "shaxsiy" })} className="text-neutral-400 hover:text-primary">
                <Pencil size={15} />
              </button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Row label="Tug'ilgan sana" value={user.birthDate ?? "—"} />
              <Row label="Jins" value={user.gender ?? "—"} />
              <Row label="Pasport/ID" value={user.passportId ?? "—"} />
              <Row label="Email" value={user.email ?? "—"} />
            </dl>
          </Card>

          <button
            onClick={() => setSheet({ type: "sogliqTarixi" })}
            className="flex w-full items-center gap-3 rounded-card border border-neutral-100 bg-white p-4 text-left transition hover:border-primary/40 active:scale-[0.99]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-dark">
              <Stethoscope size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-neutral-900">Sog'lig'i tarixi</span>
              <span className="block text-label text-neutral-500">
                Xroniya kasalliklar, allergiya, qon guruhi va h.k.
              </span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-neutral-300" />
          </button>

          <VitalCard
            icon={HeartPulse}
            title="Qon bosimi"
            unit="mmHg"
            placeholder="120/80"
            history={h.vitals.bloodPressure}
            onAdd={(v) => health.addVital(user.phone, "bloodPressure", v)}
          />
          <VitalCard
            icon={Stethoscope}
            title="Qand darajasi"
            unit="mmol/l"
            placeholder="5.5"
            history={h.vitals.sugar}
            onAdd={(v) => health.addVital(user.phone, "sugar", v)}
          />
        </div>
      )}

      {tab === "manzil" && (
        <div className="flex flex-col gap-3 px-4">
          {h.addresses.map((a) => (
            <Card key={a.id} className="border-neutral-100">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${a.primary ? "bg-primary" : "bg-neutral-300"}`} />
                    <h3 className="text-sm font-bold text-neutral-900">{a.label}</h3>
                    {a.primary && <Badge>Asosiy</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">{a.detail}</p>
                  {a.note && <p className="mt-0.5 text-xs text-neutral-400">{a.note}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => setSheet({ type: "manzil", editingId: a.id, initial: a })}
                    className="text-neutral-400 hover:text-primary"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => health.removeAddress(user.phone, a.id)}
                    className="text-neutral-400 hover:text-error"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {!a.primary && (
                <button
                  onClick={() => health.setPrimaryAddress(user.phone, a.id)}
                  className="mt-2 text-xs font-semibold text-primary-dark"
                >
                  Asosiy manzil qilib belgilash
                </button>
              )}
            </Card>
          ))}
          <Button variant="secondary" onClick={() => setSheet({ type: "manzil" })} className="h-11 w-full justify-center text-sm">
            <Plus size={15} /> Yangi manzil qo'shish
          </Button>
        </div>
      )}

      {tab === "tolov" && (
        <div className="flex flex-col gap-4 px-4">
          <Card className="border-neutral-100">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <CreditCard size={15} className="text-primary" /> Plastik kartalar
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {h.cards.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-xl border border-neutral-100 px-3 py-2.5 text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.primary ? "bg-primary" : "bg-neutral-300"}`} />
                    {c.label}: {maskCard(c.number)}
                    {c.exp && <span className="text-neutral-400">· {c.exp}</span>}
                  </span>
                  <span className="flex items-center gap-2">
                    {!c.primary && (
                      <button onClick={() => health.setPrimaryCard(user.phone, c.id)} className="text-xs font-semibold text-primary-dark">
                        Asosiy
                      </button>
                    )}
                    <button onClick={() => health.removeCard(user.phone, c.id)} className="text-neutral-400 hover:text-error">
                      <Trash2 size={14} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <Button variant="ghost" onClick={() => setSheet({ type: "karta" })} className="mt-2">
              <Plus size={14} /> Yangi karta qo'shish
            </Button>
          </Card>

          <Card className="border-neutral-100">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <Wallet size={15} className="text-secondary" /> Elektron hamyon
            </h2>
            <div className="mt-3 flex gap-2">
              {["Click", "Payme", "Apelsin"].map((w) => (
                <Pill key={w} active={(h.eWallets ?? []).includes(w)} onClick={() => toggleWallet(w)}>
                  {w}
                </Pill>
              ))}
            </div>
          </Card>

          <Card className="border-neutral-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900">Naqd pul qabul qilish</h2>
              <Toggle checked={h.acceptsCash ?? false} onChange={(v) => health.updateHealth(user.phone, { acceptsCash: v })} />
            </div>
            <p className="mt-1 text-xs text-neutral-400">Hamshiraga xizmat joyida naqd to'lash</p>
          </Card>

          <Card className="border-neutral-100">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <ShieldCheck size={15} className="text-primary" /> Sug'urta balansi
            </h2>
            <p className="mt-2 text-xl font-bold text-neutral-900">{formatSom(h.insuranceBalance)}</p>
            <p className="text-xs text-neutral-400">Qolgan sug'urta mablag'i</p>
          </Card>
        </div>
      )}

      {tab === "sharh" && (
        <div className="flex flex-col gap-3 px-4">
          {reviews.length ? (
            reviews.map((r) => (
              <Card key={r.id} className="border-neutral-100">
                <div className="flex items-center justify-between">
                  <span className="flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={14} className="fill-warning text-warning" />
                    ))}
                  </span>
                  {r.provider && <span className="text-xs text-neutral-400">{r.provider}</span>}
                </div>
                {r.text && <p className="mt-1.5 text-sm text-neutral-700">"{r.text}"</p>}
                {r.photo && <img src={r.photo} alt="" className="mt-2 h-16 w-16 rounded-lg object-cover" />}
                {r.reply && (
                  <div className="mt-2 rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                    <span className="font-semibold text-neutral-800">Javob: </span>
                    {r.reply}
                  </div>
                )}
              </Card>
            ))
          ) : (
            <div className="rounded-card border border-dashed border-neutral-200 py-10 text-center text-small text-neutral-400">
              Hali sharh yo'q — buyurtma tugagach uni baholang
            </div>
          )}
        </div>
      )}

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Bell size={15} className="text-secondary" /> Notifikatsiya
          </h2>
          <div className="mt-3 flex flex-col gap-2.5">
            <ToggleRow
              label="Push-notifikatsiya"
              checked={settings.notifications.push}
              onChange={(v) => updateSettings(user.phone, { notifications: { ...settings.notifications, push: v } })}
            />
            <ToggleRow
              label="SMS ogohlantirish"
              checked={settings.notifications.sms}
              onChange={(v) => updateSettings(user.phone, { notifications: { ...settings.notifications, sms: v } })}
            />
            <ToggleRow
              label="Email digest (haftasiga 1 marta)"
              checked={settings.notifications.emailDigest}
              onChange={(v) => updateSettings(user.phone, { notifications: { ...settings.notifications, emailDigest: v } })}
            />
          </div>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <Globe size={15} className="text-neutral-500" /> Til
            </h2>
            <div className="flex gap-1.5">
              {[
                { id: "uz", label: "O'zbek" },
                { id: "ru", label: "Rus" },
                { id: "en", label: "Ingliz" },
              ].map((l) => (
                <Pill key={l.id} active={settings.language === l.id} onClick={() => updateSettings(user.phone, { language: l.id })} className="text-xs">
                  {l.label}
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
            <Toggle checked={settings.twoFactorEnabled} onChange={handleTwoFactorToggle} />
          </div>
          <button onClick={() => setActivityOpen(true)} className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary-dark">
            <Clock size={12} /> Faollik jurnalini ko'rish
          </button>
        </Card>
      </section>

      <section className="flex flex-col gap-2 px-4">
        <Button variant="secondary" onClick={handleExportData} className="h-11 w-full justify-center text-sm">
          <Download size={15} /> Ma'lumotlarimni yuklab olish (JSON)
        </Button>

        {user.deletionRequestedAt ? (
          <div className="rounded-xl border border-error/20 bg-error/5 p-3 text-sm">
            <p className="text-neutral-700">
              Hisobingiz <b>{deletionHoursLeft} soat</b>dan so'ng butunlay o'chiriladi.
            </p>
            <Button variant="secondary" onClick={handleCancelDeletion} className="mt-2 h-9 w-full text-xs">
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
            <Trash2 size={15} /> Hisobni o'chirish
          </Button>
        )}

        <Button variant="danger" onClick={logout} className="w-full justify-center text-sm">
          <LogOut size={16} /> Hisobdan chiqish
        </Button>
      </section>

      <Sheet open={sheet?.type === "shaxsiy"} onClose={closeSheet} title="Shaxsiy ma'lumotlar">
        <IdentityForm user={user} onSave={saveIdentity} />
      </Sheet>

      <Sheet open={sheet?.type === "tibbiy"} onClose={closeSheet} title="Tibbiy ko'rsatkichlar">
        <MedicalForm health={h} onSave={saveMedical} />
      </Sheet>

      <Sheet open={sheet?.type === "sogliqTarixi"} onClose={closeSheet} title="Sog'lig'i tarixi">
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Xroniya kasalliklari</label>
            <div className="mt-1">
              <TagList
                items={h.chronic}
                onAdd={(v) => {
                  health.addListItem(user.phone, "chronic", v);
                  log(`Xroniya kasallik qo'shildi: ${v}`);
                }}
                onRemove={(v) => health.removeListItem(user.phone, "chronic", v)}
                placeholder="Masalan: Diabet"
              />
            </div>
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-1`}>
              <AlertTriangle size={12} className="text-warning" /> Allergiyalar
              <span className="font-normal text-neutral-400">(Doktor/Hamshiraga ko'rinadi)</span>
            </label>
            <div className="mt-1">
              <TagList
                items={h.allergies}
                onAdd={(v) => {
                  health.addListItem(user.phone, "allergies", v);
                  log(`Allergiya qo'shildi: ${v}`);
                }}
                onRemove={(v) => health.removeListItem(user.phone, "allergies", v)}
                placeholder="Masalan: Penitsillin"
                tone="warning"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Olingan operatsiyalar</label>
            <div className="mt-1">
              <TagList
                items={h.surgeries}
                onAdd={(v) => health.addListItem(user.phone, "surgeries", v)}
                onRemove={(v) => health.removeListItem(user.phone, "surgeries", v)}
                placeholder="Masalan: Appendektomiya (2019)"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Qabul qilayotgan dorilar</label>
            <button
              onClick={() => navigate("/eslatmalar")}
              className="mt-1 flex w-full items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5 text-left text-sm hover:border-primary/40"
            >
              <span className="text-neutral-600">
                {reminders.length ? reminders.map((r) => r.name).join(", ") : "Hali qo'shilmagan"}
              </span>
              <ChevronRight size={16} className="shrink-0 text-neutral-300" />
            </button>
          </div>
          <button onClick={() => setSheet({ type: "tibbiy" })} className="flex items-center gap-1 self-start text-xs font-semibold text-primary-dark">
            <Pencil size={12} /> Qon guruhi / Bo'y / Vazn tahrirlash
          </button>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Row label="Qon guruhi" value={h.bloodType || "—"} />
            <Row label="Rezus omili" value={h.rhFactor || "—"} />
            <Row label="Bo'y" value={h.height ? `${h.height} sm` : "—"} />
            <Row label="Vazn" value={h.weight ? `${h.weight} kg` : "—"} />
          </dl>
          <button
            onClick={() => navigate("/sogligim-tarixi")}
            className="flex items-center justify-center gap-1 rounded-xl border border-neutral-200 py-2.5 text-xs font-semibold text-primary-dark"
          >
            To'liq tarixni ko'rish <ChevronRight size={13} />
          </button>
        </div>
      </Sheet>

      <Sheet open={sheet?.type === "manzil"} onClose={closeSheet} title={sheet?.editingId ? "Manzilni tahrirlash" : "Yangi manzil"}>
        <AddressForm initial={sheet?.initial} onSave={(fields) => saveAddress(fields, sheet?.editingId)} />
      </Sheet>

      <Sheet open={sheet?.type === "karta"} onClose={closeSheet} title="Yangi karta">
        <CardForm onSave={saveCard} />
      </Sheet>

      <Sheet open={Boolean(otpStep)} onClose={() => setOtpStep(null)} title="2FA yoqish">
        {otpStep && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-neutral-600">
              Test uchun tasdiqlash kodi: <b className="text-neutral-900">{otpStep.code}</b>
            </p>
            <input
              value={otpStep.value}
              onChange={(e) => setOtpStep((cur) => ({ ...cur, value: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
              inputMode="numeric"
              placeholder="0000"
              className={`${inputClass} text-center text-xl font-bold tracking-[0.5em]`}
            />
            <Button onClick={confirmTwoFactor} className="w-full justify-center">
              Tasdiqlash
            </Button>
          </div>
        )}
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

function MedicalForm({ health, onSave }) {
  const [bloodType, setBloodType] = useState(health.bloodType ?? "");
  const [rhFactor, setRhFactor] = useState(health.rhFactor ?? "");
  const [height, setHeight] = useState(health.height ?? "");
  const [weight, setWeight] = useState(health.weight ?? "");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Qon guruhi</label>
        <div className="mt-1.5 flex gap-2">
          {["O", "A", "B", "AB"].map((b) => (
            <Pill key={b} active={bloodType === b} onClick={() => setBloodType(b)} type="button">
              {b}
            </Pill>
          ))}
        </div>
      </div>
      <div>
        <label className={labelClass}>Rezus omili</label>
        <div className="mt-1.5 flex gap-2">
          {["Rh+", "Rh-"].map((r) => (
            <Pill key={r} active={rhFactor === r} onClick={() => setRhFactor(r)} type="button">
              {r}
            </Pill>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Bo'y (sm)</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Vazn (kg)</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputClass} />
        </div>
      </div>
      <Button onClick={() => onSave({ bloodType, rhFactor, height, weight })} className="w-full justify-center">
        <Check size={16} /> Saqlash
      </Button>
    </div>
  );
}

function AddressForm({ initial, onSave }) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [detail, setDetail] = useState(initial?.detail ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Nomi</label>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Masalan: Uy" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Manzil</label>
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          className="mt-1 flex w-full items-start gap-2 rounded-xl border border-neutral-200 p-3 text-left text-sm hover:border-primary/40"
        >
          <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
          <span className="flex-1 text-neutral-800">{detail || "Manzilni xaritadan tanlang"}</span>
        </button>
      </div>
      <div>
        <label className={labelClass}>Intercom / kvartira / detallar</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Masalan: Domofon 25, 3-qavat" className={inputClass} />
      </div>
      <Button
        onClick={() => {
          if (!label.trim() || !detail.trim()) return;
          onSave({ label: label.trim(), detail: detail.trim(), note: note.trim() || undefined });
        }}
        className="w-full justify-center"
      >
        <Check size={16} /> Saqlash
      </Button>
      <MapPickerSheet open={mapOpen} onClose={() => setMapOpen(false)} onConfirm={setDetail} />
    </div>
  );
}

function CardForm({ onSave }) {
  const [label, setLabel] = useState("Humo");
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Karta turi</label>
        <div className="mt-1.5 flex gap-2">
          {["Humo", "Uzcard", "Visa"].map((l) => (
            <Pill key={l} active={label === l} onClick={() => setLabel(l)} type="button">
              {l}
            </Pill>
          ))}
        </div>
      </div>
      <div>
        <label className={labelClass}>Karta raqami</label>
        <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="9860 1234 5678 1234" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Amal qilish muddati</label>
        <input value={exp} onChange={(e) => setExp(e.target.value)} placeholder="MM/YY" className={inputClass} />
      </div>
      <Button
        onClick={() => {
          if (!number.trim()) return;
          onSave({ label, number: number.trim(), exp: exp.trim() });
        }}
        className="w-full justify-center"
      >
        <Check size={16} /> Saqlash
      </Button>
    </div>
  );
}

function VitalCard({ icon: Icon, title, unit, placeholder, history, onAdd }) {
  const [value, setValue] = useState("");
  const latest = history[history.length - 1];

  return (
    <Card className="border-neutral-100">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
          <Icon size={15} className="text-primary" /> {title}
        </h2>
        {latest && (
          <span className="text-xs text-neutral-400">
            oxirgi: <b className="text-neutral-700">{latest.value}</b> {unit}
          </span>
        )}
      </div>
      {history.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {history.slice(-6).map((pt, i) => (
            <span key={i} className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] text-neutral-500">
              {pt.value}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="h-10 flex-1 rounded-xl border border-neutral-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button
          onClick={() => {
            if (!value.trim()) return;
            onAdd(value.trim());
            setValue("");
          }}
          className="h-10 px-4 text-xs"
        >
          Qo'shish
        </Button>
      </div>
    </Card>
  );
}

function Badge({ children }) {
  return (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary-dark">{children}</span>
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
