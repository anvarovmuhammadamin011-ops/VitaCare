import { createContext, useContext, useEffect, useState } from "react";
import { loadState, saveState } from "./storage";
import { seedOrders } from "../data/mockData";
import { useAuth } from "./AuthContext";

const KEY = "vitacare.orders";

const OrdersContext = createContext(null);

let counter = 1000;
function nextId() {
  counter += 1;
  return `BUY-${new Date().getFullYear()}-${counter}`;
}

export function OrdersProvider({ children }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState(() => loadState(KEY, seedOrders));

  useEffect(() => saveState(KEY, orders), [orders]);

  function addOrder(order) {
    const created = { id: nextId(), status: "yangi", ...order };
    setOrders((cur) => [created, ...cur]);
    return created;
  }

  function cancelOrder(id, reason = "Foydalanuvchi tomonidan bekor qilindi") {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, status: "bekor qilindi", reason } : o)));
  }

  function rateOrder(id, rating) {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, rating } : o)));
  }

  // Provider-side lifecycle (called by a Doktor account working through the shared queue).
  function acceptOrder(id, provider) {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, status: "qabul qilingan", provider } : o)));
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

  // A patient only sees orders booked under their own name — the shared queue itself
  // (used by useDoctor()) stays unfiltered so any doctor can see the whole marketplace.
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
        rateOrder,
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
