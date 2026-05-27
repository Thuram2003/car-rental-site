"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MagnifyingGlass,
  Sliders,
  Star,
  Users,
  GasPump,
  Car,
  X,
  CircleNotch,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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

export default function CarsPage() {
  const [vehicles, setVehicles] = useState<VehicleWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [fuelType, setFuelType] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(250000);

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
    setMaxPrice(250000);
  };

  const hasActiveFilters =
    search || category !== "All" || fuelType !== "All" || maxPrice < 250000;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Browse Cars</h1>
              <p className="text-gray-500 text-sm mt-1">
                {loading ? "Loading..." : `${available} vehicles available · ${filtered.length} total results`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-4">
            <Input
              placeholder="Search by make, model, or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<MagnifyingGlass className="h-4 w-4" />}
              iconRight={
                search ? (
                  <button onClick={() => setSearch("")}>
                    <X className="h-4 w-4 hover:text-gray-600" />
                  </button>
                ) : undefined
              }
              className="max-w-lg"
            />
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {["All", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  category === cat
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Fuel Type</label>
                <Select value={fuelType} onValueChange={setFuelType}>
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Max Price: {formatCurrency(maxPrice)}/day
                </label>
                <input
                  type="range"
                  min={25000}
                  max={250000}
                  step={5000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>25 000 FCFA</span>
                  <span>250 000 FCFA</span>
                </div>
              </div>
            </div>
          )}

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-gray-500">Active filters:</span>
              {search && (
                <Badge variant="outline" className="gap-1">
                  &quot;{search}&quot;
                  <button onClick={() => setSearch("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {category !== "All" && (
                <Badge variant="outline" className="gap-1">
                  {category}
                  <button onClick={() => setCategory("All")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-orange-500 hover:text-orange-600 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Car grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <CircleNotch className="h-8 w-8 text-orange-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No cars found</h3>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((car) => (
              <Link key={car.id} href={`/cars/${car.id}`} className="group">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-200 h-full flex flex-col">
                  <div className="relative overflow-hidden h-44">
                    <Image
                      src={car.image_url ?? "/placeholder-car.jpg"}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
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
                      {car.review_count > 0 && (
                        <span className="text-xs text-gray-400">({car.review_count})</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          {car.make} {car.model}
                        </h3>
                        <p className="text-xs text-gray-500">{car.year} · {car.color}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-500">
                          {formatCurrency(car.daily_rate)}
                        </p>
                        <p className="text-xs text-gray-400">/ day</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {car.seats}
                      </span>
                      <span className="flex items-center gap-1">
                        <GasPump className="h-3.5 w-3.5" />
                        {car.fuel_type}
                      </span>
                    </div>

                    <div className="mt-auto">
                      <Button
                        variant={car.status === "Available" ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        disabled={car.status !== "Available"}
                      >
                        {car.status === "Available" ? "Book Now" : car.status}
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
