import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import Button from "../components/ui/Button";
import Wordmark from "../components/Wordmark";
import { useAuth } from "../store/AuthContext";
import { useToast } from "../store/ToastContext";

const inputClass =
  "mt-1 h-12 w-full rounded-xl border border-neutral-200 px-3 text-body focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "text-label font-semibold text-neutral-500";

export default function Login() {
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!phone.trim() || !password) {
      notify("Telefon raqami va parolni kiriting");
      return;
    }
    const res = login(phone, password);
    if (!res.ok) {
      notify(res.error);
      return;
    }
    navigate("/");
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col justify-center px-6">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Wordmark />
        <p className="text-small text-neutral-500">Hisobingizga kiring</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            placeholder="Parolingiz"
            className={inputClass}
          />
        </div>
        <Button type="submit" className="mt-2 w-full justify-center">
          <LogIn size={18} /> Kirish
        </Button>
      </form>

      <p className="mt-6 text-center text-small text-neutral-500">
        Hisobingiz yo'qmi?{" "}
        <Link to="/royxatdan-otish" className="font-semibold text-primary">
          Ro'yxatdan o'ting
        </Link>
      </p>
    </div>
  );
}
