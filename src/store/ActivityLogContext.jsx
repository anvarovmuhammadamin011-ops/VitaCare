import { createContext, useContext, useEffect, useState } from "react";
import { loadState, saveState } from "./storage";

const KEY = "vitacare.activityLog";
const MAX_PER_ACTOR = 50;

const ActivityLogContext = createContext(null);

export function ActivityLogProvider({ children }) {
  const [items, setItems] = useState(() => loadState(KEY, []));

  useEffect(() => saveState(KEY, items), [items]);

  function logActivity(actorName, action) {
    if (!actorName || !action) return;
    const entry = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      actorName,
      action,
      createdAt: Date.now(),
    };
    setItems((cur) => [...cur, entry].slice(-500));
  }

  function activityFor(actorName) {
    return items.filter((e) => e.actorName === actorName).slice(-MAX_PER_ACTOR).reverse();
  }

  return (
    <ActivityLogContext.Provider value={{ logActivity, activityFor }}>{children}</ActivityLogContext.Provider>
  );
}

export function useActivityLog() {
  const ctx = useContext(ActivityLogContext);
  if (!ctx) throw new Error("useActivityLog must be used within ActivityLogProvider");
  return ctx;
}
