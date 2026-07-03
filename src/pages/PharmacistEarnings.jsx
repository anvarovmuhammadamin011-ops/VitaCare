import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Check, Wallet } from "lucide-react";
import { usePharmacy } from "../store/PharmacyContext";
import { useToast } from "../store/ToastContext";

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

export default function PharmacistEarnings() {
  const { grossEarnings, commission, netEarnings, prescriptionCompleted, plainCompleted, payouts } = usePharmacy();
  const { notify } = useToast();

  const prescriptionTotal = prescriptionCompleted.reduce((sum, o) => sum + o.total, 0);
  const plainTotal = plainCompleted.reduce((sum, o) => sum + o.total, 0);

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
            <Row label="Komissiya (5%)" value={`-${formatSom(commission)}`} muted />
            <Row label="Sof pul" value={formatSom(netEarnings)} bold />
          </dl>
          <Button onClick={() => notify("To'lov so'rovi: tez orada mavjud bo'ladi")} className="mt-3 h-10 w-full text-sm">
            To'lov talab qilish
          </Button>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-900">Zakaz turi bo'yicha</h2>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <Row label={`Oddiy zakazlar (${plainCompleted.length} ta)`} value={formatSom(plainTotal)} />
            <Row label={`Retsept zakazlari (${prescriptionCompleted.length} ta)`} value={formatSom(prescriptionTotal)} />
            {plainCompleted.length + prescriptionCompleted.length === 0 && (
              <p className="text-small text-neutral-400">Hali tugallangan zakaz yo'q</p>
            )}
          </dl>
        </Card>
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
