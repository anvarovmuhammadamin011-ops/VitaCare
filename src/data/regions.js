// Simplified Uzbekistan administrative hierarchy: viloyat -> tuman -> shaharcha.
// Not exhaustive — enough regions/districts/towns to make the location picker feel real.
export const regions = [
  {
    id: "andijon",
    name: "Andijon viloyati",
    districts: [
      { id: "andijon-shahar", name: "Andijon shahri", towns: ["Andijon shahri"] },
      { id: "baliqchi", name: "Baliqchi tumani", towns: ["Baliqchi", "Oltinko'l"] },
      { id: "izboskan", name: "Izboskan tumani", towns: ["Izboskan", "Chinobod"] },
      { id: "xojaobod", name: "Xo'jaobod tumani", towns: ["Xo'jaobod"] },
      { id: "asaka", name: "Asaka tumani", towns: ["Asaka"] },
    ],
  },
  {
    id: "toshkent-shahri",
    name: "Toshkent shahri",
    districts: [
      { id: "yunusobod", name: "Yunusobod tumani", towns: ["Yunusobod"] },
      { id: "mirobod", name: "Mirobod tumani", towns: ["Mirobod"] },
      { id: "chilonzor", name: "Chilonzor tumani", towns: ["Chilonzor"] },
      { id: "shayxontohur", name: "Shayxontohur tumani", towns: ["Shayxontohur"] },
      { id: "yashnobod", name: "Yashnobod tumani", towns: ["Yashnobod"] },
    ],
  },
  {
    id: "toshkent-viloyati",
    name: "Toshkent viloyati",
    districts: [
      { id: "ohangaron", name: "Ohangaron tumani", towns: ["Ohangaron"] },
      { id: "bekobod", name: "Bekobod tumani", towns: ["Bekobod"] },
      { id: "chirchiq", name: "Chirchiq shahri", towns: ["Chirchiq"] },
      { id: "qibray", name: "Qibray tumani", towns: ["Qibray"] },
    ],
  },
  {
    id: "samarqand",
    name: "Samarqand viloyati",
    districts: [
      { id: "samarqand-shahar", name: "Samarqand shahri", towns: ["Samarqand shahri"] },
      { id: "kattaqorgon", name: "Kattaqo'rg'on tumani", towns: ["Kattaqo'rg'on"] },
      { id: "urgut", name: "Urgut tumani", towns: ["Urgut"] },
      { id: "bulungur", name: "Bulung'ur tumani", towns: ["Bulung'ur"] },
    ],
  },
  {
    id: "fargona",
    name: "Farg'ona viloyati",
    districts: [
      { id: "fargona-shahar", name: "Farg'ona shahri", towns: ["Farg'ona shahri"] },
      { id: "qoqon", name: "Qo'qon tumani", towns: ["Qo'qon"] },
      { id: "margilon", name: "Marg'ilon tumani", towns: ["Marg'ilon"] },
      { id: "rishton", name: "Rishton tumani", towns: ["Rishton"] },
    ],
  },
  {
    id: "buxoro",
    name: "Buxoro viloyati",
    districts: [
      { id: "buxoro-shahar", name: "Buxoro shahri", towns: ["Buxoro shahri"] },
      { id: "kogon", name: "Kogon tumani", towns: ["Kogon"] },
      { id: "gijduvon", name: "G'ijduvon tumani", towns: ["G'ijduvon"] },
    ],
  },
];

export const defaultCity = "Andijon shahri";
