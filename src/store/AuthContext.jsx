import { createContext, useContext, useEffect, useState } from "react";
import { loadState, saveState } from "./storage";

const ACCOUNTS_KEY = "vitacare.accounts";
const SESSION_KEY = "vitacare.session";

const AuthContext = createContext(null);

function generateOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function AuthProvider({ children }) {
  const [accounts, setAccounts] = useState(() => loadState(ACCOUNTS_KEY, []));
  const [sessionPhone, setSessionPhone] = useState(() => loadState(SESSION_KEY, null));
  const [pending, setPending] = useState(null);

  useEffect(() => saveState(ACCOUNTS_KEY, accounts), [accounts]);
  useEffect(() => saveState(SESSION_KEY, sessionPhone), [sessionPhone]);

  const user = sessionPhone ? accounts.find((a) => a.phone === sessionPhone) ?? null : null;

  function login(phone, password) {
    const normalized = phone.trim();
    const found = accounts.find((a) => a.phone === normalized && a.password === password);
    if (!found) return { ok: false, error: "Telefon raqami yoki parol noto'g'ri" };
    setSessionPhone(found.phone);
    return { ok: true };
  }

  function logout() {
    setSessionPhone(null);
  }

  function startRegistration(data) {
    const phone = data.phone.trim();
    if (accounts.some((a) => a.phone === phone)) {
      return { ok: false, error: "Bu telefon raqami bilan hisob allaqachon mavjud" };
    }
    const otp = generateOtp();
    setPending({ ...data, phone, otp });
    return { ok: true, otp, phone };
  }

  function resendOtp() {
    if (!pending) return null;
    const otp = generateOtp();
    setPending((cur) => ({ ...cur, otp }));
    return otp;
  }

  function verifyOtp(code) {
    if (!pending) return { ok: false, error: "Avval ro'yxatdan o'ting" };
    if (code !== pending.otp) return { ok: false, error: "Tasdiqlash kodi noto'g'ri" };
    const { otp: _otp, ...account } = pending;
    setAccounts((cur) => [...cur, account]);
    setSessionPhone(account.phone);
    setPending(null);
    return { ok: true };
  }

  function cancelRegistration() {
    setPending(null);
  }

  function markVerified() {
    setAccounts((cur) => cur.map((a) => (a.phone === sessionPhone ? { ...a, verified: true } : a)));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accounts,
        login,
        logout,
        startRegistration,
        resendOtp,
        verifyOtp,
        cancelRegistration,
        markVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
