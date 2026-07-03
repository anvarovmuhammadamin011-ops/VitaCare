export const PHONE_PREFIX = "+998";

// Formats the local 9-digit part as the user types: "90 123-45-67".
export function formatPhoneLocal(value) {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 9 && digits.startsWith("998")) digits = digits.slice(3);
  digits = digits.slice(0, 9);

  let out = digits.slice(0, 2);
  if (digits.length > 2) out += " " + digits.slice(2, 5);
  if (digits.length > 5) out += "-" + digits.slice(5, 7);
  if (digits.length > 7) out += "-" + digits.slice(7, 9);
  return out;
}
