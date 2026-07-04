import { ChevronRight, Pill, ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import Wordmark from "../components/Wordmark";
import { useAuth } from "../store/AuthContext";
import { accountRoles } from "../data/roles";

const roleIcons = { Pill, Stethoscope, UserRound };

// Admin isn't a self-registerable role (kept out of accountRoles/Register.jsx) —
// it's only reachable through this dev shortcut.
const adminRole = { id: "admin", label: "Admin", desc: "Platformani boshqarish paneli", icon: ShieldCheck };

export default function QuickSwitch() {
  const { quickLogin } = useAuth();

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col justify-center px-6">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Wordmark />
        <p className="text-small text-neutral-500">Qaysi hisob turida kirmoqchisiz?</p>
      </div>

      <div className="flex flex-col gap-3">
        {accountRoles.map((r) => {
          const RoleIcon = roleIcons[r.icon];
          return (
            <button
              key={r.id}
              onClick={() => quickLogin(r.id)}
              className="flex items-center gap-3 rounded-card border border-neutral-200 p-4 text-left transition hover:border-primary/40 hover:bg-primary/5 active:scale-[0.99]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-dark">
                <RoleIcon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-neutral-900">{r.label}</span>
                <span className="block text-label text-neutral-500">{r.desc}</span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-neutral-300" />
            </button>
          );
        })}

        <button
          onClick={() => quickLogin(adminRole.id)}
          className="flex items-center gap-3 rounded-card border border-dashed border-neutral-300 p-4 text-left transition hover:border-secondary/40 hover:bg-secondary/5 active:scale-[0.99]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary/10 text-secondary">
            <adminRole.icon size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-neutral-900">{adminRole.label}</span>
            <span className="block text-label text-neutral-500">{adminRole.desc}</span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-neutral-300" />
        </button>
      </div>
    </div>
  );
}
