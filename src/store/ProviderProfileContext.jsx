import { createContext, useContext, useEffect, useRef, useState } from "react";
import { loadState, saveState } from "./storage";

const KEY = "vitacare.providerProfile";

const ProviderProfileContext = createContext(null);

function seedProfile() {
  return {
    license: { number: "", issuer: "", expiry: "", fileName: "" },
    certificates: [],
    skills: [],
    workZone: { radiusKm: 5, days: ["Dush", "Sesh", "Chor", "Pay", "Juma"], hoursFrom: "09:00", hoursTo: "20:00" },
    extraCities: [],
    bank: { iban: "", bankName: "", tin: "", taxType: "Yakka tartibdagi tadbirkor" },
    tariffs: {},
    hourlyRate: 100000,
    insuranceCoveragePercent: 80,
    availability: { online: true, offToday: false, autoReply: "" },
    branches: [],
    delivery: { defaultEta: "30 daqiqa", couriers: [] },
    drugAlerts: { qrScanner: true, autoVerify: true, expiryWarnings: true },
    contact: { website: "" },
    hours: { weekday: "09:00-20:00", weekend: "10:00-18:00", holidayNote: "" },
    prescriptionAllowed: true,
    acceptsCash: false,
  };
}

function branchNumber(id) {
  const match = /(\d+)$/.exec(id ?? "");
  return match ? Number(match[1]) : 0;
}

export function ProviderProfileProvider({ children }) {
  const [byPhone, setByPhone] = useState(() => loadState(KEY, {}));

  useEffect(() => saveState(KEY, byPhone), [byPhone]);

  const branchCounter = useRef();
  if (branchCounter.current === undefined) {
    branchCounter.current = Object.values(byPhone).reduce(
      (max, p) => Math.max(max, ...(p.branches ?? []).map((b) => branchNumber(b.id))),
      100
    );
  }

  function ensure(phone) {
    return byPhone[phone] ?? seedProfile();
  }

  function getProviderProfile(phone) {
    return phone ? ensure(phone) : seedProfile();
  }

  function updateProviderProfile(phone, patch) {
    if (!phone) return;
    setByPhone((cur) => ({ ...cur, [phone]: { ...ensure(phone), ...patch } }));
  }

  function updateNested(phone, field, patch) {
    if (!phone) return;
    setByPhone((cur) => {
      const p = ensure(phone);
      return { ...cur, [phone]: { ...p, [field]: { ...p[field], ...patch } } };
    });
  }

  function addListItem(phone, field, value) {
    if (!phone || !value?.trim()) return;
    setByPhone((cur) => {
      const p = ensure(phone);
      return { ...cur, [phone]: { ...p, [field]: [...p[field], value.trim()] } };
    });
  }

  function removeListItem(phone, field, value) {
    if (!phone) return;
    setByPhone((cur) => {
      const p = ensure(phone);
      return { ...cur, [phone]: { ...p, [field]: p[field].filter((v) => v !== value) } };
    });
  }

  function toggleWorkDay(phone, day) {
    if (!phone) return;
    setByPhone((cur) => {
      const p = ensure(phone);
      const days = p.workZone.days.includes(day) ? p.workZone.days.filter((d) => d !== day) : [...p.workZone.days, day];
      return { ...cur, [phone]: { ...p, workZone: { ...p.workZone, days } } };
    });
  }

  function setTariff(phone, serviceId, price) {
    if (!phone) return;
    setByPhone((cur) => {
      const p = ensure(phone);
      return { ...cur, [phone]: { ...p, tariffs: { ...p.tariffs, [serviceId]: price } } };
    });
  }

  function addCertificate(phone, cert) {
    if (!phone) return;
    setByPhone((cur) => {
      const p = ensure(phone);
      return { ...cur, [phone]: { ...p, certificates: [...p.certificates, cert] } };
    });
  }

  function removeCertificate(phone, name) {
    if (!phone) return;
    setByPhone((cur) => {
      const p = ensure(phone);
      return { ...cur, [phone]: { ...p, certificates: p.certificates.filter((c) => c.name !== name) } };
    });
  }

  function addBranch(phone, branch) {
    if (!phone) return;
    branchCounter.current += 1;
    const created = { id: `FIL-${branchCounter.current}`, ...branch };
    setByPhone((cur) => {
      const p = ensure(phone);
      return { ...cur, [phone]: { ...p, branches: [...p.branches, created] } };
    });
  }

  function removeBranch(phone, id) {
    if (!phone) return;
    setByPhone((cur) => {
      const p = ensure(phone);
      return { ...cur, [phone]: { ...p, branches: p.branches.filter((b) => b.id !== id) } };
    });
  }

  function addCourier(phone, name) {
    if (!phone || !name?.trim()) return;
    setByPhone((cur) => {
      const p = ensure(phone);
      return { ...cur, [phone]: { ...p, delivery: { ...p.delivery, couriers: [...p.delivery.couriers, name.trim()] } } };
    });
  }

  function removeCourier(phone, name) {
    if (!phone) return;
    setByPhone((cur) => {
      const p = ensure(phone);
      return {
        ...cur,
        [phone]: { ...p, delivery: { ...p.delivery, couriers: p.delivery.couriers.filter((c) => c !== name) } },
      };
    });
  }

  return (
    <ProviderProfileContext.Provider
      value={{
        getProviderProfile,
        updateProviderProfile,
        updateNested,
        addListItem,
        removeListItem,
        toggleWorkDay,
        setTariff,
        addCertificate,
        removeCertificate,
        addBranch,
        removeBranch,
        addCourier,
        removeCourier,
      }}
    >
      {children}
    </ProviderProfileContext.Provider>
  );
}

export function useProviderProfile() {
  const ctx = useContext(ProviderProfileContext);
  if (!ctx) throw new Error("useProviderProfile must be used within ProviderProfileProvider");
  return ctx;
}
