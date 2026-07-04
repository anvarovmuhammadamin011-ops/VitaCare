import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Check, Wallet } from "lucide-react";
import { useDoctor } from "../store/DoctorContext";
import { useToast } from "../store/ToastContext";

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

export default function DoctorEarnings() {
  const { grossEarnings, commission, netEarnings, completed, payouts } = useDoctor();
  const { notify } = useToast();

  const byService = completed.reduce((acc, o) => {
    const label = o.items ? o.items.map((item) => item.title).join(" + ") : o.title;
    acc[label] = acc[label] ?? { count: 0, total: 0 };
    acc[label].count += 1;
    acc[label].total += o.price;
    return acc;
  }, {});

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
            <Row label="Komissiya (3%)" value={`-${formatSom(commission)}`} muted />
            <Row label="Sof pul" value={formatSom(netEarnings)} bold />
          </dl>
          <Button onClick={() => notify("To'lov so'rovi: tez orada mavjud bo'ladi")} className="mt-3 h-10 w-full text-sm">
            To'lov talab qilish
          </Button>
        </Card>
      </section>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-900">Buyurtma turi bo'yicha</h2>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            {Object.entries(byService).map(([service, s]) => (
              <Row key={service} label={`${service} (${s.count} ta)`} value={formatSom(s.total)} />
            ))}
            {Object.keys(byService).length === 0 && (
              <p className="text-small text-neutral-400">Hali tugallangan buyurtma yo'q</p>
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
