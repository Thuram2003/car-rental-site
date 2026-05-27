import { notFound } from "next/navigation";
import { getVehicleById, getVehicles } from "@/lib/actions/vehicles";
import { CarDetailContent } from "./car-detail-content";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getVehicleById(id);
  if (!car) notFound();

  const categoryVehicles = await getVehicles({ category: car.category, status: "Available" });
  const similar = categoryVehicles.filter((v) => v.id !== car.id).slice(0, 3);

  return <CarDetailContent car={car} similar={similar} />;
}
