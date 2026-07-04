import { useState } from "react";
import { AlertTriangle, Check, Clock, HeartPulse, Siren } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../store/AuthContext";
import { usePatientHealth } from "../../store/PatientHealthContext";
import { usePlatformSettings } from "../../store/PlatformSettingsContext";
import { useNotifications } from "../../store/NotificationsContext";
import { useActivityLog } from "../../store/ActivityLogContext";
import { useToast } from "../../store/ToastContext";
import { canAccess } from "../../utils/adminPermissions";
import { classifyBP } from "../../utils/bloodPressure";

const inputClass =
  "mt-1 h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "text-label font-semibold text-neutral-500";

const toneBadge = { success: "success", warning: "warning", error: "error", neutral: "info" };

export default function AdminBloodPressure() {
  const { user: admin, accounts } = useAuth();
  const { getHealth, addVital } = usePatientHealth();
  const { settings } = usePlatformSettings();
  const { pushNotification } = useNotifications();
  const { logActivity, activityFor } = useActivityLog();
  const { notify } = useToast();

  const patients = accounts.filter((a) => a.role === "foydalanuvchi");
  const [patientPhone, setPatientPhone] = useState(patients[0]?.phone ?? "");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [note, setNote] = useState("");

  const canEnter = canAccess(admin.adminLevel, "bloodPressureEntry");
  const patient = patients.find((p) => p.phone === patientPhone);
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : null;
  const health = patient ? getHealth(patient.phone) : null;
  const history = health?.vitals?.bloodPressure ? [...health.vitals.bloodPressure].reverse() : [];

  const preview =
    systolic && diastolic ? classifyBP(systolic, diastolic, settings.bpThresholds) : null;

  function handleSubmit() {
    if (!patient || !systolic || !diastolic) {
      notify("Bemor va qiymatlarni to'ldiring");
      return;
    }
    const value = `${Math.round(systolic)}/${Math.round(diastolic)}`;
    const classification = classifyBP(systolic, diastolic, settings.bpThresholds);
    const adminName = `${admin.firstName} ${admin.lastName}`;

    addVital(patient.phone, "bloodPressure", value, {
      source: "admin",
      adminName,
      note: note.trim() || undefined,
    });

    logActivity(adminName, `${patientName} uchun qon bosimi kiritildi: ${value} (${classification.label})`);

    if (classification.label === "Krizis") {
      pushNotification(patientName, `URGENT! Qon bosimingiz kritik (${value}) — darhol shifokor bilan bog'laning`);
      logActivity(adminName, `Krizis ogohlantirishi yuborildi: ${patientName} (${value})`);
      notify("Krizis holati! Bemorga shoshilinch xabar yuborildi");
    } else {
      pushNotification(patientName, `Qon bosimingiz qayd etildi: ${value} (${classification.label})`);
      notify("Qon bosimi kiritildi");
    }

    setSystolic("");
    setDiastolic("");
    setNote("");
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <header className="px-4 pb-2 pt-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-error/10 text-error">
            <HeartPulse size={22} />
          </span>
          <div>
            <h1 className="text-h2 font-bold text-neutral-900">Qon bosimi</h1>
            <p className="text-small text-neutral-500">Demo rejimi — bemor nomidan ma'lumot kiritish</p>
          </div>
        </div>
      </header>

      {!canEnter ? (
        <div className="mx-4 rounded-card border border-dashed border-neutral-200 py-12 text-center text-small text-neutral-400">
          Sizning ruxsat darajangiz qon bosimi kiritishga ega emas
        </div>
      ) : (
        <>
          <section className="px-4">
            <Card className="border-neutral-100">
              <label className={labelClass}>Bemor tanlash</label>
              <select
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className={inputClass}
              >
                {patients.length === 0 && <option value="">Bemor topilmadi</option>}
                {patients.map((p) => (
                  <option key={p.phone} value={p.phone}>
                    {p.firstName} {p.lastName} ({p.age} yoshli)
                  </option>
                ))}
              </select>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Systolic (yuqori)</label>
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    placeholder="120"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Diastolic (quyi)</label>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    placeholder="80"
                    className={inputClass}
                  />
                </div>
              </div>

              {preview && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2">
                  <span className="text-sm font-semibold text-neutral-700">Tasnif:</span>
                  <Badge tone={toneBadge[preview.tone]}>{preview.label}</Badge>
                  {preview.label === "Krizis" && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-error">
                      <Siren size={12} /> Avtomatik ogohlantirish yuboriladi
                    </span>
                  )}
                </div>
              )}

              <div className="mt-4">
                <label className={labelClass}>Qo'shimcha izohlar (ixtiyoriy)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Masalan: Bemor tashvish ichida, tezkor o'lchov"
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button onClick={handleSubmit} className="mt-4 h-11 w-full justify-center text-sm" disabled={!patient}>
                <Check size={16} /> Kiritish
              </Button>
            </Card>
          </section>

          <section className="px-4">
            <h2 className="mb-3 text-sm font-bold text-neutral-900">
              {patientName ? `${patientName} — tarix` : "Tarix"}
            </h2>
            <div className="flex flex-col gap-2">
              {history.length ? (
                history.map((h, i) => {
                  const parsed = h.value.split("/");
                  const cls = classifyBP(parsed[0], parsed[1], settings.bpThresholds);
                  return (
                    <Card key={i} className="border-neutral-100">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                          <HeartPulse size={14} className="text-error" /> {h.value} mmHg
                        </span>
                        <Badge tone={toneBadge[cls.tone]}>{cls.label}</Badge>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-neutral-500">
                        <Clock size={11} />
                        {new Date(h.at).toLocaleString("uz-UZ")}
                        {h.source === "admin" && <span className="text-secondary">· Admin (Demo)</span>}
                      </div>
                      {h.note && (
                        <p className="mt-1 flex items-start gap-1 text-xs text-neutral-500">
                          <AlertTriangle size={11} className="mt-0.5 shrink-0" /> {h.note}
                        </p>
                      )}
                    </Card>
                  );
                })
              ) : (
                <div className="rounded-card border border-dashed border-neutral-200 py-8 text-center text-small text-neutral-400">
                  Hali qon bosimi o'qishlari yo'q
                </div>
              )}
            </div>
          </section>

          <section className="px-4">
            <h2 className="mb-3 text-sm font-bold text-neutral-900">Admin faoliyati</h2>
            <div className="flex flex-col gap-2">
              {activityFor(`${admin.firstName} ${admin.lastName}`)
                .filter((a) => a.action.toLowerCase().includes("qon bosimi") || a.action.toLowerCase().includes("krizis"))
                .slice(0, 8)
                .map((a) => (
                  <div key={a.id} className="rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2 text-xs">
                    <p className="text-neutral-700">{a.action}</p>
                    <p className="mt-0.5 text-neutral-400">{new Date(a.createdAt).toLocaleString("uz-UZ")}</p>
                  </div>
                ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
