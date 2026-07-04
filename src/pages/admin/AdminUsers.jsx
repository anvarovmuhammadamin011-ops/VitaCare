import { useState } from "react";
import {
  AlertTriangle,
  Ban,
  Check,
  ChevronRight,
  HeartPulse,
  Search,
  Star,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Sheet from "../../components/ui/Sheet";
import { useAuth } from "../../store/AuthContext";
import { useOrders } from "../../store/OrdersContext";
import { usePharmacy } from "../../store/PharmacyContext";
import { usePatientHealth } from "../../store/PatientHealthContext";
import { useProviderProfile } from "../../store/ProviderProfileContext";
import { usePlatformSettings } from "../../store/PlatformSettingsContext";
import { useActivityLog } from "../../store/ActivityLogContext";
import { useToast } from "../../store/ToastContext";
import { canAccess } from "../../utils/adminPermissions";
import { classifyBP, parseBP } from "../../utils/bloodPressure";

function formatSom(n) {
  return `${(n ?? 0).toLocaleString("uz-UZ")} so'm`;
}

const subTabs = [
  { id: "bemor", label: "Bemorlar" },
  { id: "doktor", label: "Doktorlar" },
  { id: "aptekachi", label: "Aptekalar" },
];

export default function AdminUsers() {
  const { user: admin, accounts, adminSetVerified, adminSetSuspended, adminDeleteAccount } = useAuth();
  const { orders } = useOrders();
  const { grossEarnings: pharmacyGross, completed: pharmacyCompleted } = usePharmacy();
  const { getHealth } = usePatientHealth();
  const { getProviderProfile } = useProviderProfile();
  const { settings } = usePlatformSettings();
  const { logActivity } = useActivityLog();
  const { notify } = useToast();

  const [subTab, setSubTab] = useState("bemor");
  const [search, setSearch] = useState("");
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [confirmDeletePhone, setConfirmDeletePhone] = useState(null);

  // Look the selected account up live (by phone) rather than holding a snapshot object,
  // so the detail sheet reflects verify/suspend changes immediately instead of going stale.
  const selected = selectedPhone ? accounts.find((a) => a.phone === selectedPhone) ?? null : null;

  const canManage = canAccess(admin.adminLevel, "manageUsers");
  const canManageProviders = canAccess(admin.adminLevel, "manageProviders");

  const roleFilter = {
    bemor: (a) => a.role === "foydalanuvchi",
    doktor: (a) => a.role === "doktor",
    aptekachi: (a) => a.role === "aptekachi",
  }[subTab];

  const list = accounts.filter(roleFilter).filter((a) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const name = a.role === "aptekachi" ? a.pharmacyName : `${a.firstName} ${a.lastName}`;
    return name?.toLowerCase().includes(q) || a.phone.toLowerCase().includes(q);
  });

  function log(action) {
    logActivity(`${admin.firstName} ${admin.lastName}`, action);
  }

  function displayName(a) {
    if (a.role === "aptekachi") return a.pharmacyName;
    if (a.role === "doktor") return a.providerKind === "hamshira" ? `${a.firstName} ${a.lastName} (Hamshira)` : `Dr. ${a.firstName} ${a.lastName}`;
    return `${a.firstName} ${a.lastName}`;
  }

  function handleVerify(a, verified) {
    adminSetVerified(a.phone, verified);
    log(`${displayName(a)} ${verified ? "tasdiqlandi" : "tasdiqi bekor qilindi"}`);
    notify(verified ? "Tasdiqlandi" : "Tasdiq bekor qilindi");
  }

  function handleSuspend(a, suspended) {
    adminSetSuspended(a.phone, suspended);
    log(`${displayName(a)} ${suspended ? "to'xtatildi" : "qayta faollashtirildi"}`);
    notify(suspended ? "Hisob to'xtatildi" : "Hisob qayta faollashtirildi");
  }

  function handleDelete(a) {
    adminDeleteAccount(a.phone);
    log(`${displayName(a)} hisobi o'chirildi`);
    notify("Hisob o'chirildi");
    setConfirmDeletePhone(null);
    setSelectedPhone(null);
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      <header className="px-4 pb-2 pt-6">
        <h1 className="text-h2 font-bold text-neutral-900">Foydalanuvchilar</h1>
        <p className="mt-1 text-small text-neutral-500">Bemor, doktor va aptekalarni boshqaring</p>
      </header>

      <div className="px-4">
        <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
          {subTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`h-10 flex-1 rounded-lg text-xs font-semibold transition ${
                subTab === t.id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism yoki telefon bo'yicha qidirish..."
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4">
        {list.length ? (
          list.map((a) => {
            const name = displayName(a);
            const patientOrders = subTab === "bemor" ? orders.filter((o) => o.patientName === name) : [];
            return (
              <button
                key={a.phone}
                onClick={() => setSelectedPhone(a.phone)}
                className="flex w-full items-center gap-3 rounded-card border border-neutral-200 bg-white p-4 text-left transition hover:border-primary/40 active:scale-[0.99]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary-dark">
                  {name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="block truncate text-sm font-bold text-neutral-900">{name}</span>
                    {a.suspended && <Badge tone="error">To'xtatilgan</Badge>}
                    {a.verified === false && <Badge tone="warning">Kutilmoqda</Badge>}
                  </span>
                  <span className="mt-0.5 block text-label text-neutral-500">{a.phone}</span>
                  {subTab === "bemor" && (
                    <span className="mt-0.5 block text-label text-neutral-400">{patientOrders.length} ta buyurtma</span>
                  )}
                  {subTab === "doktor" && (
                    <span className="mt-0.5 block text-label text-neutral-400">
                      {a.specialty} · {a.experienceYears} yil tajriba
                    </span>
                  )}
                  {subTab === "aptekachi" && (
                    <span className="mt-0.5 block truncate text-label text-neutral-400">{a.pharmacyAddress}</span>
                  )}
                </span>
                <ChevronRight size={18} className="shrink-0 text-neutral-300" />
              </button>
            );
          })
        ) : (
          <div className="rounded-card border border-dashed border-neutral-200 py-12 text-center text-small text-neutral-400">
            Hech kim topilmadi
          </div>
        )}
      </div>

      <Sheet open={Boolean(selected)} onClose={() => setSelectedPhone(null)} title={selected ? displayName(selected) : ""}>
        {selected && (
          <UserDetail
            account={selected}
            orders={orders}
            pharmacyGross={pharmacyGross}
            pharmacyCompleted={pharmacyCompleted}
            getHealth={getHealth}
            getProviderProfile={getProviderProfile}
            thresholds={settings.bpThresholds}
            canManage={canManage}
            canManageProviders={canManageProviders}
            onVerify={handleVerify}
            onSuspend={handleSuspend}
            confirmDeletePhone={confirmDeletePhone}
            setConfirmDeletePhone={setConfirmDeletePhone}
            onDelete={handleDelete}
          />
        )}
      </Sheet>
    </div>
  );
}

function UserDetail({
  account: a,
  orders,
  pharmacyGross,
  pharmacyCompleted,
  getHealth,
  getProviderProfile,
  thresholds,
  canManage,
  canManageProviders,
  onVerify,
  onSuspend,
  confirmDeletePhone,
  setConfirmDeletePhone,
  onDelete,
}) {
  const isPatient = a.role === "foydalanuvchi";
  const isDoctor = a.role === "doktor";
  const isPharmacy = a.role === "aptekachi";

  const patientOrders = isPatient ? orders.filter((o) => o.patientName === `${a.firstName} ${a.lastName}`) : [];
  const patientCompleted = patientOrders.filter((o) => o.status === "tugallandi");
  const patientSpending = patientCompleted.reduce((s, o) => s + o.price, 0);
  const patientRatings = patientOrders.filter((o) => o.rating);
  const health = isPatient ? getHealth(a.phone) : null;
  const latestBP = health?.vitals?.bloodPressure?.length
    ? health.vitals.bloodPressure[health.vitals.bloodPressure.length - 1]
    : null;
  const latestBPParsed = latestBP ? parseBP(latestBP.value) : null;
  const latestBPClass = latestBPParsed ? classifyBP(latestBPParsed.systolic, latestBPParsed.diastolic, thresholds) : null;

  const doctorOrders = isDoctor ? orders.filter((o) => o.providerPhone === a.phone) : [];
  const doctorCompleted = doctorOrders.filter((o) => o.status === "tugallandi");
  const doctorEarnings = doctorCompleted.reduce((s, o) => s + o.price, 0);
  const doctorRatings = doctorCompleted.filter((o) => o.rating);
  const doctorAvgRating = doctorRatings.length
    ? (doctorRatings.reduce((s, o) => s + o.rating, 0) / doctorRatings.length).toFixed(1)
    : null;
  const providerProfile = isDoctor || isPharmacy ? getProviderProfile(a.phone) : null;

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-neutral-500">Telefon</dt>
          <dd className="font-semibold text-neutral-900">{a.phone}</dd>
        </div>
        {isPatient && (
          <div>
            <dt className="text-neutral-500">Yosh</dt>
            <dd className="font-semibold text-neutral-900">{a.age}</dd>
          </div>
        )}
        {isDoctor && (
          <>
            <div>
              <dt className="text-neutral-500">Yo'nalish</dt>
              <dd className="font-semibold text-neutral-900">{a.specialty}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Shahar</dt>
              <dd className="font-semibold text-neutral-900">{a.serviceCity}</dd>
            </div>
          </>
        )}
        {isPharmacy && (
          <div className="col-span-2">
            <dt className="text-neutral-500">Manzil</dt>
            <dd className="font-semibold text-neutral-900">{a.pharmacyAddress}</dd>
          </div>
        )}
      </dl>

      {isPatient && (
        <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-sm">
          <p className="font-semibold text-neutral-800">Sog'liq profili</p>
          <div className="mt-2 flex flex-col gap-1 text-neutral-600">
            <span>Qon guruhi: {health.bloodType || "—"} {health.rhFactor}</span>
            {health.allergies.length > 0 && (
              <span className="flex items-center gap-1 text-warning">
                <AlertTriangle size={12} /> Allergiya: {health.allergies.join(", ")}
              </span>
            )}
            <span>Xroniya: {health.chronic.join(", ") || "—"}</span>
          </div>
          {latestBP && (
            <div className="mt-2 flex items-center gap-2 border-t border-neutral-200 pt-2">
              <HeartPulse size={14} className="text-error" />
              <span className="font-semibold text-neutral-900">{latestBP.value} mmHg</span>
              <Badge tone={latestBPClass.tone === "success" ? "success" : latestBPClass.tone === "error" ? "error" : "warning"}>
                {latestBPClass.label}
              </Badge>
            </div>
          )}
          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-neutral-200 pt-2 text-center">
            <div>
              <p className="font-bold text-neutral-900">{patientOrders.length}</p>
              <p className="text-[10px] text-neutral-500">buyurtma</p>
            </div>
            <div>
              <p className="font-bold text-neutral-900">{formatSom(patientSpending)}</p>
              <p className="text-[10px] text-neutral-500">sarflangan</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-0.5 font-bold text-neutral-900">
                {patientRatings.length ? (patientRatings.reduce((s, o) => s + o.rating, 0) / patientRatings.length).toFixed(1) : "—"}
                <Star size={12} className="fill-warning text-warning" />
              </p>
              <p className="text-[10px] text-neutral-500">o'rtacha</p>
            </div>
          </div>
        </div>
      )}

      {isDoctor && (
        <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-sm">
          <p className="flex items-center gap-1.5 font-semibold text-neutral-800">
            <Stethoscope size={13} /> Faoliyat
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="font-bold text-neutral-900">{doctorCompleted.length}</p>
              <p className="text-[10px] text-neutral-500">bajarilgan</p>
            </div>
            <div>
              <p className="font-bold text-neutral-900">{formatSom(doctorEarnings)}</p>
              <p className="text-[10px] text-neutral-500">daromad</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-0.5 font-bold text-neutral-900">
                {doctorAvgRating ?? "—"} {doctorAvgRating && <Star size={12} className="fill-warning text-warning" />}
              </p>
              <p className="text-[10px] text-neutral-500">reyting</p>
            </div>
          </div>
          <p className="mt-2 border-t border-neutral-200 pt-2 text-neutral-600">
            Litsenziya: {providerProfile.license.number || "kiritilmagan"}
          </p>
        </div>
      )}

      {isPharmacy && (
        <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-sm">
          <p className="font-semibold text-neutral-800">Apteka faoliyati (umumiy)</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="font-bold text-neutral-900">{pharmacyCompleted.length}</p>
              <p className="text-[10px] text-neutral-500">bajarilgan zakaz</p>
            </div>
            <div>
              <p className="font-bold text-neutral-900">{formatSom(pharmacyGross)}</p>
              <p className="text-[10px] text-neutral-500">tushum</p>
            </div>
          </div>
          <p className="mt-2 border-t border-neutral-200 pt-2 text-neutral-600">
            Litsenziya: {providerProfile.license.number || "kiritilmagan"}
          </p>
        </div>
      )}

      {(canManage || canManageProviders) ? (
        <div className="flex flex-col gap-2">
          {(isDoctor || isPharmacy) && canManageProviders && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => onVerify(a, true)}
                disabled={a.verified !== false}
                className="h-10 flex-1 text-xs"
              >
                <Check size={14} /> Tasdiqlash
              </Button>
              <Button
                variant="secondary"
                onClick={() => onVerify(a, false)}
                disabled={a.verified === false}
                className="h-10 flex-1 text-xs"
              >
                <X size={14} /> Bekor qilish
              </Button>
            </div>
          )}
          {canManage && (
            <Button variant="secondary" onClick={() => onSuspend(a, !a.suspended)} className="h-10 w-full text-xs">
              <Ban size={14} /> {a.suspended ? "Faollashtirish" : "To'xtatish"}
            </Button>
          )}
          {canManage &&
            (confirmDeletePhone === a.phone ? (
              <div className="rounded-xl border border-error/20 bg-error/5 p-3 text-xs">
                <p className="text-neutral-700">Hisobni butunlay o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.</p>
                <div className="mt-2 flex gap-2">
                  <Button variant="danger" onClick={() => onDelete(a)} className="h-9 flex-1 justify-center text-xs">
                    Ha, o'chirish
                  </Button>
                  <Button variant="secondary" onClick={() => setConfirmDeletePhone(null)} className="h-9 flex-1 text-xs">
                    Orqaga
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="danger" onClick={() => setConfirmDeletePhone(a.phone)} className="w-full justify-center text-sm">
                <Trash2 size={14} /> Hisobni o'chirish
              </Button>
            ))}
        </div>
      ) : (
        <p className="text-center text-xs text-neutral-400">Sizning ruxsat darajangiz bu amallarga ega emas</p>
      )}
    </div>
  );
}
