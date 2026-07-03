import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pill, Stethoscope, UserRound, Check, MessageSquareText } from "lucide-react";
import Button from "../components/ui/Button";
import { useToast } from "../store/ToastContext";
import { useAuth } from "../store/AuthContext";
import { accountRoles } from "../data/roles";

const roleIcons = { Pill, Stethoscope, UserRound };

const inputClass =
  "mt-1 h-12 w-full rounded-xl border border-neutral-200 px-3 text-body focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "text-label font-semibold text-neutral-500";

export default function Register() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { startRegistration, verifyOtp, resendOtp, cancelRegistration } = useAuth();

  const [step, setStep] = useState("details");
  const [otp, setOtp] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(null);

  function handleDetailsSubmit(e) {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !age || !phone.trim() || !password) {
      notify("Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    const ageNum = Number(age);
    if (!Number.isInteger(ageNum) || ageNum < 18 || ageNum > 100) {
      notify("Yoshni to'g'ri kiriting (18-100)");
      return;
    }
    if (password.length < 6) {
      notify("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (password !== confirmPassword) {
      notify("Parollar mos kelmadi");
      return;
    }

    setStep("role");
  }

  function handleRoleSubmit(e) {
    e.preventDefault();

    if (!role) {
      notify("Yo'nalishni tanlang: Foydalanuvchi, Aptekachi yoki Doktor");
      return;
    }

    const res = startRegistration({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age: Number(age),
      phone: phone.trim(),
      password,
      role,
      createdAt: new Date().toISOString(),
    });

    if (!res.ok) {
      notify(res.error);
      return;
    }

    notify(`SMS kod ${phone} raqamiga yuborildi (test uchun): ${res.otp}`);
    setStep("otp");
  }

  function handleOtpSubmit(e) {
    e.preventDefault();
    if (otp.trim().length !== 4) {
      notify("4 xonali kodni kiriting");
      return;
    }
    const res = verifyOtp(otp.trim());
    if (!res.ok) {
      notify(res.error);
      return;
    }
    notify("Hisob tasdiqlandi — xush kelibsiz!");
    navigate("/");
  }

  function handleResend() {
    const newOtp = resendOtp();
    if (newOtp) notify(`Yangi kod yuborildi (test uchun): ${newOtp}`);
  }

  function handleBackFromOtp() {
    cancelRegistration();
    setOtp("");
    setStep("role");
  }

  if (step === "otp") {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col justify-center px-6">
        <button
          onClick={handleBackFromOtp}
          className="mb-6 flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft size={16} /> Orqaga
        </button>

        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary-dark">
            <MessageSquareText size={24} />
          </span>
          <h1 className="text-h2 font-bold text-neutral-900">Kodni tasdiqlang</h1>
          <p className="text-small text-neutral-500">{phone} raqamiga yuborilgan 4 xonali kodni kiriting</p>
        </div>

        <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            placeholder="0000"
            className={`${inputClass} text-center text-2xl font-bold tracking-[0.5em]`}
          />
          <Button type="submit" className="w-full justify-center">
            Tasdiqlash
          </Button>
          <button
            type="button"
            onClick={handleResend}
            className="text-center text-sm font-medium text-primary hover:underline"
          >
            Kodni qayta yuborish
          </button>
        </form>
      </div>
    );
  }

  if (step === "role") {
    return (
      <div className="flex flex-col gap-6 pb-10">
        <header className="px-4 pb-2 pt-6">
          <button
            onClick={() => setStep("details")}
            className="mb-4 flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-800"
          >
            <ArrowLeft size={16} /> Orqaga
          </button>
          <h1 className="text-h2 font-bold text-neutral-900">Yo'nalishni tanlang</h1>
          <p className="mt-1 text-small text-neutral-500">Hisobingiz qaysi soha uchun ekanligini belgilang</p>
        </header>

        <form onSubmit={handleRoleSubmit} className="flex flex-col gap-5 px-4">
          <div className="grid grid-cols-1 gap-2">
            {accountRoles.map((r) => {
              const RoleIcon = roleIcons[r.icon];
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex items-center gap-3 rounded-card border p-3 text-left transition ${
                    active ? "border-primary bg-primary/10" : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                      active ? "bg-primary text-white" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    <RoleIcon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-bold ${active ? "text-primary-dark" : "text-neutral-900"}`}>
                      {r.label}
                    </span>
                    <span className="block text-label text-neutral-500">{r.desc}</span>
                  </span>
                  {active && <Check size={18} className="shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>

          <Button type="submit" className="w-full justify-center">
            Davom etish
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <header className="px-4 pb-2 pt-6">
        <Link
          to="/kirish"
          className="mb-4 flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft size={16} /> Orqaga
        </Link>
        <h1 className="text-h2 font-bold text-neutral-900">Ro'yxatdan o'tish</h1>
        <p className="mt-1 text-small text-neutral-500">Hisob yaratish uchun ma'lumotlaringizni kiriting</p>
      </header>

      <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-5 px-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Ism</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ism" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Familiya</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Familiya" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Yosh</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Masalan: 27"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Telefon raqami</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998 90 123-45-67"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Parol</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kamida 6 ta belgi"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Parolni tasdiqlang</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Parolni qayta kiriting"
            className={inputClass}
          />
        </div>

        <Button type="submit" className="w-full justify-center">
          Davom etish
        </Button>
      </form>
    </div>
  );
}
