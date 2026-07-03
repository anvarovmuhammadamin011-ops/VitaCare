import { NavLink } from "react-router-dom";
import { Home, LayoutGrid, ClipboardList, User } from "lucide-react";
import { useOrders } from "../store/OrdersContext";

const tabs = [
  { to: "/", label: "Bosh sahifa", icon: Home },
  { to: "/xizmatlar", label: "Xizmatlar", icon: LayoutGrid },
  { to: "/buyurtmalar", label: "Buyurtmalar", icon: ClipboardList, badgeKey: "active" },
  { to: "/profil", label: "Profil", icon: User },
];

export default function BottomNav() {
  const { active } = useOrders();
  const badgeCount = { active: active.length };

  return (
    <nav className="sticky bottom-0 z-20 border-t border-neutral-100 bg-white pb-[env(safe-area-inset-bottom)]">
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
