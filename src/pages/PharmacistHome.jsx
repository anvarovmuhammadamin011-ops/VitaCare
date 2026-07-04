import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, FileText, Loader2, MapPin, Pill as PillIcon, Star, User, Wallet } from "lucide-react";
import Wordmark from "../components/Wordmark";
import NotificationBell from "../components/NotificationBell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { usePharmacy } from "../store/PharmacyContext";
import { useAuth } from "../store/AuthContext";
import { useToast } from "../store/ToastContext";
import { useNotifications } from "../store/NotificationsContext";

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

export default function PharmacistHome() {
  const navigate = useNavigate();
  const { user, markVerified } = useAuth();
  const { notify } = useToast();
  const { pushNotification } = useNotifications();
  const { incoming, active, completed, drugs, netEarnings, avgRating, reviewCount, acceptOrder } = usePharmacy();

  const verifying = user?.verified === false;

  useEffect(() => {
    if (!verifying) return;
    const timer = setTimeout(() => {
      markVerified();
      notify("Tabriklaymiz! Apteka hisobingiz tasdiqlandi ✅");
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
          Litsenziya va ma'lumotlaringiz admin tomonidan tasdiqlanmoqda...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-9 pb-6">
      <header className="px-4 pb-2 pt-6">
        <div className="flex items-center justify-between">
          <Wordmark className="h-8 w-auto" />
          <NotificationBell />
        </div>

        <h1 className="mt-4 text-h2 font-bold text-neutral-900">Assalomu alaykum, {user?.pharmacyName ?? "Aptekachi"}! 👋</h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-neutral-500">
          {user?.pharmacyAddress && (
            <span className="flex items-center gap-1">
              <MapPin size={14} className="shrink-0 text-primary" /> {user.pharmacyAddress}
            </span>
          )}
          {avgRating && (
            <span className="flex items-center gap-1">
              <Star size={14} className="fill-warning text-warning" /> {avgRating} ({reviewCount} ta sharh)
            </span>
          )}
        </div>
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
          <h2 className="text-lg font-bold text-neutral-900">Yangi zakazlar</h2>
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
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900">#{o.id}</h3>
                  {o.hasPrescription && (
                    <span className="flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] font-bold text-secondary">
                      <FileText size={11} /> Retsept
                    </span>
                  )}
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-neutral-600">
                  <User size={13} className="text-neutral-400" /> {o.patientName} ({o.patientAge} yoshli)
                </p>
                <p className="mt-1 text-label text-neutral-500">{o.items.length} ta dori</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900">{formatSom(o.total)}</span>
                  <Button
                    onClick={() => {
                      acceptOrder(o.id);
                      notify(`#${o.id} buyurtma qabul qilindi`);
                      pushNotification(o.patientName, `#${o.id} buyurtmangiz qabul qilindi — tayyorlanmoqda`);
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
              Hozircha yangi zakazlar yo'q
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3 px-4">
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

        <button
          onClick={() => navigate("/dorilar")}
          className="flex w-full items-center gap-4 rounded-card border border-secondary/20 bg-secondary/5 p-4 text-left transition hover:border-secondary/40 hover:bg-secondary/10 active:scale-[0.99]"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-white">
            <PillIcon size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold text-neutral-900">Dorilarni boshqarish</span>
            <span className="block text-small text-neutral-500">
              Katalogda {drugs.length} ta dori · Yangi dori qo'shing
            </span>
          </span>
          <ChevronRight size={20} className="shrink-0 text-neutral-300" />
        </button>
      </section>
    </div>
  );
}
