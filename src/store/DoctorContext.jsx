import { createContext, useContext } from "react";
import { seedPayouts, DOCTOR_COMMISSION_RATE } from "../data/mockData";
import { useOrders } from "./OrdersContext";
import { useAuth } from "./AuthContext";

const DoctorContext = createContext(null);

export function DoctorProvider({ children }) {
  const { user } = useAuth();
  const { orders, acceptOrder: acceptShared, rejectOrder, startTrip, completeOrder } = useOrders();

  // A doctor works requests specifically addressed to them, plus any open
  // (no provider picked yet) request still up for grabs in the shared queue.
  const targeted = user ? orders.filter((o) => o.providerPhone === user.phone) : [];
  const openIncoming = orders.filter((o) => o.status === "yangi" && !o.providerPhone);

  function acceptOrder(id) {
    const order = orders.find((o) => o.id === id);
    const displayName =
      user?.providerKind === "hamshira" ? `${user.firstName} ${user.lastName} (Hamshira)` : `Dr. ${user?.firstName} ${user?.lastName}`;
    const claim =
      order && !order.providerPhone && user ? { provider: displayName, providerPhone: user.phone } : undefined;
    acceptShared(id, claim);
  }

  const incoming = [...targeted.filter((o) => o.status === "yangi"), ...openIncoming];
  const active = targeted.filter((o) => o.status === "qabul qilingan" || o.status === "yolda");
  const completed = targeted.filter((o) => o.status === "tugallandi");
  const cancelled = targeted.filter((o) => o.status === "bekor qilindi");

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
        orders: targeted,
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
