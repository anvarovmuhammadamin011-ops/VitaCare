export const quickServices = [
  {
    id: "blood",
    icon: "Droplet",
    name: "Qon olish",
    price: 50000,
    rating: 4.8,
    reviews: 320,
    available: 4,
    description: "Malakali hamshira uyingizga kelib qon namunasini oladi, natijalar 24 soat ichida tayyor bo'ladi.",
  },
  {
    id: "ekg",
    icon: "HeartPulse",
    name: "EKG",
    price: 75000,
    rating: 4.9,
    reviews: 210,
    available: 3,
    description: "Yurak faoliyatini tekshirish uchun uyingizda elektrokardiogramma o'tkaziladi.",
  },
  {
    id: "ultrasound",
    icon: "Waves",
    name: "Ultratovush",
    price: 120000,
    rating: 4.7,
    reviews: 180,
    available: 2,
    description: "Zamonaviy qurilma bilan ichki a'zolar tekshiruvi uyingizda amalga oshiriladi.",
  },
  {
    id: "pressure",
    icon: "Gauge",
    name: "Bosim o'lchash",
    price: 30000,
    rating: 4.9,
    reviews: 410,
    available: 6,
    description: "Qon bosimingiz aniq tibbiy asbob bilan o'lchanadi va natija darhol beriladi.",
  },
  {
    id: "injection",
    icon: "Syringe",
    name: "Tizim ukoli",
    price: 40000,
    rating: 4.6,
    reviews: 95,
    available: 5,
    description: "Shifokor retseptiga asosan tizim ukoli xavfsiz va steril sharoitda qilinadi.",
  },
  {
    id: "temperature",
    icon: "Thermometer",
    name: "Harorat o'lchash",
    price: 20000,
    rating: 4.8,
    reviews: 130,
    available: 7,
    description: "Tana haroratingiz tez va aniq o'lchanadi, natija shu zahoti aytiladi.",
  },
  {
    id: "insulin",
    icon: "TestTube",
    name: "Insulin in'eksiyasi",
    price: 35000,
    rating: 4.7,
    reviews: 88,
    available: 3,
    description: "Diabet bilan og'rigan bemorlar uchun insulin in'eksiyasi uyingizda xavfsiz qilinadi.",
  },
  {
    id: "iv",
    icon: "Bandage",
    name: "Infuziya",
    price: 90000,
    rating: 4.8,
    reviews: 150,
    available: 2,
    description: "Tomchilatib dori yuborish (infuziya) tartibi malakali hamshira nazorati ostida o'tkaziladi.",
  },
];

// Home-care / nursing services shown on the dedicated "Xizmatlar" tab.
export const careServices = [
  { id: "umumiy-hamshira", name: "Umumiy hamshira", price: 60000, icon: "Stethoscope" },
  { id: "oliy-hamshira", name: "Oliy toifali hamshira", price: 90000, icon: "Award" },
  { id: "bolalar-massaji", name: "Bolalar massaji", price: 70000, icon: "Baby" },
  { id: "kichkintoy-muolaja", name: "Kichkintoylar uchun muolaja", price: 85000, icon: "Syringe" },
  { id: "ayollar-massaj", name: "Ayollar uchun massaj", price: 95000, icon: "Sparkles" },
  { id: "enaga", name: "Enaga", price: 120000, icon: "HeartHandshake" },
  { id: "bolalar-shifokori", name: "Bolalar shifokori", price: 100000, icon: "HeartPulse" },
  { id: "tibbiy-korik", name: "Tibbiy ko'rik", price: 55000, icon: "ClipboardList" },
];

// Seed data — used only the first time the app loads (no localStorage yet).
// After that, real user actions (booking, cancelling, favoriting) drive state.
export const seedOrders = [
  {
    id: "BUY-2026-001",
    type: "service",
    status: "active",
    title: "Qon olish",
    provider: "Dr. Alisher Karimov",
    address: "Mirobod ko'ch., 15/A, Kv.25",
    time: "Bugun 14:00-15:00",
    price: 50000,
    paid: false,
  },
  {
    id: "BUY-2025-500",
    type: "service",
    status: "completed",
    title: "EKG",
    provider: "Feruza Zainab",
    address: "Chilonzor, 25/3, Kv.10",
    time: "2026-06-10 09:00-09:30",
    price: 75000,
    rating: 5,
  },
  {
    id: "BUY-2025-388",
    type: "service",
    status: "cancelled",
    title: "Ultratovush",
    provider: "Dr. Nodira Yusupova",
    address: "Yunusobod, 8, Kv.44",
    time: "2026-04-02 10:00-10:30",
    price: 120000,
    reason: "Foydalanuvchi tomonidan bekor qilindi",
  },
];

export const providers = [
  { id: "karimov", name: "Dr. Alisher Karimov", rating: 4.9, specialty: "Terapevt" },
  { id: "zainab", name: "Feruza Zainab", rating: 4.8, specialty: "Hamshira" },
];

export const pharmacies = [
  { id: "green", name: "Green Pharmacy", city: "Toshkent" },
  { id: "healthplus", name: "Health+ Drugs", city: "Andijon" },
];

export const userProfile = {
  name: "Dilyora Sultanova",
  phone: "+998 90 123-45-67",
  email: "d.sultanova@gmail.com",
  bloodType: "O+ Rh+",
  allergy: "Penitsillin",
  chronic: "Diabet 2-tip",
  addresses: [
    { label: "Uy", detail: "Mirobod ko'ch., 15/A, Kv.25", primary: true },
    { label: "Ofis", detail: "Toshpo'latova, 5, Kv.3", primary: false },
    { label: "Ota-onasining uyi", detail: "Chilonzor, 12, Kv.7", primary: false },
  ],
  cards: [
    { label: "Humo", number: "9860 **** **** 1234", primary: true },
    { label: "Visa", number: "4000 **** **** 5678", primary: false },
  ],
  ratingAvg: 4.8,
  reviewCount: 12,
  reviews: [
    { text: "Qon oldirdim, juda oson!", rating: 5 },
    { text: "EKG juda tez qilindi", rating: 4 },
  ],
};
