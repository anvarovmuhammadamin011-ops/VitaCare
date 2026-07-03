import { useState } from "react";
import { ArrowLeft, Check, ChevronRight, MapPin } from "lucide-react";
import Sheet from "./ui/Sheet";
import { useCity } from "../store/CityContext";
import { regions } from "../data/regions";

const titles = {
  region: "Viloyatni tanlang",
  district: "Tumanni tanlang",
  town: "Shaharchani tanlang",
};

export default function LocationSheet({ open, onClose }) {
  const { city, setCity } = useCity();
  const [step, setStep] = useState("region");
  const [region, setRegion] = useState(null);
  const [district, setDistrict] = useState(null);

  function handleClose() {
    setStep("region");
    setRegion(null);
    setDistrict(null);
    onClose();
  }

  function pickRegion(r) {
    setRegion(r);
    setStep("district");
  }

  function pickDistrict(d) {
    setDistrict(d);
    setStep("town");
  }

  function pickTown(t) {
    setCity(t);
    handleClose();
  }

  function goBack() {
    setStep(step === "town" ? "district" : "region");
  }

  return (
    <Sheet open={open} onClose={handleClose} title={titles[step]}>
      {step !== "region" && (
        <button
          onClick={goBack}
          className="mb-3 flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft size={15} /> Orqaga
        </button>
      )}

      {region && (
        <p className="mb-2 text-label text-neutral-400">
          {region.name}
          {district ? ` / ${district.name}` : ""}
        </p>
      )}

      <div className="flex max-h-[55vh] flex-col gap-1 overflow-y-auto">
        {step === "region" &&
          regions.map((r) => (
            <button
              key={r.id}
              onClick={() => pickRegion(r)}
              className="flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            >
              {r.name}
              <ChevronRight size={16} className="text-neutral-300" />
            </button>
          ))}

        {step === "district" &&
          region.districts.map((d) => (
            <button
              key={d.id}
              onClick={() => pickDistrict(d)}
              className="flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            >
              {d.name}
              <ChevronRight size={16} className="text-neutral-300" />
            </button>
          ))}

        {step === "town" &&
          district.towns.map((t) => (
            <button
              key={t}
              onClick={() => pickTown(t)}
              className="flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            >
              <span className="flex items-center gap-2">
                <MapPin size={15} className="text-neutral-400" />
                {t}
              </span>
              {city === t && <Check size={16} className="text-primary" />}
            </button>
          ))}
      </div>
    </Sheet>
  );
}
