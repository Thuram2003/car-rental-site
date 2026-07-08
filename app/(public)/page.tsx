import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck, Clock, MapPin, Star, CaretRight, Car, GasPump, Users, Lightning,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { getVehicles } from "@/lib/actions/vehicles";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";

const STATS = [
  { value: "500+", label: "Happy Customers" },
  { value: "50+", label: "Premium Vehicles" },
  { value: "3", label: "Locations" },
  { value: "24/7", label: "Support" },
];

const WHY_US = [
  {
    icon: ShieldCheck,
    title: "Fully Insured",
    desc: "Every rental comes with comprehensive insurance coverage for your peace of mind.",
  },
  {
    icon: Clock,
    title: "Flexible Hours",
    desc: "Pick up and drop off at any of our 3 locations, 7 days a week.",
  },
  {
    icon: MapPin,
    title: "Multiple Locations",
    desc: "Downtown, Airport, and Mall branches for your convenience.",
  },
  {
    icon: Lightning,
    title: "Instant Booking",
    desc: "Book online in under 2 minutes. No paperwork, no waiting.",
  },
];

export default async function LandingPage() {
  const availableVehicles = await getVehicles({ status: "Available" });
  const featured = availableVehicles.slice(0, 3);
  const availableCount = availableVehicles.length;

  return (
    <div className="overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        {/* Orange accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/10 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                <span className="text-orange-300 text-sm font-medium">
                  {availableCount} vehicle{availableCount !== 1 ? "s" : ""} available now
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Drive the car{" "}
                <span className="text-orange-400">you deserve</span>
              </h1>

              <p className="text-lg text-gray-300 leading-relaxed max-w-lg">
                Premium car rentals with transparent pricing, no hidden fees,
                and a fleet that fits every occasion — from daily commutes to
                weekend adventures.
              </p>

              {/* Quick search */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 space-y-3">
                <p className="text-sm text-gray-300 font-medium">Quick Search</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-xl px-3 py-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">Pick-up Date</p>
                    <p className="text-sm text-white font-medium">May 1, 2026</p>
                  </div>
                  <div className="bg-white/10 rounded-xl px-3 py-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">Return Date</p>
                    <p className="text-sm text-white font-medium">May 5, 2026</p>
                  </div>
                </div>
                <Link href="/cars">
                  <Button variant="default" size="lg" className="w-full">
                    Search Available Cars
                    <CaretRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — hero car card */}
            {featured[1] && (
              <div className="hidden lg:block relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src={featured[1].image_url ?? "/placeholder-car.jpg"}
                    alt={`${featured[1].make} ${featured[1].model}`}
                    width={600}
                    height={400}
                    className="w-full h-80 object-cover"
                    priority
                    loading="eager"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white font-bold text-xl">
                          {featured[1].make} {featured[1].model}
                        </p>
                        <p className="text-gray-300 text-sm">{featured[1].year} · {featured[1].category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-orange-400 font-bold text-2xl">
                          {formatCurrency(featured[1].daily_rate)}
                        </p>
                        <p className="text-gray-300 text-xs">per day</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-orange-500 text-white rounded-2xl px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-white" />
                    <span className="font-bold">4.9</span>
                  </div>
                  <p className="text-xs text-orange-100">Top Rated</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-orange-500 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-orange-100 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Cars ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-orange-500 font-semibold text-sm uppercase tracking-wider mb-2">
                Our Fleet
              </p>
              <h2 className="text-3xl font-bold text-gray-900">
                Featured Vehicles
              </h2>
            </div>
            <Link href="/cars">
              <Button variant="outline" size="sm">
                View All Cars
                <CaretRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((car, index) => (
              <Link key={car.id} href={`/cars/${car.id}`} className="group">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-200">
                  <div className="relative overflow-hidden h-48">
                    <Image
                      src={car.image_url ?? "/placeholder-car.jpg"}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                      unoptimized
                    />
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={car.status} />
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-gray-700">
                        {car.average_rating > 0 ? car.average_rating.toFixed(1) : "New"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {car.make} {car.model}
                        </h3>
                        <p className="text-sm text-gray-500">{car.year} · {car.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-500 text-lg">
                          {formatCurrency(car.daily_rate)}
                        </p>
                        <p className="text-xs text-gray-400">/ day</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {car.seats} seats
                      </span>
                      <span className="flex items-center gap-1">
                        <GasPump className="h-3.5 w-3.5" />
                        {car.fuel_type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Car className="h-3.5 w-3.5" />
                        {car.transmission}
                      </span>
                    </div>

                    <Button variant="default" size="sm" className="w-full">
                      Book Now
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-wider mb-2">
              Why DriveGo
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              The smarter way to rent
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {WHY_US.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center space-y-4">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto">
                  <Icon className="h-7 w-7 text-orange-500" />
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-4xl font-bold text-white">
            Ready to hit the road?
          </h2>
          <p className="text-gray-300 text-lg">
            Browse our full fleet and book your perfect car in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cars">
              <Button variant="default" size="lg">
                Browse All Cars
                <CaretRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="outline"
                size="lg"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
