import { createContext, useContext, useEffect, useRef, useState } from "react";
import { loadState, saveState } from "./storage";
import { seedOrders } from "../data/mockData";
import { useAuth } from "./AuthContext";

const KEY = "vitacare.orders";

const OrdersContext = createContext(null);

function orderNumber(id) {
  const match = /(\d+)$/.exec(id ?? "");
  return match ? Number(match[1]) : 0;
}

export function OrdersProvider({ children }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState(() => loadState(KEY, seedOrders));

  // Seeded from the highest existing order number so ids stay unique across reloads —
  // a plain module-level counter resets on every reload and can collide with ids
  // already persisted in localStorage from a prior session.
  const counterRef = useRef();
  if (counterRef.current === undefined) {
    counterRef.current = orders.reduce((max, o) => Math.max(max, orderNumber(o.id)), 1000);
  }
  function nextId() {
    counterRef.current += 1;
    return `BUY-${new Date().getFullYear()}-${counterRef.current}`;
  }

  useEffect(() => saveState(KEY, orders), [orders]);

  // Seed (non-account) providers can't log in to accept a request themselves, so their
  // confirmation is simulated via a stored `confirmAt` timestamp rather than a live
  // in-memory timer — this survives reloads instead of silently dying on one.
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setOrders((cur) => {
        let changed = false;
        const next = cur.map((o) => {
          if (o.status === "yangi" && o.providerType === "seed" && o.confirmAt && o.confirmAt <= now) {
            changed = true;
            return { ...o, status: "qabul qilingan" };
          }
          return o;
        });
        return changed ? next : cur;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function addOrder(order) {
    const created = { id: nextId(), status: "yangi", createdAt: Date.now(), ...order };
    setOrders((cur) => [created, ...cur]);
    return created;
  }

  // Free cancellation within 24h of booking, per the platform's cancellation policy.
  // Orders without a createdAt (seed/demo data) are treated as outside the window.
  function canFreeCancel(order) {
    return Boolean(order?.createdAt && Date.now() - order.createdAt <= 24 * 60 * 60 * 1000);
  }

  function cancelOrder(id, reason = "Foydalanuvchi tomonidan bekor qilindi") {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, status: "bekor qilindi", reason } : o)));
  }

  function rateOrder(id, rating, extra = {}) {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, rating, ...extra } : o)));
  }

  function replyToOrder(id, reply) {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, providerReply: reply } : o)));
  }

  // Provider-side lifecycle. Most requests already have a provider chosen by the
  // patient at booking time, so accepting just confirms them. Open/unassigned
  // requests (no provider picked) get claimed by whoever accepts first.
  function acceptOrder(id, claim) {
    setOrders((cur) =>
      cur.map((o) => (o.id === id ? { ...o, status: "qabul qilingan", ...(claim ?? {}) } : o))
    );
  }

  function rejectOrder(id, reason = "Doktor tomonidan bekor qilindi") {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, status: "bekor qilindi", reason } : o)));
  }

  function startTrip(id) {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, status: "yolda" } : o)));
  }

  function completeOrder(id) {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, status: "tugallandi" } : o)));
  }

  // A patient only sees orders booked under their own name. useDoctor() filters the
  // raw `orders` array further, to just the requests addressed to that provider.
  const myName = user ? `${user.firstName} ${user.lastName}` : null;
  const mine = myName ? orders.filter((o) => o.patientName === myName) : [];

  const active = mine.filter((o) => o.status === "yangi" || o.status === "qabul qilingan" || o.status === "yolda");
  const completed = mine.filter((o) => o.status === "tugallandi");
  const cancelled = mine.filter((o) => o.status === "bekor qilindi");

  return (
    <OrdersContext.Provider
      value={{
        orders,
        active,
        completed,
        cancelled,
        addOrder,
        cancelOrder,
        canFreeCancel,
        rateOrder,
        replyToOrder,
        acceptOrder,
        rejectOrder,
        startTrip,
        completeOrder,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
