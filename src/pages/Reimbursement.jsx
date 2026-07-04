import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Check,
  ShieldCheck,
  Upload,
  FileCheck2,
  Clock,
  PackageCheck,
  FileText,
  X,
} from "lucide-react";
import Button from "../components/ui/Button";
import { useToast } from "../store/ToastContext";

const steps = [
  {
    n: 1,
    type: "upload",
    title: "Retsept ro'yxatini yuklash",
    desc: "Shifokor yozgan dorilar ro'yxatini fotoga oling yoki yuklang",
    icon: Upload,
  },
  {
    n: 2,
    type: "upload",
    title: "Hujjatlarni yuklash",
    desc: "Pasport nusxasi va tibbiy polis bilan",
    icon: FileCheck2,
  },
  {
    n: 3,
    type: "action",
    title: "Tasdiqlash",
    desc: "Jamoamiz 24-48 soat ichida tekshiradi",
    action: "Statusni ko'rish",
    icon: Clock,
  },
  {
    n: 4,
    type: "action",
    title: "Dorini olish",
    desc: "Pulni qaytarib oling yoki dorini uyda oling",
    action: "Buyurtmalarni ko'rish",
    icon: PackageCheck,
  },
];

export default function Reimbursement() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState({});
  const [dragOver, setDragOver] = useState(null);

  function handleUpload(s, fileList) {
    const file = fileList?.[0];
    if (!file) return;
    setFiles((cur) => ({ ...cur, [s.n]: file.name }));
    setStep((cur) => Math.max(cur, s.n));
    notify(`${s.title}: bajarildi`);
  }

  function handleRemoveFile(s) {
    setFiles((cur) => {
      const next = { ...cur };
      delete next[s.n];
      return next;
    });
    setStep((cur) => Math.min(cur, s.n - 1));
  }

  function handleAction(s) {
    if (s.n === 4) {
      navigate("/buyurtmalar");
      return;
    }
    setStep((cur) => Math.max(cur, s.n));
    notify(`${s.title}: bajarildi`);
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <header className="px-4 pb-2 pt-6">
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft size={16} /> Orqaga
        </button>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-white">
            <ShieldCheck size={22} />
          </span>
          <div>
            <h1 className="text-h2 font-bold text-neutral-900">Reimbursatsiya dasturi</h1>
            <p className="text-small text-neutral-500">Shifokor yozgan dorilarni to'liq qaytarish</p>
          </div>
        </div>
      </header>

      <div className="px-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-label text-neutral-400">
          {step}/{steps.length} bosqich bajarildi
        </p>
      </div>

      <div className="flex flex-col gap-2 px-4">
        {steps.map((s) => {
          const done = step >= s.n;
          const locked = s.n > step + 1;
          const StepIcon = s.icon;
          const fileName = files[s.n];

          return (
            <div
              key={s.n}
              className={`flex items-start gap-3 rounded-card border p-4 ${
                done ? "border-primary/30 bg-primary/5" : "border-neutral-100"
              }`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                  done ? "bg-primary text-white" : "bg-secondary/10 text-secondary"
                }`}
              >
                {done ? <Check size={16} /> : s.n}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
                  <StepIcon size={14} className={done ? "text-primary" : "text-secondary"} />
                  {s.title}
                </h3>
                <p className="mt-1 text-label text-neutral-500">{s.desc}</p>

                {s.type === "upload" ? (
                  fileName ? (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-primary/20 bg-white px-3 py-2.5">
                      <FileText size={16} className="shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-neutral-700">{fileName}</span>
                      <button
                        onClick={() => handleRemoveFile(s)}
                        aria-label="Faylni olib tashlash"
                        className="shrink-0 text-neutral-400 hover:text-error"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <label
                      onDragOver={(e) => {
                        if (locked) return;
                        e.preventDefault();
                        setDragOver(s.n);
                      }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={(e) => {
                        if (locked) return;
                        e.preventDefault();
                        setDragOver(null);
                        handleUpload(s, e.dataTransfer.files);
                      }}
                      className={`mt-3 flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-5 text-center transition ${
                        locked
                          ? "cursor-not-allowed border-neutral-100 opacity-50"
                          : dragOver === s.n
                            ? "border-primary bg-primary/5"
                            : "border-neutral-200 hover:border-primary/40 hover:bg-neutral-50"
                      }`}
                    >
                      <Upload size={18} className="text-neutral-400" />
                      <span className="text-xs font-semibold text-neutral-600">Fayl tanlash yoki shu yerga tashlang</span>
                      <span className="text-[11px] text-neutral-400">JPG, PNG yoki PDF</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        disabled={locked}
                        onChange={(e) => handleUpload(s, e.target.files)}
                        className="hidden"
                      />
                    </label>
                  )
                ) : (
                  <Button
                    variant="secondary"
                    disabled={locked}
                    onClick={() => handleAction(s)}
                    className="mt-3 h-9 px-4 text-xs"
                  >
                    {done && s.n !== 4 ? "Bajarildi" : s.action}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {files[1] && (
        <div className="px-4">
          <button
            onClick={() => navigate("/eslatmalar")}
            className="flex w-full items-center gap-3 rounded-card border border-secondary/20 bg-secondary/5 p-3.5 text-left transition hover:border-secondary/40 hover:bg-secondary/10 active:scale-[0.99]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-white">
              <Bell size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-neutral-900">Dori eslatmasi qo'shasizmi?</span>
              <span className="block text-label text-neutral-500">
                Retseptdagi dorilarni o'z vaqtida ichishni unutmang
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
