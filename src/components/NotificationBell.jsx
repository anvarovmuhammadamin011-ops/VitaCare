import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import Sheet from "./ui/Sheet";
import { useAuth } from "../store/AuthContext";
import { useNotifications } from "../store/NotificationsContext";

function timeAgo(ts) {
  const diffMin = Math.round((Date.now() - ts) / 60000);
  if (diffMin < 1) return "hozir";
  if (diffMin < 60) return `${diffMin} daqiqa oldin`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour} soat oldin`;
  return new Date(ts).toLocaleDateString("uz-UZ");
}

export default function NotificationBell() {
  const { user } = useAuth();
  const { notificationsFor, unreadCountFor, markAllReadFor } = useNotifications();
  const [open, setOpen] = useState(false);

  const myName = user ? `${user.firstName} ${user.lastName}` : null;
  const list = notificationsFor(myName).sort((a, b) => b.createdAt - a.createdAt);
  const unread = unreadCountFor(myName);

  function handleOpen() {
    setOpen(true);
    markAllReadFor(myName);
  }

  return (
    <>
      <button
        onClick={handleOpen}
        aria-label="Bildirishnomalar"
        className="relative grid h-9 w-9 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100"
      >
        {unread > 0 ? <BellRing size={20} className="text-primary" /> : <Bell size={20} />}
        {unread > 0 && (
          <span className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-error text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Bildirishnomalar">
        {list.length ? (
          <ul className="flex flex-col gap-2">
            {list.map((n) => (
              <li key={n.id} className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                <p className="text-sm text-neutral-800">{n.message}</p>
                <p className="mt-1 text-[11px] font-medium text-neutral-400">{timeAgo(n.createdAt)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-small text-neutral-400">Hali bildirishnoma yo'q</p>
        )}
      </Sheet>
    </>
  );
}
