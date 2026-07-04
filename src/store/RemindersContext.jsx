import { createContext, useContext, useEffect, useRef, useState } from "react";
import { loadState, saveState } from "./storage";
import { seedReminders } from "../data/mockData";
import { useToast } from "./ToastContext";

const KEY = "vitacare.reminders";
const LOG_KEY = "vitacare.reminderLog";

const RemindersContext = createContext(null);

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function reminderNumber(id) {
  const match = /(\d+)$/.exec(id ?? "");
  return match ? Number(match[1]) : 0;
}

export function RemindersProvider({ children }) {
  const { notify } = useToast();
  const [reminders, setReminders] = useState(() => loadState(KEY, seedReminders));
  // log: { "2026-07-04": { "REM-1|09:00": "taken" | "skipped" } }
  const [log, setLog] = useState(() => loadState(LOG_KEY, {}));

  const counterRef = useRef();
  if (counterRef.current === undefined) {
    counterRef.current = reminders.reduce((max, r) => Math.max(max, reminderNumber(r.id)), 0);
  }

  useEffect(() => saveState(KEY, reminders), [reminders]);
  useEffect(() => saveState(LOG_KEY, log), [log]);

  useEffect(() => {
    const interval = setInterval(() => {
      const hhmm = nowHHMM();
      const day = todayKey();
      reminders.forEach((r) => {
        if (!r.active || !r.times.includes(hhmm)) return;
        const doseKey = `${r.id}|${hhmm}`;
        if (log[day]?.[doseKey]) return;

        notify(`💊 ${r.name} vaqti keldi! (${r.dosage})`);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(200);
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification(`${r.name} vaqti keldi!`, { body: r.dosage });
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [reminders, log, notify]);

  function addReminder(reminder) {
    counterRef.current += 1;
    const created = { id: `REM-${counterRef.current}`, active: true, ...reminder };
    setReminders((cur) => [created, ...cur]);
    return created;
  }

  function removeReminder(id) {
    setReminders((cur) => cur.filter((r) => r.id !== id));
  }

  function markDose(reminderId, time, status) {
    const day = todayKey();
    setLog((cur) => ({ ...cur, [day]: { ...(cur[day] ?? {}), [`${reminderId}|${time}`]: status } }));
  }

  function requestNotificationPermission() {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  const today = todayKey();
  const todayLog = log[today] ?? {};
  const activeReminders = reminders.filter((r) => r.active);
  const todayDoses = activeReminders.flatMap((r) => r.times.map((t) => `${r.id}|${t}`));
  const takenCount = todayDoses.filter((k) => todayLog[k] === "taken").length;
  const complianceRate = todayDoses.length ? Math.round((takenCount / todayDoses.length) * 100) : 100;

  return (
    <RemindersContext.Provider
      value={{
        reminders: activeReminders,
        todayLog,
        log,
        addReminder,
        removeReminder,
        markDose,
        requestNotificationPermission,
        complianceRate,
        takenCount,
        totalToday: todayDoses.length,
      }}
    >
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders() {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error("useReminders must be used within RemindersProvider");
  return ctx;
}
