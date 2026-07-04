import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Check, Clock, Pill as PillIcon, Plus, Trash2 } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Sheet from "../components/ui/Sheet";
import { useReminders } from "../store/RemindersContext";
import { useToast } from "../store/ToastContext";

const inputClass =
  "mt-1 h-12 w-full rounded-xl border border-neutral-200 px-3 text-body focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "text-label font-semibold text-neutral-500";
const frequencyPresets = [1, 2, 3, 4];

export default function Reminders() {
  const navigate = useNavigate();
  const {
    reminders,
    todayLog,
    addReminder,
    removeReminder,
    markDose,
    requestNotificationPermission,
    complianceRate,
    takenCount,
    totalToday,
  } = useReminders();
  const { notify } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [times, setTimes] = useState(["09:00"]);

  function updateTimesCount(n) {
    setTimesPerDay(n);
    setTimes((cur) => {
      const next = [...cur];
      while (next.length < n) next.push("09:00");
      return next.slice(0, n);
    });
  }

  function resetForm() {
    setName("");
    setDosage("");
    setTimesPerDay(1);
    setTimes(["09:00"]);
  }

  function handleAdd(e) {
    e.preventDefault();
    if (!name.trim() || !dosage.trim() || times.some((t) => !t)) {
      notify("Barcha maydonlarni to'ldiring");
      return;
    }
    addReminder({ name: name.trim(), dosage: dosage.trim(), times });
    requestNotificationPermission();
    notify(`${name.trim()} uchun eslatma qo'shildi`);
    resetForm();
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <header className="px-4 pb-2 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft size={16} /> Orqaga
        </button>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-white">
            <Bell size={22} />
          </span>
          <div>
            <h1 className="text-h2 font-bold text-neutral-900">Dori eslatuvchilari</h1>
            <p className="text-small text-neutral-500">Dorilaringizni o'z vaqtida qabul qiling</p>
          </div>
        </div>
      </header>

      <section className="px-4">
        <Card className="border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-neutral-900">Bugungi tartib</p>
              <p className="text-small text-neutral-500">
                {takenCount}/{totalToday} dori qabul qilindi
              </p>
            </div>
            <p className="text-2xl font-bold text-primary">{complianceRate}%</p>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${complianceRate}%` }}
            />
          </div>
        </Card>
      </section>

      <section className="px-4">
        <Button onClick={() => setOpen(true)} className="h-11 w-full justify-center text-sm">
          <Plus size={16} /> Dori eslatmasi qo'shish
        </Button>
      </section>

      <section className="flex flex-col gap-3 px-4">
        {reminders.length ? (
          reminders.map((r) => (
            <Card key={r.id} className="border-neutral-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-dark">
                    <PillIcon size={18} />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900">{r.name}</h3>
                    <p className="text-label text-neutral-500">{r.dosage}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    removeReminder(r.id);
                    notify(`${r.name} eslatmasi o'chirildi`);
                  }}
                  aria-label="O'chirish"
                  className="shrink-0 text-neutral-400 hover:text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.times.map((t) => {
                  const status = todayLog[`${r.id}|${t}`];
                  return (
                    <div
                      key={t}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                        status === "taken"
                          ? "border-primary/30 bg-primary/5"
                          : status === "skipped"
                            ? "border-neutral-200 bg-neutral-50 text-neutral-400"
                            : "border-neutral-200"
                      }`}
                    >
                      <Clock size={14} className="text-neutral-400" />
                      <span className="font-semibold">{t}</span>
                      {status === "taken" ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-primary-dark">
                          <Check size={13} /> Qabul qilindi
                        </span>
                      ) : status === "skipped" ? (
                        <span className="text-xs font-semibold text-neutral-400">O'tkazib yuborildi</span>
                      ) : (
                        <span className="flex gap-1">
                          <button
                            onClick={() => markDose(r.id, t, "taken")}
                            className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white"
                          >
                            Ichdim
                          </button>
                          <button
                            onClick={() => markDose(r.id, t, "skipped")}
                            className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-bold text-neutral-600"
                          >
                            O'tkazish
                          </button>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))
        ) : (
          <div className="rounded-card border border-dashed border-neutral-200 py-12 text-center text-small text-neutral-400">
            Hali eslatmalar yo'q — birinchi dori eslatmasini qo'shing
          </div>
        )}
      </section>

      <Sheet open={open} onClose={() => setOpen(false)} title="Dori eslatmasi qo'shish">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Dori nomi</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Insulin"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Dozasi</label>
            <input
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="Masalan: 1 tabletka"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Kuniga necha marta</label>
            <div className="mt-2 flex gap-2">
              {frequencyPresets.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => updateTimesCount(n)}
                  className={`h-10 flex-1 rounded-xl border text-sm font-semibold transition ${
                    timesPerDay === n
                      ? "border-primary bg-primary/10 text-primary-dark"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  {n} marta
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Vaqtlari</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {times.map((t, i) => (
                <input
                  key={i}
                  type="time"
                  value={t}
                  onChange={(e) =>
                    setTimes((cur) => cur.map((x, xi) => (xi === i ? e.target.value : x)))
                  }
                  className={inputClass}
                />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full justify-center">
            Qo'shish
          </Button>
        </form>
      </Sheet>
    </div>
  );
}
