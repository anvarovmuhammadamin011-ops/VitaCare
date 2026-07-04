// Account types selectable when registering on the platform.
export const accountRoles = [
  {
    id: "foydalanuvchi",
    label: "Foydalanuvchi",
    desc: "Bemor sifatida xizmatlardan foydalanadi",
    icon: "UserRound",
  },
  {
    id: "aptekachi",
    label: "Aptekachi",
    desc: "Dorixona xodimi — dori buyurtmalarini boshqaradi",
    icon: "Pill",
  },
  {
    id: "doktor",
    label: "Doktor",
    desc: "Bemorlarni qabul qiladi va davolaydi",
    icon: "Stethoscope",
  },
];

// Suggested chips shown when a Doktor-role account registers as a doctor.
export const doctorSpecialties = [
  "Terapevt",
  "Stomatolog",
  "Pediatr",
  "Kardiolog",
  "Ginekolog",
  "Nevropatolog",
  "LOR",
  "Dermatolog",
];

// Suggested chips shown when a Doktor-role account registers as a nurse.
export const nurseSpecialties = [
  "Umumiy hamshira",
  "IV infuziya",
  "Qon olish",
  "Massaj",
  "Fizioterapiya",
  "Bolalar parvarishi",
  "Post-operatsion parvarish",
];

// Suggested chips shown when a Doktor account picks their service city.
export const majorCities = [
  "Toshkent",
  "Andijon",
  "Namangan",
  "Farg'ona",
  "Samarqand",
  "Buxoro",
  "Guliston",
  "Nukus",
];
