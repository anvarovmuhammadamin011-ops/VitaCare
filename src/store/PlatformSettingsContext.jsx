import { createContext, useContext, useEffect, useState } from "react";
import { loadState, saveState } from "./storage";
import {
  DOCTOR_COMMISSION_RATE,
  PHARMACY_PRESCRIPTION_COMMISSION_RATE,
  PHARMACY_PLAIN_COMMISSION_RATE,
} from "../data/mockData";

const KEY = "vitacare.platformSettings";

const DEFAULTS = {
  commission: {
    doctor: DOCTOR_COMMISSION_RATE,
    pharmacyPrescription: PHARMACY_PRESCRIPTION_COMMISSION_RATE,
    pharmacyPlain: PHARMACY_PLAIN_COMMISSION_RATE,
    ambulance: 0.1,
  },
  bpThresholds: {
    elevatedSys: 120,
    stage1Sys: 130,
    stage1Dia: 80,
    stage2Sys: 140,
    stage2Dia: 90,
    crisisSys: 180,
    crisisDia: 120,
  },
  demoMode: true,
  paymentGateways: { click: true, payme: true, stripe: false },
  notificationChannels: { email: true, sms: true, push: true },
};

const PlatformSettingsContext = createContext(null);

export function PlatformSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => loadState(KEY, DEFAULTS));

  useEffect(() => saveState(KEY, settings), [settings]);

  function updateCommission(patch) {
    setSettings((cur) => ({ ...cur, commission: { ...cur.commission, ...patch } }));
  }

  function updateBpThresholds(patch) {
    setSettings((cur) => ({ ...cur, bpThresholds: { ...cur.bpThresholds, ...patch } }));
  }

  function updatePaymentGateways(patch) {
    setSettings((cur) => ({ ...cur, paymentGateways: { ...cur.paymentGateways, ...patch } }));
  }

  function updateNotificationChannels(patch) {
    setSettings((cur) => ({ ...cur, notificationChannels: { ...cur.notificationChannels, ...patch } }));
  }

  function setDemoMode(demoMode) {
    setSettings((cur) => ({ ...cur, demoMode }));
  }

  return (
    <PlatformSettingsContext.Provider
      value={{
        settings,
        updateCommission,
        updateBpThresholds,
        updatePaymentGateways,
        updateNotificationChannels,
        setDemoMode,
      }}
    >
      {children}
    </PlatformSettingsContext.Provider>
  );
}

export function usePlatformSettings() {
  const ctx = useContext(PlatformSettingsContext);
  if (!ctx) throw new Error("usePlatformSettings must be used within PlatformSettingsProvider");
  return ctx;
}
