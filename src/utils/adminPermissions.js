const LEVELS = {
  super: {
    manageUsers: true,
    manageProviders: true,
    bookingActions: true,
    financials: true,
    settings: true,
    bloodPressureEntry: true,
    analyticsView: true,
    messaging: true,
  },
  operations: {
    manageUsers: true,
    manageProviders: true,
    bookingActions: true,
    financials: false,
    settings: false,
    bloodPressureEntry: true,
    analyticsView: true,
    messaging: true,
  },
  support: {
    manageUsers: false,
    manageProviders: false,
    bookingActions: false,
    financials: false,
    settings: false,
    bloodPressureEntry: false,
    analyticsView: false,
    messaging: true,
  },
  analytics: {
    manageUsers: false,
    manageProviders: false,
    bookingActions: false,
    financials: false,
    settings: false,
    bloodPressureEntry: false,
    analyticsView: true,
    messaging: false,
  },
};

export function canAccess(level, feature) {
  return Boolean(LEVELS[level ?? "super"]?.[feature]);
}

export const adminLevelLabels = {
  super: "Super Admin",
  operations: "Operatsion menejer",
  support: "Qo'llab-quvvatlash",
  analytics: "Analitika",
};
