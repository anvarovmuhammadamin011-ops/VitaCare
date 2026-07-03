import { useState } from "react";
import { Plus, Trash2, Pill as PillIcon } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Pill from "../components/ui/Pill";
import Sheet from "../components/ui/Sheet";
import { usePharmacy } from "../store/PharmacyContext";
import { useToast } from "../store/ToastContext";
import { drugCategories } from "../data/mockData";

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

const inputClass =
  "mt-1 h-12 w-full rounded-xl border border-neutral-200 px-3 text-body focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "text-label font-semibold text-neutral-500";

export default function PharmacistDrugs() {
  const { drugs, addDrug, removeDrug } = usePharmacy();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [pack, setPack] = useState("");
  const [category, setCategory] = useState(drugCategories[0]);

  function resetForm() {
    setName("");
    setPrice("");
    setPack("");
    setCategory(drugCategories[0]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !price || !pack.trim()) {
      notify("Barcha maydonlarni to'ldiring");
      return;
    }
    addDrug({ name: name.trim(), price: Number(price), pack: pack.trim(), category });
    notify(`${name.trim()} dorilar ro'yxatiga qo'shildi`);
    resetForm();
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader title="Dorilar" subtitle="Aptekangiz assortimentini boshqaring" />

      <div className="px-4">
        <Button onClick={() => setOpen(true)} className="h-11 w-full justify-center text-sm">
          <Plus size={16} /> Dori qo'shish
        </Button>
      </div>

      <div className="flex flex-col gap-3 px-4">
        {drugs.length ? (
          drugs.map((d) => (
            <Card key={d.id} className="border-neutral-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-dark">
                    <PillIcon size={18} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-neutral-900">{d.name}</h3>
                    <p className="text-label text-neutral-500">
                      {d.pack} · {d.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    removeDrug(d.id);
                    notify(`${d.name} ro'yxatdan o'chirildi`);
                  }}
                  aria-label="O'chirish"
                  className="shrink-0 text-neutral-400 hover:text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="mt-2 text-sm font-semibold text-neutral-900">{formatSom(d.price)}</p>
            </Card>
          ))
        ) : (
          <div className="rounded-card border border-dashed border-neutral-200 py-12 text-center text-small text-neutral-400">
            Hali dorilar yo'q — birinchi dorini qo'shing
          </div>
        )}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Dori qo'shish">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Nomi</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Paracetamol 500mg"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Narxi (so'm)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Masalan: 18000"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Qadoq</label>
            <input
              value={pack}
              onChange={(e) => setPack(e.target.value)}
              placeholder="Masalan: 20 tabletka"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Kategoriya</label>
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
              {drugCategories.map((c) => (
                <Pill key={c} active={category === c} onClick={() => setCategory(c)} type="button">
                  {c}
                </Pill>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full justify-center">
            Qo'shish
          </Button>
        </form>
      </Sheet>
    </div>
  );
}
