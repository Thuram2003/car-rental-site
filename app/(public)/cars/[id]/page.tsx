import { notFound } from "next/navigation";
import { MOCK_VEHICLES } from "@/lib/mock-data";
import { CarDetailContent } from "./car-detail-content";

export function generateStaticParams() {
  return MOCK_VEHICLES.map((v) => ({ id: v.id }));
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = MOCK_VEHICLES.find((v) => v.id === id);
  if (!car) notFound();

  const similar = MOCK_VEHICLES.filter(
    (v) => v.id !== car.id && v.category === car.category && v.status === "Available"
  ).slice(0, 3);

  return <CarDetailContent car={car} similar={similar} />;
}
