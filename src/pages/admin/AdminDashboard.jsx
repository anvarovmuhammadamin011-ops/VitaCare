import { Activity, HeartPulse, Pill as PillIcon, ShieldCheck, Star, Stethoscope, TrendingUp, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import { useAuth } from "../../store/AuthContext";
import { useOrders } from "../../store/OrdersContext";
import { usePharmacy } from "../../store/PharmacyContext";
import { usePlatformSettings } from "../../store/PlatformSettingsContext";
import { usePatientHealth } from "../../store/PatientHealthContext";
import { seedPayouts, seedPharmacyPayouts } from "../../data/mockData";
import { classifyBP, parseBP } from "../../utils/bloodPressure";
import { adminLevelLabels } from "../../utils/adminPermissions";

function formatSom(n) {
  return `${Math.round(n ?? 0).toLocaleString("uz-UZ")} so'm`;
}

function isToday(ts) {
  if (!ts) return false;
  const d = new Date(ts);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function AdminDashboard() {
  const { user, accounts } = useAuth();
  const { orders } = useOrders();
  const { orders: pharmacyOrders } = usePharmacy();
  const { settings } = usePlatformSettings();
  const { getAllPatientHealth } = usePatientHealth();

  const patients = accounts.filter((a) => a.role === "foydalanuvchi");
  const doctors = accounts.filter((a) => a.role === "doktor" && a.providerKind !== "hamshira");
  const nurses = accounts.filter((a) => a.role === "doktor" && a.providerKind === "hamshira");
  const pharmacies = accounts.filter((a) => a.role === "aptekachi");
  const verifiedDoctors = doctors.filter((a) => a.verified !== false);
  const verifiedPharmacies = pharmacies.filter((a) => a.verified !== false);

  const completedServiceOrders = orders.filter((o) => o.status === "tugallandi");
  const completedPharmacyOrders = pharmacyOrders.filter((o) => o.status === "tugallandi");
  const cancelledToday = [...orders, ...pharmacyOrders].filter(
    (o) => o.status === "bekor qilindi" && isToday(o.createdAt)
  ).length;
  const completedToday = [...completedServiceOrders, ...completedPharmacyOrders].filter((o) =>
    isToday(o.createdAt)
  ).length;

  const serviceRevenue = completedServiceOrders.reduce((sum, o) => sum + o.price, 0);
  const pharmacyRevenue = completedPharmacyOrders.reduce((sum, o) => sum + o.total, 0);
  const totalRevenue = serviceRevenue + pharmacyRevenue;
  const todayRevenue =
    completedServiceOrders.filter((o) => isToday(o.createdAt)).reduce((sum, o) => sum + o.price, 0) +
    completedPharmacyOrders.filter((o) => isToday(o.createdAt)).reduce((sum, o) => sum + o.total, 0);

  const allRatings = [...completedServiceOrders, ...completedPharmacyOrders].filter((o) => o.rating);
  const avgRating = allRatings.length
    ? (allRatings.reduce((s, o) => s + o.rating, 0) / allRatings.length).toFixed(2)
    : null;

  const doctorCounts = completedServiceOrders.reduce((acc, o) => {
    if (!o.provider) return acc;
    acc[o.provider] = (acc[o.provider] ?? 0) + 1;
    return acc;
  }, {});
  const topDoctors = Object.entries(doctorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const trend = [...seedPayouts, ...seedPharmacyPayouts]
    .reduce((acc, p) => {
      const found = acc.find((x) => x.date === p.date);
      if (found) found.amount += p.amount;
      else acc.push({ date: p.date, amount: p.amount });
      return acc;
    }, [])
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const maxTrend = Math.max(...trend.map((t) => t.amount), 1);

  const allHealth = getAllPatientHealth();
  const bpBuckets = { Normal: 0, "Ko'tarilgan": 0, "1-bosqich": 0, "2-bosqich": 0, Krizis: 0 };
  Object.values(allHealth).forEach((h) => {
    const readings = h?.vitals?.bloodPressure ?? [];
    if (!readings.length) return;
    const latest = readings[readings.length - 1];
    const parsed = parseBP(latest.value);
    if (!parsed) return;
    const { label } = classifyBP(parsed.systolic, parsed.diastolic, settings.bpThresholds);
    const key = label === "Ko'tarilgan" ? "Ko'tarilgan" : label;
    if (bpBuckets[key] !== undefined) bpBuckets[key] += 1;
  });
  const bpTotal = Object.values(bpBuckets).reduce((s, v) => s + v, 0);
  const bpToneClass = {
    Normal: "bg-primary",
    "Ko'tarilgan": "bg-warning",
    "1-bosqich": "bg-warning",
    "2-bosqich": "bg-error",
    Krizis: "bg-error",
  };

  return (
    <div className="flex flex-col gap-6 pb-6">
      <header className="px-4 pb-2 pt-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-white">
            <ShieldCheck size={22} />
          </span>
          <div>
            <h1 className="text-h2 font-bold text-neutral-900">VitaCare Admin</h1>
            <p className="text-small text-neutral-500">
              {user.firstName} {user.lastName} · {adminLevelLabels[user.adminLevel ?? "super"]}
            </p>
          </div>
        </div>
      </header>

      <section className="px-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-neutral-100 p-3 text-center">
            <p className="text-xl font-bold text-neutral-900">{patients.length}</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-neutral-500">
              <Users size={11} /> Jami bemorlar
            </p>
          </Card>
          <Card className="border-neutral-100 p-3 text-center">
            <p className="text-xl font-bold text-neutral-900">
              {verifiedDoctors.length}/{doctors.length + nurses.length}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-neutral-500">
              <Stethoscope size={11} /> Tasdiqlangan doktor/hamshira
            </p>
          </Card>
          <Card className="border-neutral-100 p-3 text-center">
            <p className="text-xl font-bold text-neutral-900">
              {verifiedPharmacies.length}/{pharmacies.length}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-neutral-500">
              <PillIcon size={11} /> Tasdiqlangan aptekalar
            </p>
          </Card>
          <Card className="border-neutral-100 p-3 text-center">
            <p className="text-xl font-bold text-neutral-900">{formatSom(todayRevenue).replace(" so'm", "")}</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-neutral-500">
              <TrendingUp size={11} /> Bugungi daromad
            </p>
          </Card>
        </div>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Activity size={15} className="text-primary" /> Bugungi faollik
          </h2>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <dd className="text-lg font-bold text-neutral-900">{completedToday}</dd>
              <dt className="text-[11px] text-neutral-500">Tugallangan</dt>
            </div>
            <div>
              <dd className="text-lg font-bold text-neutral-900">{cancelledToday}</dd>
              <dt className="text-[11px] text-neutral-500">Bekor qilingan</dt>
            </div>
            <div>
              <dd className="flex items-center justify-center gap-1 text-lg font-bold text-neutral-900">
                {avgRating ?? "—"} {avgRating && <Star size={14} className="fill-warning text-warning" />}
              </dd>
              <dt className="text-[11px] text-neutral-500">O'rtacha reyting</dt>
            </div>
          </dl>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-900">Umumiy daromad</h2>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Tibbiy xizmatlar</dt>
              <dd className="font-semibold text-neutral-900">{formatSom(serviceRevenue)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Dorixona buyurtmalari</dt>
              <dd className="font-semibold text-neutral-900">{formatSom(pharmacyRevenue)}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-100 pt-2">
              <dt className="font-semibold text-neutral-700">Jami</dt>
              <dd className="text-base font-bold text-neutral-900">{formatSom(totalRevenue)}</dd>
            </div>
          </dl>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <TrendingUp size={15} className="text-secondary" /> To'lovlar dinamikasi
          </h2>
          <div className="mt-4 flex items-end gap-2" style={{ height: 72 }}>
            {trend.map((t) => (
              <div key={t.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-secondary/70"
                  style={{ height: `${Math.max(8, (t.amount / maxTrend) * 56)}px` }}
                  title={`${t.date}: ${formatSom(t.amount)}`}
                />
                <span className="text-[10px] text-neutral-400">{t.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-900">Top doktorlar (bajarilgan buyurtmalar)</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {topDoctors.length ? (
              topDoctors.map(([name, count]) => (
                <li key={name} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700">{name}</span>
                  <span className="font-semibold text-neutral-900">{count} ta</span>
                </li>
              ))
            ) : (
              <p className="text-small text-neutral-400">Hali tugallangan buyurtma yo'q</p>
            )}
          </ul>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <HeartPulse size={15} className="text-error" /> Qon bosimi taqsimoti
          </h2>
          {bpTotal ? (
            <ul className="mt-3 flex flex-col gap-2">
              {Object.entries(bpBuckets).map(([label, count]) => (
                <li key={label}>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>{label}</span>
                    <span>{count}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full ${bpToneClass[label]}`}
                      style={{ width: `${(count / bpTotal) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-small text-neutral-400">Hali qon bosimi o'qishlari yo'q</p>
          )}
        </Card>
      </section>
    </div>
  );
}
