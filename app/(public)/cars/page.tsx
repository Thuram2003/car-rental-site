"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MagnifyingGlass,
  Sliders,
  Users,
  GasPump,
  Car,
  X,
  CircleNotch,
  FadersHorizontal,
  ArrowsDownUp,
  Sparkle,
  Gauge,
  Calendar,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { getVehicles } from "@/lib/actions/vehicles";
import { formatCurrency } from "@/lib/utils";
import type { VehicleWithRating } from "@/lib/supabase/types";

type VehicleCategory = "Economy" | "SUV" | "Luxury" | "Sports" | "Van";

const CATEGORIES: VehicleCategory[] = ["Economy", "SUV", "Luxury", "Sports", "Van"];
const FUEL_TYPES = ["All", "Petrol", "Diesel", "Electric", "Hybrid"];
const SORT_OPTIONS = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
];

function CarsPageInner() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlSearch = searchParams.get("search");

  const [vehicles, setVehicles] = useState<VehicleWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [fuelType, setFuelType] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000000);

  // Sync category and search query from URL parameters
  useEffect(() => {
    if (urlCategory) {
      const cleanCat = CATEGORIES.find(c => c.toLowerCase() === urlCategory.toLowerCase()) || "All";
      setCategory(cleanCat);
    } else {
      setCategory("All");
    }

    if (urlSearch) {
      setSearch(urlSearch);
    }
  }, [urlCategory, urlSearch]);

  useEffect(() => {
    async function fetchVehicles() {
      setLoading(true);
      const data = await getVehicles();
      setVehicles(data);
      setLoading(false);
    }
    fetchVehicles();
  }, []);

  const filtered = useMemo(() => {
    let result = [...vehicles];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
      );
    }

    if (category !== "All") {
      result = result.filter((v) => v.category === category);
    }

    if (fuelType !== "All") {
      result = result.filter((v) => v.fuel_type === fuelType);
    }

    result = result.filter((v) => v.daily_rate <= maxPrice);

    result.sort((a, b) => {
      if (sortBy === "price-asc") return a.daily_rate - b.daily_rate;
      if (sortBy === "price-desc") return b.daily_rate - a.daily_rate;
      if (sortBy === "rating") return (b.average_rating ?? 0) - (a.average_rating ?? 0);
      if (sortBy === "newest") return b.year - a.year;
      return 0;
    });

    return result;
  }, [vehicles, search, category, fuelType, sortBy, maxPrice]);

  const available = filtered.filter((v) => v.status === "Available").length;

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setFuelType("All");
    setSortBy("rating");
    setMaxPrice(1000000);
  };

  const hasActiveFilters =
    search || category !== "All" || fuelType !== "All" || maxPrice < 1000000;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Visual Pattern Overlays */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none z-0" />

      {/* Header Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Top Row: Brand Header and sorting */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold uppercase tracking-wider">
                <Sparkle className="w-3.5 h-3.5" />
                DriveGo Fleet
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Browse Our Fleet</h1>
              <p className="text-gray-500 text-sm">
                {loading ? "Loading inventory..." : `${available} active vehicles ready · ${filtered.length} matching results`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">Sort By</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 h-10 border-gray-200" size="sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <ArrowsDownUp className="w-4 h-4 text-gray-400" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter button */}
              <Button
                variant="outline"
                size="default"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-10 gap-2 border-gray-200 font-semibold transition-all ${
                  showFilters ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600 hover:text-white" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FadersHorizontal className="w-4.5 h-4.5" />
                Advanced Filters
                {hasActiveFilters && (
                  <span className={`w-2 h-2 rounded-full ${showFilters ? "bg-white" : "bg-orange-500"}`} />
                )}
              </Button>
            </div>
          </div>

          {/* Search bar & Categories line */}
          <div className="grid md:grid-cols-12 gap-4 items-center">
            {/* Search */}
            <div className="md:col-span-4">
              <Input
                placeholder="Search by make, model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<MagnifyingGlass className="h-4.5 w-4.5 text-gray-400" />}
                iconRight={
                  search ? (
                    <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                      <X className="h-4 w-4" />
                    </button>
                  ) : undefined
                }
                className="h-11 border-gray-200 placeholder:text-gray-300"
              />
            </div>

            {/* Category pills */}
            <div className="md:col-span-8 flex flex-wrap gap-2 items-center justify-start lg:justify-end">
              {["All", ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                    category === cat
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "bg-gray-50 border border-gray-100 text-gray-600 hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Expanded filters details */}
          {showFilters && (
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 grid sm:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-200">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fuel Type</label>
                <Select value={fuelType} onValueChange={setFuelType}>
                  <SelectTrigger className="h-10 border-gray-200 bg-white" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                  <span>Maximum Daily Rate</span>
                  <span className="text-orange-500 font-bold">{formatCurrency(maxPrice)}/day</span>
                </label>
                <input
                  type="range"
                  min={25000}
                  max={1000000}
                  step={25000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="accent-orange-500 h-1.5 w-full bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-gray-400 font-semibold">
                  <span>25,000 FCFA</span>
                  <span>1,000,000 FCFA</span>
                </div>
              </div>
            </div>
          )}

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-50 flex-wrap">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active filters:</span>
              {search && (
                <Badge variant="outline" className="gap-1 bg-gray-50/50 border-gray-200 text-gray-700 py-1 px-2.5 rounded-full text-xs font-semibold">
                  Query: &quot;{search}&quot;
                  <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-900">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {category !== "All" && (
                <Badge variant="outline" className="gap-1 bg-gray-50/50 border-gray-200 text-gray-700 py-1 px-2.5 rounded-full text-xs font-semibold">
                  Category: {category}
                  <button onClick={() => setCategory("All")} className="text-gray-400 hover:text-gray-900">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {fuelType !== "All" && (
                <Badge variant="outline" className="gap-1 bg-gray-50/50 border-gray-200 text-gray-700 py-1 px-2.5 rounded-full text-xs font-semibold">
                  Fuel: {fuelType}
                  <button onClick={() => setFuelType("All")} className="text-gray-400 hover:text-gray-900">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {maxPrice < 1000000 && (
                <Badge variant="outline" className="gap-1 bg-gray-50/50 border-gray-200 text-gray-700 py-1 px-2.5 rounded-full text-xs font-semibold">
                  Under: {formatCurrency(maxPrice)}
                  <button onClick={() => setMaxPrice(1000000)} className="text-gray-400 hover:text-gray-900">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-orange-500 hover:text-orange-600 font-bold uppercase tracking-wider pl-1.5"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Car Grid Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <CircleNotch className="h-10 w-10 text-orange-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 p-8 max-w-xl mx-auto shadow-sm">
            <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-500 font-light text-sm max-w-xs mx-auto leading-relaxed">
              We couldn't find any vehicles matching your filter criteria. Try adjusting your search query or price sliders.
            </p>
            <Button variant="default" size="default" className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold" onClick={clearFilters}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filtered.map((car) => (
              <Link key={car.id} href={`/cars/${car.id}`} className="group">
                <Card className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300 h-full flex flex-col group shadow-sm">
                  {/* Vehicle Image section */}
                  <div className="relative overflow-hidden h-52 shrink-0 bg-gray-50">
                    <Image
                      src={car.image_url ?? "/placeholder-car.jpg"}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    
                    {/* Status Badge overlay */}
                    <div className="absolute top-4 left-4 z-10">
                      <StatusBadge status={car.status} />
                    </div>

                    {/* Category overlay */}
                    <div className="absolute bottom-4 right-4 z-10">
                      <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm shadow-sm py-1 px-2.5 rounded-xl border-none text-[11px] font-bold tracking-wider text-gray-700 uppercase">
                        {car.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Details section */}
                  <div className="p-5 flex flex-col flex-1 space-y-4">
                    {/* Title and price row */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold text-gray-900 text-base leading-tight group-hover:text-orange-500 transition-colors">
                          {car.make} {car.model}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 font-medium">{car.color} · {car.year}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-orange-500 text-base leading-none">
                          {formatCurrency(car.daily_rate)}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">/ day</p>
                      </div>
                    </div>

                    {/* Specs badges layout */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-50 text-[11px] text-gray-500 font-medium">
                      <div className="flex items-center gap-1.5 justify-center bg-gray-50/50 rounded-xl py-1">
                        <Users className="h-4 w-4 text-orange-400" />
                        <span>{car.seats} seats</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center bg-gray-50/50 rounded-xl py-1">
                        <GasPump className="h-4 w-4 text-blue-400" />
                        <span>{car.fuel_type}</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center bg-gray-50/50 rounded-xl py-1">
                        <Gauge className="h-4 w-4 text-emerald-400" />
                        <span className="truncate">{car.transmission}</span>
                      </div>
                    </div>

                    {/* CTA button */}
                    <div className="mt-auto pt-2">
                      <Button
                        variant={car.status === "Available" ? "default" : "outline"}
                        size="sm"
                        className={`w-full h-10 font-bold transition-all rounded-xl ${
                          car.status === "Available" 
                            ? "bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/10 text-white" 
                            : "border-gray-200 text-gray-400 hover:bg-white cursor-not-allowed"
                        }`}
                        disabled={car.status !== "Available"}
                      >
                        {car.status === "Available" ? "Book Now" : car.status}
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32 min-h-screen bg-gray-50">
        <CircleNotch className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    }>
      <CarsPageInner />
    </Suspense>
  );
}
