import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, ChevronRight, Loader2, Star, User, Wallet } from "lucide-react";
import Wordmark from "../components/Wordmark";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useDoctor } from "../store/DoctorContext";
import { useAuth } from "../store/AuthContext";
import { useToast } from "../store/ToastContext";

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

export default function DoctorHome() {
  const navigate = useNavigate();
  const { user, markVerified } = useAuth();
  const { notify } = useToast();
  const { incoming, active, completed, netEarnings, avgRating, reviewCount, acceptOrder } = useDoctor();

  const verifying = user?.verified === false;

  useEffect(() => {
    if (!verifying) return;
    const timer = setTimeout(() => {
      markVerified();
      notify("Tabriklaymiz! Hisobingiz tasdiqlandi ✅");
    }, 1800);
    return () => clearTimeout(timer);
  }, [verifying, markVerified, notify]);

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary-dark">
          <Loader2 size={28} className="animate-spin" />
        </span>
        <h1 className="text-h2 font-bold text-neutral-900">Ma'lumotlaringiz tekshirilmoqda</h1>
        <p className="text-small text-neutral-500">
          Sertifikat va ma'lumotlaringiz admin tomonidan tasdiqlanmoqda...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-9 pb-6">
      <header className="px-4 pb-2 pt-6">
        <div className="flex items-center justify-between">
          <Wordmark className="h-8 w-auto" />
          <button
            onClick={() => notify("Notifikatsiyalar: tez orada qo'shiladi")}
            aria-label="Notifikatsiyalar"
            className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100"
          >
            <Bell size={20} />
          </button>
        </div>

        <h1 className="mt-4 text-h2 font-bold text-neutral-900">Assalomu alaykum, Dr. {user?.lastName}! 👋</h1>
        {avgRating && (
          <p className="mt-1 flex items-center gap-1 text-small text-neutral-500">
            <Star size={14} className="fill-warning text-warning" /> {avgRating} ({reviewCount} ta sharh)
          </p>
        )}
      </header>

      <section className="px-4">
        <h2 className="text-lg font-bold text-neutral-900">Bugun statistikasi</h2>
        <div className="mt-4 grid grid-cols-4 gap-2">
          <Card className="border-neutral-100 p-3 text-center">
            <p className="text-xl font-bold text-secondary">{incoming.length}</p>
            <p className="mt-1 text-[11px] leading-tight text-neutral-500">Yangi</p>
          </Card>
          <Card className="border-neutral-100 p-3 text-center">
            <p className="text-xl font-bold text-warning">{active.length}</p>
            <p className="mt-1 text-[11px] leading-tight text-neutral-500">Faol</p>
          </Card>
          <Card className="border-neutral-100 p-3 text-center">
            <p className="text-xl font-bold text-primary">{completed.length}</p>
            <p className="mt-1 text-[11px] leading-tight text-neutral-500">Tugallandi</p>
          </Card>
          <Card className="border-neutral-100 p-3 text-center">
            <p className="text-xl font-bold text-neutral-900">{formatSom(netEarnings).replace(" so'm", "")}</p>
            <p className="mt-1 text-[11px] leading-tight text-neutral-500">Daromad</p>
          </Card>
        </div>
      </section>

      <section className="px-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Yangi buyurtmalar</h2>
          <button
            onClick={() => navigate("/buyurtmalar")}
            className="flex items-center gap-0.5 text-label font-semibold text-primary"
          >
            Barchasi <ChevronRight size={14} />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {incoming.length ? (
            incoming.slice(0, 3).map((o) => (
              <Card key={o.id} className="border-neutral-100">
                <h3 className="text-sm font-semibold text-neutral-900">
                  {o.items ? o.items.map((item) => item.title).join(", ") : o.title}{" "}
                  <span className="font-normal text-neutral-500">#{o.id}</span>
                </h3>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-neutral-600">
                  <User size={13} className="text-neutral-400" /> {o.patientName} ({o.patientAge} yoshli)
                </p>
                <p className="mt-1 text-sm text-neutral-600">{o.time}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900">{formatSom(o.price)}</span>
                  <Button
                    onClick={() => {
                      acceptOrder(o.id);
                      notify(`${o.title ?? "Buyurtma"} qabul qilindi`);
                    }}
                    className="h-9 px-4 text-xs"
                  >
                    <Check size={13} /> Qabul qilish
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="rounded-card border border-dashed border-neutral-200 py-10 text-center text-small text-neutral-400">
              Hozircha yangi buyurtmalar yo'q
            </div>
          )}
        </div>
      </section>

      <section className="px-4">
        <button
          onClick={() => navigate("/pul")}
          className="flex w-full items-center gap-4 rounded-card border border-primary/20 bg-primary/5 p-4 text-left transition hover:border-primary/40 hover:bg-primary/10 active:scale-[0.99]"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-white">
            <Wallet size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold text-neutral-900">Daromadingiz</span>
            <span className="block text-small text-neutral-500">Bu oylik topshiriq va to'lovlarni ko'ring</span>
          </span>
          <ChevronRight size={20} className="shrink-0 text-neutral-300" />
        </button>
      </section>
    </div>
  );
}
