import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import StatsPanel from "../components/StatsPanel";
import { Check, Wallet } from "lucide-react";
import { usePharmacy } from "../store/PharmacyContext";
import { useToast } from "../store/ToastContext";

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

export default function PharmacistEarnings() {
  const {
    grossEarnings,
    commission,
    netEarnings,
    completed,
    prescriptionCompleted,
    plainCompleted,
    prescriptionTotal,
    plainTotal,
    prescriptionCommission,
    plainCommission,
    payouts,
    avgRating,
    reviewCount,
  } = usePharmacy();
  const { notify } = useToast();

  const itemCounts = completed.reduce((acc, o) => {
    o.items.forEach((item) => {
      acc[item.name] = (acc[item.name] ?? 0) + item.qty;
    });
    return acc;
  }, {});
  const topServiceEntry = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0];
  const topService = topServiceEntry ? { label: topServiceEntry[0], count: topServiceEntry[1], unit: "dona" } : null;

  const nameCounts = completed.reduce((acc, o) => {
    acc[o.patientName] = (acc[o.patientName] ?? 0) + 1;
    return acc;
  }, {});
  const uniquePatients = Object.keys(nameCounts).length;
  const repeatPatients = Object.values(nameCounts).filter((c) => c > 1).length;
  const repeatRate = uniquePatients ? Math.round((repeatPatients / uniquePatients) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 pb-6">
      <PageHeader title="Daromad" subtitle="Oylik topshiriq va to'lovlaringiz" />

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary-dark">
              <Wallet size={14} />
            </span>
            Oylik topshiriq
          </h2>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <Row label="Jami" value={formatSom(grossEarnings)} />
            <Row label="Komissiya (jami)" value={`-${formatSom(commission)}`} muted />
            <Row label="Sof pul" value={formatSom(netEarnings)} bold />
          </dl>
          <Button onClick={() => notify("To'lov so'rovi: tez orada mavjud bo'ladi")} className="mt-3 h-10 w-full text-sm">
            To'lov talab qilish
          </Button>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-900">Zakaz turi bo'yicha (alohida hisob)</h2>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <div className="flex flex-col gap-1.5 rounded-xl border border-neutral-100 p-3">
              <Row label={`Oddiy zakazlar (${plainCompleted.length} ta)`} value={formatSom(plainTotal)} />
              <Row label="Komissiya (3%)" value={`-${formatSom(plainCommission)}`} muted />
            </div>
            <div className="flex flex-col gap-1.5 rounded-xl border border-secondary/20 bg-secondary/5 p-3">
              <Row label={`Retsept zakazlari (${prescriptionCompleted.length} ta)`} value={formatSom(prescriptionTotal)} />
              <Row label="Komissiya (5%)" value={`-${formatSom(prescriptionCommission)}`} muted />
            </div>
            {plainCompleted.length + prescriptionCompleted.length === 0 && (
              <p className="text-small text-neutral-400">Hali tugallangan zakaz yo'q</p>
            )}
          </dl>
        </Card>
      </section>

      <section className="px-4">
        <StatsPanel payouts={payouts} topService={topService} repeatRate={repeatRate} avgRating={avgRating} reviewCount={reviewCount} />
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-900">Oxirgi to'lovlar</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {payouts.map((p) => (
              <li key={p.date} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-neutral-600">
                  <Check size={14} className="text-primary" /> {p.date}
                </span>
                <span className="font-semibold text-neutral-900">{formatSom(p.amount)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}

function Row({ label, value, muted, bold }) {
  return (
    <div className="flex justify-between">
      <dt className="text-neutral-500">{label}</dt>
      <dd className={`font-semibold ${muted ? "text-neutral-400" : "text-neutral-900"} ${bold ? "text-base" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
