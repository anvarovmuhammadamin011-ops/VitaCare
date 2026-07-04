import {
  Settings,
  Stethoscope,
  MapPin,
  CreditCard,
  Star,
  Globe,
  Bell,
  Lock,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Plus,
  Briefcase,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useOrders } from "../store/OrdersContext";
import { useDoctor } from "../store/DoctorContext";
import { usePharmacy } from "../store/PharmacyContext";
import { useToast } from "../store/ToastContext";
import { useAuth } from "../store/AuthContext";
import { userProfile } from "../data/mockData";
import { accountRoles } from "../data/roles";

const menuItems = [
  { icon: Globe, label: "Tilni o'zgartirish" },
  { icon: Bell, label: "Notifikatsiyalar" },
  { icon: Lock, label: "Maxfiylik sozlamalari" },
  { icon: HelpCircle, label: "Yordam va FAQ" },
  { icon: FileText, label: "Foydalanish shartlari" },
];

function maskCard(card) {
  if (!card) return card;
  const groups = card.trim().split(/\s+/);
  if (groups.length < 2) return card;
  return groups.map((g, i) => (i === 0 || i === groups.length - 1 ? g : "••••")).join(" ");
}

export default function Profile() {
  const p = userProfile;
  const { completed } = useOrders();
  const { completed: doctorCompleted, avgRating: doctorAvgRating, reviewCount: doctorReviewCount } = useDoctor();
  const {
    completed: pharmacyCompleted,
    avgRating: pharmacyAvgRating,
    reviewCount: pharmacyReviewCount,
  } = usePharmacy();
  const { notify } = useToast();
  const { user, logout: authLogout } = useAuth();

  const isAptekachi = user?.role === "aptekachi";
  const isDoctor = user?.role === "doktor";

  const reviews = isDoctor
    ? doctorCompleted
        .filter((o) => o.rating)
        .map((o) => ({
          id: o.id,
          rating: o.rating,
          text: o.comment ?? (o.items ? o.items.map((item) => item.title).join(", ") : o.title),
        }))
    : isAptekachi
      ? pharmacyCompleted
          .filter((o) => o.rating)
          .map((o) => ({ id: o.id, rating: o.rating, text: o.comment ?? `Buyurtma #${o.id}` }))
      : completed.filter((o) => o.rating).map((o) => ({ id: o.id, rating: o.rating, text: o.title }));
  const avgRating = isDoctor
    ? doctorAvgRating
    : isAptekachi
      ? pharmacyAvgRating
      : reviews.length
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null;
  const reviewCount = isDoctor ? doctorReviewCount : isAptekachi ? pharmacyReviewCount : reviews.length;

  const displayName = user ? `${user.firstName} ${user.lastName}` : p.name;
  const displayPhone = user ? user.phone : p.phone;
  const roleLabel = user ? accountRoles.find((r) => r.id === user.role)?.label : null;

  function soon(label) {
    notify(`${label}: tez orada qo'shiladi`);
  }

  function logout() {
    authLogout();
    notify("Hisobdan chiqdingiz");
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <header className="px-4 pb-2 pt-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-white">
            {displayName
              .split(" ")
              .filter(Boolean)
              .map((w) => w[0])
              .join("")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-h3 font-bold text-neutral-900">{displayName}</h1>
              {roleLabel && (
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary-dark">
                  {roleLabel}
                </span>
              )}
            </div>
            <p className="text-small text-neutral-500">{displayPhone}</p>
          </div>
          <button onClick={() => soon("Sozlamalar")} aria-label="Sozlamalar" className="text-neutral-400">
            <Settings size={20} />
          </button>
        </div>
        <Button variant="secondary" onClick={() => soon("Profilni tahrirlash")} className="mt-4 h-10 w-full text-sm">
          Profilni tahrirlash
        </Button>
      </header>

      {user && (user.role === "doktor" || user.role === "aptekachi") && (
        <section className="px-4">
          <Card className="border-neutral-100">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary/10 text-secondary">
                <Briefcase size={14} />
              </span>
              Faoliyat ma'lumotlari
            </h2>
            <dl className="mt-3 flex flex-col gap-3 text-sm">
              {user.role === "doktor" && (
                <>
                  <Row label="Yo'nalish" value={user.specialty} />
                  <Row label="Tajriba" value={`${user.experienceYears} yil`} />
                  <Row label="Xizmat shahri" value={user.serviceCity} />
                  <Row label="Sertifikat" value={user.certificateFileName} />
                  <Row label="Bank karta" value={maskCard(user.bankCard)} />
                </>
              )}
              {user.role === "aptekachi" && (
                <>
                  <Row label="Apteka nomi" value={user.pharmacyName} />
                  <div>
                    <dt className="text-neutral-500">Apteka manzili</dt>
                    <dd className="mt-0.5 font-semibold text-neutral-900">{user.pharmacyAddress}</dd>
                  </div>
                  <Row label="Litsenziya" value={user.certificateFileName} />
                  <Row label="Bank karta" value={maskCard(user.bankCard)} />
                </>
              )}
            </dl>
          </Card>
        </section>
      )}

      {!isAptekachi && !isDoctor && (
        <section className="px-4">
          <Card className="border-neutral-100">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary-dark">
                <Stethoscope size={14} />
              </span>
              Sog'liq ma'lumotlari
            </h2>
            <dl className="mt-3 flex flex-col gap-2 text-sm">
              {user && <Row label="Yosh" value={user.age} />}
              <Row label="Qon guruhi" value={p.bloodType} />
              <Row label="Allergiya" value={p.allergy} />
              <Row label="Xroniki kasallik" value={p.chronic} />
            </dl>
            <Button variant="ghost" onClick={() => soon("Sog'liq ma'lumotlarini tahrirlash")} className="mt-2">
              Tahrirlash
            </Button>
          </Card>
        </section>
      )}

      {!isDoctor && (
        <section className="px-4">
          <Card className="border-neutral-100">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary-dark">
                <MapPin size={14} />
              </span>
              Manzillar
            </h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-neutral-700">
              {p.addresses.map((a) => (
                <li key={a.label} className="flex items-start gap-2">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${a.primary ? "bg-primary" : "bg-neutral-300"}`} />
                  <span>
                    <span className="font-semibold">{a.label}:</span> {a.detail}
                  </span>
                </li>
              ))}
            </ul>
            <Button variant="ghost" onClick={() => soon("Yangi manzil")} className="mt-2">
              <Plus size={14} /> Yangi manzil qo'shish
            </Button>
          </Card>
        </section>
      )}

      {!isDoctor && (
        <section className="px-4">
          <Card className="border-neutral-100">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary-dark">
                <CreditCard size={14} />
              </span>
              To'lov usullari
            </h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-neutral-700">
              {p.cards.map((c) => (
                <li key={c.label} className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.primary ? "bg-primary" : "bg-neutral-300"}`} />
                  {c.label}: {isAptekachi ? c.fullNumber : c.number}
                </li>
              ))}
            </ul>
            <Button variant="ghost" onClick={() => soon("Yangi karta")} className="mt-2">
              <Plus size={14} /> Yangi karta qo'shish
            </Button>
          </Card>
        </section>
      )}

      <section className="px-4">
        <Card className="border-neutral-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-warning/10 text-warning">
              <Star size={14} />
            </span>
            Mening sharhlarim
          </h2>
          {reviews.length ? (
            <>
              <p className="mt-2 text-small text-neutral-600">
                {avgRating}/5 ({reviewCount} ta sharh)
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {reviews.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 text-small text-neutral-700">
                    <span className="flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} size={13} className="fill-warning text-warning" />
                      ))}
                    </span>
                    {r.text}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-small text-neutral-400">
              Hali sharh yo'q — buyurtma tugagach uni baholang
            </p>
          )}
        </Card>
      </section>

      <section className="px-4">
        <Card className="overflow-hidden border-neutral-100 p-0">
          <h2 className="px-4 pt-4 text-sm font-bold text-neutral-900">Sozlamalar</h2>
          <ul className="mt-2 divide-y divide-neutral-100">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => soon(item.label)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <item.icon size={17} className="text-neutral-400" />
                  {item.label}
                  <ChevronRight size={16} className="ml-auto text-neutral-300" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="px-4">
        <Button variant="danger" onClick={logout} className="w-full justify-center text-sm">
          <LogOut size={16} /> Hisobdan chiqish
        </Button>
      </section>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-semibold text-neutral-900">{value}</dd>
    </div>
  );
}
