import {
  Droplet,
  HeartPulse,
  Waves,
  Gauge,
  Syringe,
  Thermometer,
  TestTube,
  Bandage,
  Stethoscope,
  Baby,
  Award,
  Sparkles,
  HeartHandshake,
  ClipboardList,
} from "lucide-react";

const icons = {
  Droplet,
  HeartPulse,
  Waves,
  Gauge,
  Syringe,
  Thermometer,
  TestTube,
  Bandage,
  Baby,
  Award,
  Sparkles,
  HeartHandshake,
  ClipboardList,
};

export default function ServiceIcon({ name, ...props }) {
  const Cmp = icons[name] ?? Stethoscope;
  return <Cmp {...props} />;
}
