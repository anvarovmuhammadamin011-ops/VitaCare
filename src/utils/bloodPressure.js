// Standard ambulatory BP categories, thresholds admin-configurable via PlatformSettingsContext.
export function classifyBP(systolic, diastolic, thresholds) {
  const sys = Number(systolic);
  const dia = Number(diastolic);
  if (!Number.isFinite(sys) || !Number.isFinite(dia)) {
    return { label: "Noma'lum", tone: "neutral" };
  }
  if (sys >= thresholds.crisisSys || dia >= thresholds.crisisDia) {
    return { label: "Krizis", tone: "error" };
  }
  if (sys >= thresholds.stage2Sys || dia >= thresholds.stage2Dia) {
    return { label: "2-bosqich", tone: "error" };
  }
  if (sys >= thresholds.stage1Sys || dia >= thresholds.stage1Dia) {
    return { label: "1-bosqich", tone: "warning" };
  }
  if (sys >= thresholds.elevatedSys) {
    return { label: "Ko'tarilgan", tone: "warning" };
  }
  return { label: "Normal", tone: "success" };
}

// Vitals are stored as a single "120/80" string (see PatientHealthContext) — parse it back
// out for classification without changing the persisted shape.
export function parseBP(value) {
  const match = /^(\d+)\s*\/\s*(\d+)$/.exec((value ?? "").trim());
  if (!match) return null;
  return { systolic: Number(match[1]), diastolic: Number(match[2]) };
}
