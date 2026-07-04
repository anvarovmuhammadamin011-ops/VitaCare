import { createContext, useContext, useEffect, useRef, useState } from "react";
import { loadState, saveState } from "./storage";
import { seedPharmacyOrders, seedPharmacyPayouts, deliveryFleet } from "../data/mockData";
import { usePlatformSettings } from "./PlatformSettingsContext";

const ORDERS_KEY = "vitacare.pharmacyOrders";
const DRUGS_KEY = "vitacare.pharmacyDrugs";

const PharmacyContext = createContext(null);

function drugNumber(id) {
  const match = /(\d+)$/.exec(id ?? "");
  return match ? Number(match[1]) : 0;
}

export function PharmacyProvider({ children }) {
  const { settings } = usePlatformSettings();
  const [orders, setOrders] = useState(() => loadState(ORDERS_KEY, seedPharmacyOrders));
  const [drugs, setDrugs] = useState(() => loadState(DRUGS_KEY, []));

  // Seeded from the highest existing drug number so ids stay unique across reloads.
  const drugCounterRef = useRef();
  if (drugCounterRef.current === undefined) {
    drugCounterRef.current = drugs.reduce((max, d) => Math.max(max, drugNumber(d.id)), 100);
  }
  function nextDrugId() {
    drugCounterRef.current += 1;
    return `DRG-${drugCounterRef.current}`;
  }

  // Same durability reasoning as nextDrugId — seeded from existing order ids.
  const orderCounterRef = useRef();
  if (orderCounterRef.current === undefined) {
    orderCounterRef.current = orders.reduce((max, o) => Math.max(max, drugNumber(o.id)), 5000);
  }
  function nextOrderId() {
    orderCounterRef.current += 1;
    return String(orderCounterRef.current);
  }

  useEffect(() => saveState(ORDERS_KEY, orders), [orders]);
  useEffect(() => saveState(DRUGS_KEY, drugs), [drugs]);

  function addOrder(order) {
    const created = { id: nextOrderId(), status: "yangi", ...order };
    setOrders((cur) => [created, ...cur]);
    return created;
  }

  function acceptOrder(id) {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, status: "tayyorlanmoqda" } : o)));
  }

  function rejectOrder(id, reason = "Apteka tomonidan bekor qilindi") {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, status: "bekor qilindi", reason } : o)));
  }

  function dispatchOrder(id) {
    const deliveryBoy = deliveryFleet[Math.floor(Math.random() * deliveryFleet.length)];
    const eta = `${10 + Math.floor(Math.random() * 20)} minut`;
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, status: "yolda", deliveryBoy, eta } : o)));
    return { deliveryBoy, eta };
  }

  function deliverOrder(id) {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, status: "tugallandi" } : o)));
  }

  function replyToOrder(id, reply) {
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, providerReply: reply } : o)));
  }

  function addDrug(drug) {
    const created = { id: nextDrugId(), ...drug };
    setDrugs((cur) => [created, ...cur]);
    return created;
  }

  function removeDrug(id) {
    setDrugs((cur) => cur.filter((d) => d.id !== id));
  }

  const incoming = orders.filter((o) => o.status === "yangi");
  const active = orders.filter((o) => o.status === "tayyorlanmoqda" || o.status === "yolda");
  const completed = orders.filter((o) => o.status === "tugallandi");
  const cancelled = orders.filter((o) => o.status === "bekor qilindi");

  const prescriptionCompleted = completed.filter((o) => o.hasPrescription);
  const plainCompleted = completed.filter((o) => !o.hasPrescription);

  // Retsept va oddiy zakazlar uchun komissiya alohida stavkada hisoblanadi va
  // oylik hisobotda alohida ko'rsatiladi (PharmacistEarnings.jsx).
  const prescriptionTotal = prescriptionCompleted.reduce((sum, o) => sum + o.total, 0);
  const plainTotal = plainCompleted.reduce((sum, o) => sum + o.total, 0);
  const prescriptionCommission = Math.round(prescriptionTotal * settings.commission.pharmacyPrescription);
  const plainCommission = Math.round(plainTotal * settings.commission.pharmacyPlain);

  const grossEarnings = prescriptionTotal + plainTotal;
  const commission = prescriptionCommission + plainCommission;
  const netEarnings = grossEarnings - commission;

  const reviewed = completed.filter((o) => o.rating);
  const avgRating = reviewed.length
    ? (reviewed.reduce((sum, o) => sum + o.rating, 0) / reviewed.length).toFixed(1)
    : null;

  return (
    <PharmacyContext.Provider
      value={{
        orders,
        incoming,
        active,
        completed,
        cancelled,
        addOrder,
        acceptOrder,
        rejectOrder,
        dispatchOrder,
        deliverOrder,
        replyToOrder,
        drugs,
        addDrug,
        removeDrug,
        grossEarnings,
        commission,
        netEarnings,
        prescriptionCompleted,
        plainCompleted,
        prescriptionTotal,
        plainTotal,
        prescriptionCommission,
        plainCommission,
        avgRating,
        reviewCount: reviewed.length,
        payouts: seedPharmacyPayouts,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
}

export function usePharmacy() {
  const ctx = useContext(PharmacyContext);
  if (!ctx) throw new Error("usePharmacy must be used within PharmacyProvider");
  return ctx;
}
