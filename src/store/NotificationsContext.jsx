import { createContext, useContext, useEffect, useState } from "react";
import { loadState, saveState } from "./storage";

const KEY = "vitacare.notifications";
const MAX_STORED = 200;

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [items, setItems] = useState(() => loadState(KEY, []));

  useEffect(() => saveState(KEY, items), [items]);

  // Picks up notifications pushed from another tab of the same browser
  // (e.g. a doctor accepts an order in one tab while the patient's tab is open in another).
  useEffect(() => {
    function onStorage(e) {
      if (e.key === KEY) setItems(loadState(KEY, []));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function pushNotification(toName, message) {
    if (!toName || !message) return;
    const entry = {
      id: `NTF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      toName,
      message,
      createdAt: Date.now(),
      read: false,
    };
    setItems((cur) => [entry, ...cur].slice(0, MAX_STORED));
  }

  function notificationsFor(name) {
    return name ? items.filter((n) => n.toName === name) : [];
  }

  function unreadCountFor(name) {
    return name ? items.filter((n) => n.toName === name && !n.read).length : 0;
  }

  function markAllReadFor(name) {
    if (!name) return;
    setItems((cur) => cur.map((n) => (n.toName === name && !n.read ? { ...n, read: true } : n)));
  }

  return (
    <NotificationsContext.Provider
      value={{ pushNotification, notificationsFor, unreadCountFor, markAllReadFor }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
