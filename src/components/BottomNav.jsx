import { NavLink } from "react-router-dom";
import { Home, LayoutGrid, ClipboardList, User, Wallet } from "lucide-react";
import { useOrders } from "../store/OrdersContext";
import { usePharmacy } from "../store/PharmacyContext";
import { useDoctor } from "../store/DoctorContext";
import { useAuth } from "../store/AuthContext";

const patientTabs = [
  { to: "/", label: "Bosh sahifa", icon: Home },
  { to: "/xizmatlar", label: "Xizmatlar", icon: LayoutGrid },
  { to: "/buyurtmalar", label: "Buyurtmalar", icon: ClipboardList, badgeKey: "orders" },
  { to: "/profil", label: "Profil", icon: User },
];

const pharmacistTabs = [
  { to: "/", label: "Bosh sahifa", icon: Home },
  { to: "/buyurtmalar", label: "Buyurtmalar", icon: ClipboardList, badgeKey: "orders" },
  { to: "/pul", label: "Pul", icon: Wallet },
  { to: "/profil", label: "Profil", icon: User },
];

const doctorTabs = [
  { to: "/", label: "Bosh sahifa", icon: Home },
  { to: "/buyurtmalar", label: "Buyurtmalar", icon: ClipboardList, badgeKey: "orders" },
  { to: "/pul", label: "Pul", icon: Wallet },
  { to: "/profil", label: "Profil", icon: User },
];

export default function BottomNav() {
  const { user } = useAuth();
  const { active } = useOrders();
  const { incoming: pharmacyIncoming } = usePharmacy();
  const { incoming: doctorIncoming } = useDoctor();
  const isPharmacist = user?.role === "aptekachi";
  const isDoctor = user?.role === "doktor";
  const tabs = isPharmacist ? pharmacistTabs : isDoctor ? doctorTabs : patientTabs;
  const badgeCount = {
    orders: isPharmacist ? pharmacyIncoming.length : isDoctor ? doctorIncoming.length : active.length,
  };

  return (
    <nav className="sticky bottom-0 z-20 border-t border-neutral-100 bg-white pb-[env(safe-area-inset-bottom)] print:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {tabs.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.to === "/"}
              className={({ isActive }) =>
                `flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition ${
                  isActive ? "text-primary" : "text-neutral-400"
                }`
              }
            >
              <span className="relative">
                <tab.icon size={22} strokeWidth={2} />
                {tab.badgeKey && badgeCount[tab.badgeKey] > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-error text-[10px] font-bold text-white">
                    {badgeCount[tab.badgeKey]}
                  </span>
                )}
              </span>
              <span>{tab.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
