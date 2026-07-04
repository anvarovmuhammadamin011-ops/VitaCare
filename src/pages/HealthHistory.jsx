import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Pill as PillIcon, Printer, Star, Stethoscope } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useOrders } from "../store/OrdersContext";
import { useReminders } from "../store/RemindersContext";
import { userProfile } from "../data/mockData";

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

export default function HealthHistory() {
  const navigate = useNavigate();
  const { completed } = useOrders();
  const { reminders, log } = useReminders();

  const recentDays = Object.keys(log)
    .sort((a, b) => (a < b ? 1 : -1))
    .slice(0, 7);

  return (
    <div className="flex flex-col gap-6 pb-6">
      <header className="px-4 pb-2 pt-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft size={16} /> Orqaga
        </button>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-white">
              <Stethoscope size={22} />
            </span>
            <div>
              <h1 className="text-h2 font-bold text-neutral-900">Sog'lig'im tarixi</h1>
              <p className="text-small text-neutral-500">Qabul qilingan xizmatlar va dorilaringiz</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => window.print()} className="h-10 shrink-0 px-4 text-sm">
            <Printer size={15} /> PDF
          </Button>
        </div>
      </header>

      <div className="hidden px-4 print:block">
        <h1 className="text-xl font-bold text-neutral-900">Sog'lig'im tarixi — {userProfile.name}</h1>
        <p className="text-sm text-neutral-500">Chop etilgan sana: {new Date().toLocaleDateString("uz-UZ")}</p>
      </div>

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-900">Asosiy ma'lumotlar</h2>
          <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <Row label="Qon guruhi" value={userProfile.bloodType} />
            <Row label="Allergiya" value={userProfile.allergy} />
            <Row label="Xroniki kasallik" value={userProfile.chronic} />
          </dl>
        </Card>
      </section>

      <section className="px-4">
        <h2 className="text-sm font-bold text-neutral-900">Xizmatlar tarixi</h2>
        <div className="mt-3 flex flex-col gap-3">
          {completed.length ? (
            completed.map((o) => (
              <Card key={o.id} className="border-neutral-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {o.items ? o.items.map((item) => item.title).join(", ") : o.title}
                  </h3>
                  <span className="text-xs text-neutral-400">{o.id}</span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {o.provider} · {o.time}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900">{formatSom(o.price)}</span>
                  {o.rating && (
                    <span className="flex gap-0.5">
                      {Array.from({ length: o.rating }).map((_, i) => (
                        <Star key={i} size={12} className="fill-warning text-warning" />
                      ))}
                    </span>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <EmptyState text="Hali tugallangan xizmat yo'q" />
          )}
        </div>
      </section>

      <section className="px-4">
        <h2 className="text-sm font-bold text-neutral-900">Dorilar va vitaminlar (joriy sxema)</h2>
        <div className="mt-3 flex flex-col gap-3">
          {reminders.length ? (
            reminders.map((r) => (
              <Card key={r.id} className="border-neutral-100">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-dark">
                    <PillIcon size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900">{r.name}</h3>
                    <p className="text-xs text-neutral-500">
                      {r.dosage} · {r.times.join(", ")}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <EmptyState text="Hali dori eslatmasi yo'q" />
          )}
        </div>
      </section>

      {recentDays.length > 0 && (
        <section className="px-4">
          <h2 className="text-sm font-bold text-neutral-900">So'nggi kunlar bo'yicha qabul tarixi</h2>
          <Card className="mt-3 border-neutral-100">
            <ul className="flex flex-col gap-2">
              {recentDays.map((day) => {
                const entries = Object.values(log[day]);
                const taken = entries.filter((s) => s === "taken").length;
                return (
                  <li key={day} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-neutral-600">
                      <Clock size={13} className="text-neutral-400" /> {day}
                    </span>
                    <span className="font-semibold text-neutral-900">
                      {taken}/{entries.length} dori vaqtida ichildi
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      )}
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

function EmptyState({ text }) {
  return (
    <div className="rounded-card border border-dashed border-neutral-200 py-8 text-center text-small text-neutral-400">
      {text}
    </div>
  );
}
