import { Star, Users } from "lucide-react";
import Sheet from "./ui/Sheet";
import Button from "./ui/Button";
import ServiceIcon from "./ServiceIcon";

function formatSom(n) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

export default function ServiceDetailSheet({ service, onClose, onBook }) {
  return (
    <Sheet open={!!service} onClose={onClose} title={service?.name ?? ""}>
      {service && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-dark">
              <ServiceIcon name={service.icon} size={28} strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-lg font-bold text-neutral-900">
                {service.pricePerHour ? `${formatSom(service.pricePerHour)}/soat` : formatSom(service.price)}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-500">
                <Star size={14} className="fill-warning text-warning" /> {service.rating} · {service.reviews} sharh
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-neutral-600">{service.description}</p>

          <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-2.5 text-sm font-medium text-primary-dark">
            <Users size={16} />
            {service.available} xizmatchi hozir mavjud
          </div>

          <Button onClick={() => onBook(service)} className="w-full justify-center">
            Band qilish
          </Button>
        </div>
      )}
    </Sheet>
  );
}
