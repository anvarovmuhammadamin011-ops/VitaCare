import { useState } from "react";
import { Bell, Clock, CreditCard, HeartPulse, LogOut, Percent, ShieldCheck } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Toggle, ToggleRow } from "../../components/ui/Toggle";
import { useAuth } from "../../store/AuthContext";
import { usePlatformSettings } from "../../store/PlatformSettingsContext";
import { useActivityLog } from "../../store/ActivityLogContext";
import { useToast } from "../../store/ToastContext";
import { adminLevelLabels, canAccess } from "../../utils/adminPermissions";

const inputClass =
  "h-10 w-24 rounded-lg border border-neutral-200 px-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "text-label font-semibold text-neutral-500";

const featureLabels = {
  manageUsers: "Foydalanuvchi boshqaruvi",
  manageProviders: "Provayder tasdiqlash",
  bookingActions: "Buyurtmani bekor qilish",
  financials: "Moliyaviy ma'lumotlar",
  settings: "Sozlamalar",
  bloodPressureEntry: "Qon bosimi kiritish",
  analyticsView: "Analitika",
  messaging: "Xabar almashish",
};

export default function AdminSettings() {
  const { user: admin, logout } = useAuth();
  const { settings, updateCommission, updateBpThresholds, setDemoMode, updatePaymentGateways, updateNotificationChannels } =
    usePlatformSettings();
  const { logActivity, activityFor } = useActivityLog();
  const { notify } = useToast();

  const [commissionDraft, setCommissionDraft] = useState({
    doctor: Math.round(settings.commission.doctor * 100),
    pharmacyPrescription: Math.round(settings.commission.pharmacyPrescription * 100),
    pharmacyPlain: Math.round(settings.commission.pharmacyPlain * 100),
    ambulance: Math.round(settings.commission.ambulance * 100),
  });
  const [thresholdDraft, setThresholdDraft] = useState(settings.bpThresholds);

  const canManageSettings = canAccess(admin.adminLevel, "settings");
  const adminName = `${admin.firstName} ${admin.lastName}`;

  function log(action) {
    logActivity(adminName, action);
  }

  function saveCommission() {
    updateCommission({
      doctor: commissionDraft.doctor / 100,
      pharmacyPrescription: commissionDraft.pharmacyPrescription / 100,
      pharmacyPlain: commissionDraft.pharmacyPlain / 100,
      ambulance: commissionDraft.ambulance / 100,
    });
    log("Komissiya stavkalari yangilandi");
    notify("Komissiya stavkalari saqlandi");
  }

  function saveThresholds() {
    updateBpThresholds(thresholdDraft);
    log("Qon bosimi chegaralari yangilandi");
    notify("Chegaralar saqlandi");
  }

  function handleLogout() {
    logout();
    notify("Hisobdan chiqdingiz");
  }

  if (!canManageSettings) {
    return (
      <div className="flex flex-col gap-4 pb-6">
        <header className="px-4 pb-2 pt-6">
          <h1 className="text-h2 font-bold text-neutral-900">Sozlamalar</h1>
        </header>
        <div className="mx-4 rounded-card border border-dashed border-neutral-200 py-12 text-center text-small text-neutral-400">
          Sizning ruxsat darajangiz sozlamalarni o'zgartirishga ega emas
        </div>
        <section className="px-4">
          <Button variant="danger" onClick={handleLogout} className="w-full justify-center text-sm">
            <LogOut size={16} /> Hisobdan chiqish
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <header className="px-4 pb-2 pt-6">
        <h1 className="text-h2 font-bold text-neutral-900">Sozlamalar</h1>
        <p className="mt-1 text-small text-neutral-500">Platforma darajasidagi konfiguratsiya</p>
      </header>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Percent size={15} className="text-primary" /> Komissiya stavkalari
          </h2>
          <div className="mt-3 flex flex-col gap-2.5 text-sm">
            <Row label="Doktor komissiyasi">
              <input
                type="number"
                value={commissionDraft.doctor}
                onChange={(e) => setCommissionDraft((c) => ({ ...c, doctor: Number(e.target.value) }))}
                className={inputClass}
              />
              <span className="text-neutral-400">%</span>
            </Row>
            <Row label="Retsept zakaz komissiyasi">
              <input
                type="number"
                value={commissionDraft.pharmacyPrescription}
                onChange={(e) => setCommissionDraft((c) => ({ ...c, pharmacyPrescription: Number(e.target.value) }))}
                className={inputClass}
              />
              <span className="text-neutral-400">%</span>
            </Row>
            <Row label="Oddiy zakaz komissiyasi">
              <input
                type="number"
                value={commissionDraft.pharmacyPlain}
                onChange={(e) => setCommissionDraft((c) => ({ ...c, pharmacyPlain: Number(e.target.value) }))}
                className={inputClass}
              />
              <span className="text-neutral-400">%</span>
            </Row>
            <Row label="Tez yordam komissiyasi">
              <input
                type="number"
                value={commissionDraft.ambulance}
                onChange={(e) => setCommissionDraft((c) => ({ ...c, ambulance: Number(e.target.value) }))}
                className={inputClass}
              />
              <span className="text-neutral-400">%</span>
            </Row>
          </div>
          <Button onClick={saveCommission} className="mt-3 h-10 w-full text-sm">
            Stavkalarni yangilash
          </Button>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900">Demo rejimi</h2>
            <Toggle checked={settings.demoMode} onChange={(v) => { setDemoMode(v); log(`Demo rejimi ${v ? "yoqildi" : "o'chirildi"}`); }} />
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Yoqilganda, admin bemorlar nomidan qon bosimi ma'lumotlarini qo'lda kirita oladi
          </p>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <HeartPulse size={15} className="text-error" /> Qon bosimi chegaralari (mmHg)
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <ThresholdField label="Ko'tarilgan (systolic)" value={thresholdDraft.elevatedSys} onChange={(v) => setThresholdDraft((t) => ({ ...t, elevatedSys: v }))} />
            <ThresholdField label="1-bosqich (systolic)" value={thresholdDraft.stage1Sys} onChange={(v) => setThresholdDraft((t) => ({ ...t, stage1Sys: v }))} />
            <ThresholdField label="1-bosqich (diastolic)" value={thresholdDraft.stage1Dia} onChange={(v) => setThresholdDraft((t) => ({ ...t, stage1Dia: v }))} />
            <ThresholdField label="2-bosqich (systolic)" value={thresholdDraft.stage2Sys} onChange={(v) => setThresholdDraft((t) => ({ ...t, stage2Sys: v }))} />
            <ThresholdField label="2-bosqich (diastolic)" value={thresholdDraft.stage2Dia} onChange={(v) => setThresholdDraft((t) => ({ ...t, stage2Dia: v }))} />
            <ThresholdField label="Krizis (systolic)" value={thresholdDraft.crisisSys} onChange={(v) => setThresholdDraft((t) => ({ ...t, crisisSys: v }))} />
            <ThresholdField label="Krizis (diastolic)" value={thresholdDraft.crisisDia} onChange={(v) => setThresholdDraft((t) => ({ ...t, crisisDia: v }))} />
          </div>
          <Button onClick={saveThresholds} className="mt-3 h-10 w-full text-sm">
            Chegaralarni yangilash
          </Button>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Bell size={15} className="text-secondary" /> Notifikatsiya kanallari
          </h2>
          <div className="mt-3 flex flex-col gap-2.5">
            <ToggleRow
              label="Email"
              checked={settings.notificationChannels.email}
              onChange={(v) => updateNotificationChannels({ email: v })}
            />
            <ToggleRow
              label="SMS"
              checked={settings.notificationChannels.sms}
              onChange={(v) => updateNotificationChannels({ sms: v })}
            />
            <ToggleRow
              label="Push"
              checked={settings.notificationChannels.push}
              onChange={(v) => updateNotificationChannels({ push: v })}
            />
          </div>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <CreditCard size={15} className="text-neutral-500" /> To'lov shlyuzlari
          </h2>
          <div className="mt-3 flex flex-col gap-2.5">
            <ToggleRow
              label="Click"
              checked={settings.paymentGateways.click}
              onChange={(v) => updatePaymentGateways({ click: v })}
            />
            <ToggleRow
              label="Payme"
              checked={settings.paymentGateways.payme}
              onChange={(v) => updatePaymentGateways({ payme: v })}
            />
            <ToggleRow
              label="Stripe"
              checked={settings.paymentGateways.stripe}
              onChange={(v) => updatePaymentGateways({ stripe: v })}
            />
          </div>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <ShieldCheck size={15} className="text-primary" /> Ruxsat darajalari
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            Sizning darajangiz: <b className="text-neutral-700">{adminLevelLabels[admin.adminLevel ?? "super"]}</b>
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-xs">
              <thead>
                <tr className="text-neutral-400">
                  <th className="pb-1.5 pr-2 font-semibold">Amal</th>
                  {Object.entries(adminLevelLabels).map(([id, label]) => (
                    <th key={id} className="pb-1.5 px-1.5 text-center font-semibold">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(featureLabels).map(([feature, label]) => (
                  <tr key={feature} className="border-t border-neutral-100">
                    <td className="py-1.5 pr-2 text-neutral-600">{label}</td>
                    {Object.keys(adminLevelLabels).map((level) => (
                      <td key={level} className="py-1.5 px-1.5 text-center">
                        {canAccess(level, feature) ? "✅" : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Clock size={15} className="text-neutral-500" /> Faoliyat jurnali
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {activityFor(adminName).length ? (
              activityFor(adminName)
                .slice(0, 10)
                .map((a) => (
                  <div key={a.id} className="rounded-xl bg-neutral-50 px-3 py-2 text-xs">
                    <p className="text-neutral-700">{a.action}</p>
                    <p className="mt-0.5 text-neutral-400">{new Date(a.createdAt).toLocaleString("uz-UZ")}</p>
                  </div>
                ))
            ) : (
              <p className="text-small text-neutral-400">Hali faoliyat qayd etilmagan</p>
            )}
          </div>
        </Card>
      </section>

      <section className="px-4">
        <Button variant="danger" onClick={handleLogout} className="w-full justify-center text-sm">
          <LogOut size={16} /> Hisobdan chiqish
        </Button>
      </section>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-neutral-700">{label}</span>
      <span className="flex items-center gap-1.5">{children}</span>
    </div>
  );
}

function ThresholdField({ label, value, onChange }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-10 w-full rounded-lg border border-neutral-200 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
