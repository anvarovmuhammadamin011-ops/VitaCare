import { createContext, useContext, useEffect, useState } from "react";
import { loadState, saveState } from "./storage";
import { seedOrders } from "../data/mockData";

const KEY = "vitacare.orders";

const OrdersContext = createContext(null);

let counter = 1000;
function nextId() {
  counter += 1;
  return `BUY-${new Date().getFullYear()}-${counter}`;
}

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(() => loadState(KEY, seedOrders));

  useEffect(() => saveState(KEY, orders), [orders]);

  function addOrder(order) {
    const created = { id: nextId(), status: "active", ...order };
    setOrders((cur) => [created, ...cur]);
    return created;
  }

  function cancelOrder(id, reason = "Foydalanuvchi tomonidan bekor qilindi") {
    setOrders((cur) =>
      cur.map((o) => (o.id === id ? { ...o, status: "cancelled", reason } : o))
    );
  }

  function completeOrder(id) {
    setOrders((cur) => (cur.map((o) => (o.id === id ? { ...o, status: "completed" } : o))));
  }

  function rateOrder(id, rating) {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, rating } : o)));
  }

  const active = orders.filter((o) => o.status === "active");
  const completed = orders.filter((o) => o.status === "completed");
  const cancelled = orders.filter((o) => o.status === "cancelled");

  return (
    <OrdersContext.Provider
      value={{ orders, active, completed, cancelled, addOrder, cancelOrder, completeOrder, rateOrder }}
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
