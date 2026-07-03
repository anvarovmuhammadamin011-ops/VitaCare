import { createContext, useContext } from "react";
import { seedPayouts, DOCTOR_COMMISSION_RATE } from "../data/mockData";
import { useOrders } from "./OrdersContext";
import { useAuth } from "./AuthContext";

const DoctorContext = createContext(null);

export function DoctorProvider({ children }) {
  const { user } = useAuth();
  const { orders, acceptOrder: acceptShared, rejectOrder, startTrip, completeOrder } = useOrders();

  function acceptOrder(id) {
    const provider = user ? `Dr. ${user.firstName} ${user.lastName}` : undefined;
    acceptShared(id, provider);
  }

  const incoming = orders.filter((o) => o.status === "yangi");
  const active = orders.filter((o) => o.status === "qabul qilingan" || o.status === "yolda");
  const completed = orders.filter((o) => o.status === "tugallandi");
  const cancelled = orders.filter((o) => o.status === "bekor qilindi");

  const grossEarnings = completed.reduce((sum, o) => sum + o.price, 0);
  const commission = Math.round(grossEarnings * DOCTOR_COMMISSION_RATE);
  const netEarnings = grossEarnings - commission;

  const reviewed = completed.filter((o) => o.rating);
  const avgRating = reviewed.length
    ? (reviewed.reduce((sum, o) => sum + o.rating, 0) / reviewed.length).toFixed(1)
    : null;

  return (
    <DoctorContext.Provider
      value={{
        orders,
        incoming,
        active,
        completed,
        cancelled,
        acceptOrder,
        rejectOrder,
        startTrip,
        completeOrder,
        grossEarnings,
        commission,
        netEarnings,
        avgRating,
        reviewCount: reviewed.length,
        payouts: seedPayouts,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctor() {
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error("useDoctor must be used within DoctorProvider");
  return ctx;
}
