import { useState } from "react";
import { Check } from "lucide-react";
import Button from "../ui/Button";
import Pill from "../ui/Pill";

const inputClass =
  "mt-1 h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "text-label font-semibold text-neutral-500";

export default function IdentityForm({ user, onSave }) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [birthDate, setBirthDate] = useState(user.birthDate ?? "");
  const [gender, setGender] = useState(user.gender ?? "");
  const [passportId, setPassportId] = useState(user.passportId ?? "");
  const [email, setEmail] = useState(user.email ?? "");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Ism</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Familiya</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Tug'ilgan sana</label>
        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Jins</label>
        <div className="mt-1.5 flex gap-2">
          {["Erkak", "Ayol"].map((g) => (
            <Pill key={g} active={gender === g} onClick={() => setGender(g)} type="button">
              {g}
            </Pill>
          ))}
        </div>
      </div>
      <div>
        <label className={labelClass}>Pasport/ID raqami</label>
        <input value={passportId} onChange={(e) => setPassportId(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </div>
      <Button onClick={() => onSave({ firstName, lastName, birthDate, gender, passportId, email })} className="w-full justify-center">
        <Check size={16} /> Saqlash
      </Button>
    </div>
  );
}
