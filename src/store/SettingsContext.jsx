import { createContext, useContext, useEffect, useState } from "react";
import { loadState, saveState } from "./storage";

const KEY = "vitacare.settings";

const DEFAULT_SETTINGS = {
  notifications: { push: true, sms: true, emailDigest: false },
  privacy: { profileVisibility: "hamma", autoDeleteDays: 90 },
  language: "uz",
  theme: "kun",
  twoFactorEnabled: false,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [byPhone, setByPhone] = useState(() => loadState(KEY, {}));

  useEffect(() => saveState(KEY, byPhone), [byPhone]);

  function getSettings(phone) {
    return { ...DEFAULT_SETTINGS, ...(phone ? byPhone[phone] : null) };
  }

  function updateSettings(phone, patch) {
    if (!phone) return;
    setByPhone((cur) => ({
      ...cur,
      [phone]: { ...DEFAULT_SETTINGS, ...cur[phone], ...patch },
    }));
  }

  return (
    <SettingsContext.Provider value={{ getSettings, updateSettings }}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
