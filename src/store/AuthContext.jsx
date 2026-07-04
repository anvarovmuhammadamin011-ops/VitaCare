import { createContext, useContext, useEffect, useState } from "react";
import { loadState, saveState } from "./storage";

const ACCOUNTS_KEY = "vitacare.accounts";
const SESSION_KEY = "vitacare.session";

const AuthContext = createContext(null);

function generateOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// Temporary dev shortcut: one persistent demo account per role, so switching
// roles while testing doesn't require registering/verifying each time.
const DEMO_ACCOUNTS = {
  foydalanuvchi: {
    phone: "+998 90 000-00-01",
    password: "demo123",
    firstName: "Test",
    lastName: "Foydalanuvchi",
    age: 28,
    role: "foydalanuvchi",
  },
  doktor: {
    phone: "+998 90 000-00-02",
    password: "demo123",
    firstName: "Test",
    lastName: "Doktor",
    age: 40,
    role: "doktor",
    specialty: "Terapevt",
    experienceYears: 10,
    serviceCity: "Toshkent",
    certificateFileName: "sertifikat.pdf",
    bankCard: "9860 1234 5678 0002",
    verified: true,
  },
  aptekachi: {
    phone: "+998 90 000-00-03",
    password: "demo123",
    firstName: "Test",
    lastName: "Aptekachi",
    age: 35,
    role: "aptekachi",
    pharmacyName: "Demo Pharmacy",
    pharmacyAddress: "Toshkent shahri, Amir Temur ko'chasi, 1-uy",
    certificateFileName: "litsenziya.pdf",
    bankCard: "9860 1234 5678 0003",
    verified: true,
  },
  admin: {
    phone: "+998 90 000-00-04",
    password: "demo123",
    firstName: "Test",
    lastName: "Admin",
    age: 33,
    role: "admin",
    adminLevel: "super",
    verified: true,
  },
};

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
    if (found.suspended) return { ok: false, error: "Hisobingiz vaqtincha to'xtatilgan. Qo'llab-quvvatlash xizmatiga murojaat qiling" };
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

  function updateProfile(patch) {
    setAccounts((cur) => cur.map((a) => (a.phone === sessionPhone ? { ...a, ...patch } : a)));
  }

  // Account deletion has a 72h grace period during which the user can still cancel it —
  // enforced by the interval effect below rather than deleting immediately.
  function requestAccountDeletion() {
    setAccounts((cur) =>
      cur.map((a) => (a.phone === sessionPhone ? { ...a, deletionRequestedAt: Date.now() } : a))
    );
  }

  function cancelAccountDeletion() {
    setAccounts((cur) =>
      cur.map((a) => (a.phone === sessionPhone ? { ...a, deletionRequestedAt: undefined } : a))
    );
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const expired = accounts.filter(
        (a) => a.deletionRequestedAt && now - a.deletionRequestedAt >= 72 * 60 * 60 * 1000
      );
      if (!expired.length) return;
      const expiredPhones = new Set(expired.map((a) => a.phone));
      setAccounts((cur) => cur.filter((a) => !expiredPhones.has(a.phone)));
      if (sessionPhone && expiredPhones.has(sessionPhone)) setSessionPhone(null);
    }, 30000);
    return () => clearInterval(interval);
  }, [accounts, sessionPhone]);

  // Admin-scoped actions operate on an arbitrary account by phone (the admin isn't
  // logged in as that account), unlike the session-scoped functions above.
  function adminSetVerified(phone, verified) {
    setAccounts((cur) => cur.map((a) => (a.phone === phone ? { ...a, verified } : a)));
  }

  function adminSetSuspended(phone, suspended) {
    setAccounts((cur) => cur.map((a) => (a.phone === phone ? { ...a, suspended } : a)));
  }

  function adminDeleteAccount(phone) {
    setAccounts((cur) => cur.filter((a) => a.phone !== phone));
    if (sessionPhone === phone) setSessionPhone(null);
  }

  function quickLogin(role) {
    const template = DEMO_ACCOUNTS[role];
    if (!template) return;
    setAccounts((cur) => {
      if (cur.some((a) => a.phone === template.phone)) return cur;
      return [...cur, { ...template, createdAt: new Date().toISOString() }];
    });
    setSessionPhone(template.phone);
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
        updateProfile,
        requestAccountDeletion,
        cancelAccountDeletion,
        adminSetVerified,
        adminSetSuspended,
        adminDeleteAccount,
        quickLogin,
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
