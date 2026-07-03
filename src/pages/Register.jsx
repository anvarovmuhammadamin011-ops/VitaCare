import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Map,
  MapPin,
  Pill as PillIcon,
  Stethoscope,
  Upload,
  UserRound,
  Check,
  MessageSquareText,
} from "lucide-react";
import Button from "../components/ui/Button";
import Pill from "../components/ui/Pill";
import MapPickerSheet from "../components/MapPickerSheet";
import { useToast } from "../store/ToastContext";
import { useAuth } from "../store/AuthContext";
import { accountRoles, doctorSpecialties, majorCities } from "../data/roles";
import { PHONE_PREFIX, formatPhoneLocal } from "../utils/phone";

const roleIcons = { Pill: PillIcon, Stethoscope, UserRound };

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
  const [specialty, setSpecialty] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [serviceCity, setServiceCity] = useState("");
  const [certificateFileName, setCertificateFileName] = useState("");
  const [bankCard, setBankCard] = useState("");
  const [pharmacyName, setPharmacyName] = useState("");
  const [pharmacyAddress, setPharmacyAddress] = useState("");
  const [mapOpen, setMapOpen] = useState(false);

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
    if (role === "doktor" && !specialty.trim()) {
      notify("Yo'nalishingizni kiriting, masalan: Stomatolog");
      return;
    }
    if (role === "doktor" && (!experienceYears || !serviceCity.trim() || !certificateFileName || !bankCard.trim())) {
      notify("Tajriba, shahar, sertifikat va bank kartangizni to'ldiring");
      return;
    }
    if (
      role === "aptekachi" &&
      (!pharmacyName.trim() || !pharmacyAddress.trim() || !certificateFileName || !bankCard.trim())
    ) {
      notify("Apteka nomi, manzili, litsenziya va bank kartangizni to'ldiring");
      return;
    }

    const extra =
      role === "doktor"
        ? {
            specialty: specialty.trim(),
            experienceYears: Number(experienceYears),
            serviceCity,
            certificateFileName,
            bankCard: bankCard.trim(),
            verified: false,
          }
        : role === "aptekachi"
          ? {
              pharmacyName: pharmacyName.trim(),
              pharmacyAddress: pharmacyAddress.trim(),
              certificateFileName,
              bankCard: bankCard.trim(),
              verified: false,
            }
          : {};

    const fullPhone = `${PHONE_PREFIX} ${phone}`;

    const res = startRegistration({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age: Number(age),
      phone: fullPhone,
      password,
      role,
      ...extra,
      createdAt: new Date().toISOString(),
    });

    if (!res.ok) {
      notify(res.error);
      return;
    }

    notify(`SMS kod ${fullPhone} raqamiga yuborildi (test uchun): ${res.otp}`);
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

    if (role !== "doktor" && role !== "aptekachi") notify("Hisob tasdiqlandi — xush kelibsiz!");
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
          <p className="text-small text-neutral-500">{PHONE_PREFIX} {phone} raqamiga yuborilgan 4 xonali kodni kiriting</p>
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

          {role === "doktor" && (
            <>
              <div>
                <label className={labelClass}>Yo'nalishingiz</label>
                <input
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Masalan: Stomatolog"
                  className={inputClass}
                />
                <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
                  {doctorSpecialties.map((s) => (
                    <Pill key={s} active={specialty === s} onClick={() => setSpecialty(s)} type="button">
                      {s}
                    </Pill>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Tajriba (necha yil)</label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="Masalan: 10"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Xizmat ko'rsatish shahri</label>
                <input
                  value={serviceCity}
                  onChange={(e) => setServiceCity(e.target.value)}
                  placeholder="Masalan: Toshkent"
                  className={inputClass}
                />
                <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
                  {majorCities.map((c) => (
                    <Pill key={c} active={serviceCity === c} onClick={() => setServiceCity(c)} type="button">
                      {c}
                    </Pill>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Sertifikat</label>
                <label className="mt-1 flex h-12 w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-neutral-200 px-3 text-sm text-neutral-500 hover:border-primary/40">
                  <Upload size={16} className="shrink-0 text-neutral-400" />
                  <span className="min-w-0 flex-1 truncate">
                    {certificateFileName || "Fayl tanlash (JPG, PNG yoki PDF)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setCertificateFileName(e.target.files?.[0]?.name ?? "")}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className={labelClass}>Bank karta raqami (pul qaytarish uchun)</label>
                <input
                  value={bankCard}
                  onChange={(e) => setBankCard(e.target.value)}
                  placeholder="9860 1234 5678 1234"
                  className={inputClass}
                />
              </div>
            </>
          )}

          {role === "aptekachi" && (
            <>
              <div>
                <label className={labelClass}>Apteka nomi</label>
                <input
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  placeholder="Masalan: Green Pharmacy"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Apteka manzili</label>
                <button
                  type="button"
                  onClick={() => setMapOpen(true)}
                  className="mt-1 flex w-full items-start gap-2 rounded-xl border border-neutral-200 p-3 text-left text-sm hover:border-primary/40"
                >
                  <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                  <span className="flex-1 text-neutral-800">
                    {pharmacyAddress || "Manzilni xaritadan tanlang"}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                    <Map size={14} /> Xaritadan
                  </span>
                </button>
              </div>

              <div>
                <label className={labelClass}>Apteka litsenziyasi</label>
                <label className="mt-1 flex h-12 w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-neutral-200 px-3 text-sm text-neutral-500 hover:border-primary/40">
                  <Upload size={16} className="shrink-0 text-neutral-400" />
                  <span className="min-w-0 flex-1 truncate">
                    {certificateFileName || "Fayl tanlash (JPG, PNG yoki PDF)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setCertificateFileName(e.target.files?.[0]?.name ?? "")}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className={labelClass}>Bank karta raqami (pul qaytarish uchun)</label>
                <input
                  value={bankCard}
                  onChange={(e) => setBankCard(e.target.value)}
                  placeholder="9860 1234 5678 1234"
                  className={inputClass}
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full justify-center">
            Davom etish
          </Button>
        </form>

        <MapPickerSheet open={mapOpen} onClose={() => setMapOpen(false)} onConfirm={setPharmacyAddress} />
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
          <div className="mt-1 flex h-12 w-full items-center gap-1.5 rounded-xl border border-neutral-200 px-3 focus-within:ring-2 focus-within:ring-primary">
            <span className="shrink-0 text-body text-neutral-500">{PHONE_PREFIX}</span>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(formatPhoneLocal(e.target.value))}
              placeholder="90 123-45-67"
              className="w-full min-w-0 bg-transparent text-body focus:outline-none"
            />
          </div>
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
