import { useEffect, useRef, useState } from "react";
import { Check, HeartPulse } from "lucide-react";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { useAuth } from "../store/AuthContext";
import { usePatientHealth } from "../store/PatientHealthContext";
import { usePlatformSettings } from "../store/PlatformSettingsContext";
import { classifyBP } from "../utils/bloodPressure";

const MEASURE_MS = 12000;
const ECG_UNIT = "M0,50 L20,50 L30,20 L40,80 L50,50 L60,50 L70,20 L80,80 L90,50 L100,20 L110,80 L120,50 L130,20 L140,80 L150,50 L160,50 L170,20 L180,80 L190,50 L200,50";

const toneBadge = { success: "success", warning: "warning", error: "error", neutral: "info" };

export default function BloodPressureCheck({ onClose }) {
  const { user } = useAuth();
  const { addVital } = usePatientHealth();
  const { settings } = usePlatformSettings();
  const [measuring, setMeasuring] = useState(true);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      const systolic = 108 + Math.floor(Math.random() * 26);
      const diastolic = 68 + Math.floor(Math.random() * 18);
      const value = `${systolic}/${diastolic}`;
      addVital(user.phone, "bloodPressure", value, { source: "device" });
      setResult({ value, classification: classifyBP(systolic, diastolic, settings.bpThresholds) });
      setMeasuring(false);
    }, MEASURE_MS);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <div className="relative h-28 w-full overflow-hidden rounded-2xl bg-neutral-900">
        <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="h-full w-full">
          <g className={measuring ? "ecg-scroll" : ""}>
            <path d={ECG_UNIT} fill="none" stroke="#1CD9A6" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            <path d={ECG_UNIT} transform="translate(200 0)" fill="none" stroke="#1CD9A6" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          </g>
        </svg>
        <style>{`
          .ecg-scroll { animation: ecgScroll 1.6s linear infinite; }
          @keyframes ecgScroll { from { transform: translateX(0); } to { transform: translateX(-200px); } }
        `}</style>
      </div>

      {measuring ? (
        <>
          <p className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <HeartPulse size={16} className="animate-pulse text-error" /> O'lchanmoqda...
          </p>
          <p className="text-xs text-neutral-400">Barmog'ingizni ekrandan olib qo'ymang</p>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl font-bold text-neutral-900">{result.value} mmHg</p>
            <Badge tone={toneBadge[result.classification.tone]}>{result.classification.label}</Badge>
          </div>
          <p className="text-xs text-neutral-400">Natija sog'lig'i tarixiga saqlandi</p>
          <Button onClick={onClose} className="w-full justify-center">
            <Check size={16} /> Tayyor
          </Button>
        </>
      )}
    </div>
  );
}
