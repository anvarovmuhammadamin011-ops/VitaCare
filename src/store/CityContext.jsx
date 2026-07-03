import { createContext, useContext, useEffect, useState } from "react";
import { loadState, saveState } from "./storage";
import { defaultCity } from "../data/regions";

const KEY = "vitacare.city";

const CityContext = createContext(null);

export function CityProvider({ children }) {
  const [city, setCity] = useState(() => loadState(KEY, defaultCity));

  useEffect(() => saveState(KEY, city), [city]);

  return <CityContext.Provider value={{ city, setCity }}>{children}</CityContext.Provider>;
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCity must be used within CityProvider");
  return ctx;
}
