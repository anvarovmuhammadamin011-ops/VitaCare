import { createContext, useContext, useEffect, useRef, useState } from "react";
import { loadState, saveState } from "./storage";
import { userProfile } from "../data/mockData";

const KEY = "vitacare.patientHealth";
const MAX_VITAL_POINTS = 20;

const PatientHealthContext = createContext(null);

function seedHealth() {
  const [bloodType, rhFactor] = (userProfile.bloodType ?? "").split(" ");
  return {
    chronic: userProfile.chronic ? [userProfile.chronic] : [],
    allergies: userProfile.allergy ? [userProfile.allergy] : [],
    surgeries: [],
    bloodType: bloodType ?? "",
    rhFactor: rhFactor ?? "",
    height: null,
    weight: null,
    vitals: { bloodPressure: [], sugar: [] },
    addresses: userProfile.addresses.map((a, i) => ({ id: `ADDR-${i + 1}`, ...a })),
    cards: userProfile.cards.map((c, i) => ({ id: `CARD-${i + 1}`, ...c })),
    insuranceBalance: 850000,
  };
}

function addrNumber(id) {
  const match = /(\d+)$/.exec(id ?? "");
  return match ? Number(match[1]) : 0;
}

export function PatientHealthProvider({ children }) {
  const [byPhone, setByPhone] = useState(() => loadState(KEY, {}));

  useEffect(() => saveState(KEY, byPhone), [byPhone]);

  const addrCounter = useRef();
  const cardCounter = useRef();
  if (addrCounter.current === undefined) {
    addrCounter.current = Object.values(byPhone).reduce(
      (max, h) => Math.max(max, ...(h.addresses ?? []).map((a) => addrNumber(a.id))),
      10
    );
  }
  if (cardCounter.current === undefined) {
    cardCounter.current = Object.values(byPhone).reduce(
      (max, h) => Math.max(max, ...(h.cards ?? []).map((c) => addrNumber(c.id))),
      10
    );
  }

  function getHealth(phone) {
    if (!phone) return seedHealth();
    return byPhone[phone] ?? seedHealth();
  }

  function ensure(phone) {
    return byPhone[phone] ?? seedHealth();
  }

  function updateHealth(phone, patch) {
    if (!phone) return;
    setByPhone((cur) => ({ ...cur, [phone]: { ...ensure(phone), ...patch } }));
  }

  function addListItem(phone, field, value) {
    if (!phone || !value?.trim()) return;
    setByPhone((cur) => {
      const h = ensure(phone);
      return { ...cur, [phone]: { ...h, [field]: [...h[field], value.trim()] } };
    });
  }

  function removeListItem(phone, field, value) {
    if (!phone) return;
    setByPhone((cur) => {
      const h = ensure(phone);
      return { ...cur, [phone]: { ...h, [field]: h[field].filter((v) => v !== value) } };
    });
  }

  function addVital(phone, type, value, extra = {}) {
    if (!phone || !value) return;
    setByPhone((cur) => {
      const h = ensure(phone);
      const history = [...h.vitals[type], { value, at: Date.now(), source: "patient", ...extra }].slice(
        -MAX_VITAL_POINTS
      );
      return { ...cur, [phone]: { ...h, vitals: { ...h.vitals, [type]: history } } };
    });
  }

  // Read-only snapshot for admin-side aggregate views (e.g. blood pressure distribution).
  function getAllPatientHealth() {
    return byPhone;
  }

  function addAddress(phone, address) {
    if (!phone) return;
    addrCounter.current += 1;
    const created = { id: `ADDR-${addrCounter.current}`, primary: false, ...address };
    setByPhone((cur) => {
      const h = ensure(phone);
      return { ...cur, [phone]: { ...h, addresses: [...h.addresses, created] } };
    });
  }

  function updateAddress(phone, id, patch) {
    if (!phone) return;
    setByPhone((cur) => {
      const h = ensure(phone);
      return { ...cur, [phone]: { ...h, addresses: h.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)) } };
    });
  }

  function removeAddress(phone, id) {
    if (!phone) return;
    setByPhone((cur) => {
      const h = ensure(phone);
      return { ...cur, [phone]: { ...h, addresses: h.addresses.filter((a) => a.id !== id) } };
    });
  }

  function setPrimaryAddress(phone, id) {
    if (!phone) return;
    setByPhone((cur) => {
      const h = ensure(phone);
      return { ...cur, [phone]: { ...h, addresses: h.addresses.map((a) => ({ ...a, primary: a.id === id })) } };
    });
  }

  function addCard(phone, card) {
    if (!phone) return;
    cardCounter.current += 1;
    const created = { id: `CARD-${cardCounter.current}`, primary: false, ...card };
    setByPhone((cur) => {
      const h = ensure(phone);
      return { ...cur, [phone]: { ...h, cards: [...h.cards, created] } };
    });
  }

  function removeCard(phone, id) {
    if (!phone) return;
    setByPhone((cur) => {
      const h = ensure(phone);
      return { ...cur, [phone]: { ...h, cards: h.cards.filter((c) => c.id !== id) } };
    });
  }

  function setPrimaryCard(phone, id) {
    if (!phone) return;
    setByPhone((cur) => {
      const h = ensure(phone);
      return { ...cur, [phone]: { ...h, cards: h.cards.map((c) => ({ ...c, primary: c.id === id })) } };
    });
  }

  return (
    <PatientHealthContext.Provider
      value={{
        getHealth,
        updateHealth,
        addListItem,
        removeListItem,
        addVital,
        getAllPatientHealth,
        addAddress,
        updateAddress,
        removeAddress,
        setPrimaryAddress,
        addCard,
        removeCard,
        setPrimaryCard,
      }}
    >
      {children}
    </PatientHealthContext.Provider>
  );
}

export function usePatientHealth() {
  const ctx = useContext(PatientHealthContext);
  if (!ctx) throw new Error("usePatientHealth must be used within PatientHealthProvider");
  return ctx;
}
