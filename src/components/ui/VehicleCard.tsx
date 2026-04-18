import Link from "next/link";
import Image from "next/image";
import Icon from "./Icon";
import { Vehicle } from "@/lib/types";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const formattedPrice = vehicle.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });

  const formattedKm = vehicle.km === 0 ? "0 km" : `${vehicle.km.toLocaleString("pt-BR")} km`;

  return (
    <Link
      href={`/carro/${vehicle.id}`}
      className="bg-surface-container-lowest rounded-xl overflow-hidden hover:scale-[1.02] motion-safe:transition-transform motion-safe:duration-300 group shadow-[0px_12px_32px_rgba(45,47,47,0.06)] block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
    >
      <div className="h-48 overflow-hidden relative">
        <Image
          src={vehicle.image}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          className="object-cover group-hover:scale-110 motion-safe:transition-transform motion-safe:duration-500"
        />
        {vehicle.badge && (
          <div className="absolute top-4 left-4 bg-primary-container text-on-primary-container text-[10px] font-black px-2 py-1 uppercase rounded">
            {vehicle.badge}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-bold text-lg leading-tight mb-2">
          {vehicle.brand} {vehicle.model}
        </h3>
        <p className="text-2xl font-black text-on-surface mb-4">{formattedPrice}</p>
        <div className="flex items-center justify-between text-on-surface-variant text-sm font-medium">
          <span className="flex items-center gap-1">
            <Icon name="location_on" className="text-base" />
            {vehicle.city}
          </span>
          <span>{formattedKm}</span>
        </div>
      </div>
    </Link>
  );
}
