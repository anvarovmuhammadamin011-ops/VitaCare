import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const notify = useCallback(
    (message) => {
      idCounter += 1;
      const id = idCounter;
      setToasts((cur) => [...cur, { id, message }]);
      timers.current[id] = setTimeout(() => dismiss(id), 3200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white shadow-lg"
          >
            <CheckCircle2 size={18} className="shrink-0 text-primary" strokeWidth={2.25} />
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Yopish" className="text-white/60">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
