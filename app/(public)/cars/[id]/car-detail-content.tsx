"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users, GasPump, Car, MapPin, ShieldCheck, CaretLeft, Check, Gauge, Gear,
  Calendar, Money, WarningCircle, Sparkle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, calculateDays } from "@/lib/utils";
import type { VehicleWithRating } from "@/lib/supabase/types";

interface CarDetailContentProps {
  car: VehicleWithRating;
  similar: VehicleWithRating[];
}

const SERVICE_FEE = 5000;

export function CarDetailContent({ car, similar }: CarDetailContentProps) {
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const features = Array.isArray(car.features) ? (car.features as string[]) : [];

  // Calculate dynamic days and costs
  const days = pickupDate && returnDate 
    ? calculateDays(new Date(pickupDate), new Date(returnDate)) 
    : 0;

  const subtotal = car.daily_rate * (days || 1);
  const total = subtotal + SERVICE_FEE;

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors"
          >
            <CaretLeft className="w-4.5 h-4.5" />
            Back to Browse
          </Link>
          <div className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-medium font-mono">
            ID: {car.id.slice(0, 8).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Block - Images & Description */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Elegant Hero Frame */}
            <div className="relative rounded-3xl overflow-hidden shadow-md bg-white border border-gray-100 group">
              <div className="relative h-80 sm:h-[500px] w-full">
                <Image
                  src={car.image_url ?? "/placeholder-car.jpg"}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              {/* Overlays */}
              <div className="absolute top-6 left-6 flex gap-2">
                <StatusBadge status={car.status} />
                <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm text-gray-700 font-bold tracking-wider py-1 px-3 border-none shadow-sm rounded-xl text-xs uppercase">{car.category}</Badge>
              </div>
            </div>

            {/* General details Card */}
            <Card className="border-gray-100 shadow-sm bg-white rounded-3xl">
              <CardContent className="p-6 sm:p-8 space-y-6">
                
                {/* Title area */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-gray-100">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                      {car.make} {car.model}
                    </h1>
                    <p className="text-gray-500 font-medium text-sm sm:text-base">
                      Model Year {car.year} · Primary Color {car.color}
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-3xl font-extrabold text-orange-500">
                      {formatCurrency(car.daily_rate)}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">daily base rate</p>
                  </div>
                </div>

                {/* Grid specs cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 py-2">
                  {[
                    { icon: Users, label: "Capacity", value: `${car.seats} Seats`, color: "text-orange-500", bg: "bg-orange-50/50 border-orange-100" },
                    { icon: GasPump, label: "Fuel Type", value: car.fuel_type, color: "text-blue-500", bg: "bg-blue-50/50 border-blue-100" },
                    { icon: Gear, label: "Gearbox", value: car.transmission, color: "text-indigo-500", bg: "bg-indigo-50/50 border-indigo-100" },
                    { icon: Gauge, label: "Odometer", value: `${car.mileage.toLocaleString()} km`, color: "text-emerald-500", bg: "bg-emerald-50/50 border-emerald-100" },
                  ].map(({ icon: Icon, label, value, color, bg }) => (
                    <div key={label} className={`p-4 rounded-2xl border ${bg} text-center space-y-1.5 hover:shadow-md transition-shadow`}>
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-bold text-gray-800">{value}</p>
                    </div>
                  ))}
                </div>

                {/* About description */}
                {car.description && (
                  <div className="space-y-3 pt-4">
                    <h3 className="font-bold text-gray-900 text-base">Vehicle Specifications</h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-light">{car.description}</p>
                  </div>
                )}

                {/* Features chips */}
                {features.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-gray-50">
                    <h3 className="font-bold text-gray-900 text-base">Amenities & Inclusions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium">
                          <div className="w-5.5 h-5.5 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-emerald-600" weight="bold" />
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Branch details & maps */}
            <Card className="border-gray-100 shadow-sm rounded-3xl bg-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2.5 text-base">
                  <MapPin className="w-5.5 h-5.5 text-orange-500" />
                  Branch Office Pick-up
                </h3>
                <p className="text-gray-500 text-sm font-light mb-4 leading-relaxed">
                  Select your branch in the checkout form. Pickups and returns are scheduled at our secure terminals in Douala, Yaoundé, or Limbe.
                </p>
                <div className="h-40 bg-gray-950 relative rounded-2xl border border-gray-900 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.06),transparent_70%)]" />
                  <div className="text-center space-y-1 relative z-10 px-4">
                    <Sparkle className="w-7 h-7 text-orange-500 mx-auto animate-spin" />
                    <p className="text-xs font-bold text-white uppercase tracking-wider mt-1.5">Interactive Map Integrations</p>
                    <p className="text-[11px] text-gray-500 font-light">Location matching active branch listings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Block - Booking Price Calculator Card */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Calculator Card */}
            <Card className="border-gray-100 shadow-xl sticky top-24 rounded-3xl bg-white overflow-hidden">
              <div className="bg-gray-900 text-white p-5">
                <h2 className="font-bold text-base tracking-wide flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Configure Your Rental
                </h2>
              </div>
              <CardContent className="p-6 space-y-6">
                
                {car.status !== "Available" ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                      <WarningCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-800">Currently Unvailable</p>
                      <p className="text-xs text-gray-500 font-light max-w-[200px] mx-auto leading-relaxed">
                        This car is rented, reserved, or undergoing maintenance.
                      </p>
                    </div>
                    <Link href="/cars" className="block pt-2">
                      <Button variant="outline" size="sm" className="w-full font-semibold border-gray-200">
                        View Available Fleet
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Real-time parameters */}
                    <div className="space-y-4">
                      {/* Pick-up Date Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pick-up Date</label>
                        <input
                          type="date"
                          min={todayStr}
                          value={pickupDate}
                          onChange={(e) => {
                            setPickupDate(e.target.value);
                            // If return date is before pickup, reset it
                            if (returnDate && e.target.value > returnDate) {
                              setReturnDate("");
                            }
                          }}
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-700 font-medium"
                        />
                      </div>

                      {/* Return Date Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Return Date</label>
                        <input
                          type="date"
                          min={pickupDate || todayStr}
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-700 font-medium"
                          disabled={!pickupDate}
                        />
                      </div>
                    </div>

                    {/* Price break-down display */}
                    <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 space-y-3">
                      <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Base Rate</span>
                        <span>{formatCurrency(car.daily_rate)}/day</span>
                      </div>
                      
                      {days > 0 && (
                        <>
                          <div className="flex justify-between text-xs font-medium text-gray-500">
                            <span>Duration</span>
                            <span className="font-semibold text-gray-800">{days} day{days > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex justify-between text-xs font-medium text-gray-500">
                            <span>Subtotal</span>
                            <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-xs font-medium text-gray-500">
                            <span>Insurance Cover</span>
                            <span className="text-emerald-600 font-semibold uppercase tracking-wider text-[10px]">Included</span>
                          </div>
                          <div className="flex justify-between text-xs font-medium text-gray-500">
                            <span>Service Fee</span>
                            <span className="font-bold text-gray-900">{formatCurrency(SERVICE_FEE)}</span>
                          </div>
                        </>
                      )}

                      <div className="border-t border-gray-200/60 pt-3.5 flex justify-between items-baseline">
                        <span className="font-bold text-gray-900 text-sm">Estimated Total</span>
                        <span className="font-extrabold text-orange-500 text-xl">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>

                    {/* Book Link trigger */}
                    <Link
                      href={
                        pickupDate && returnDate
                          ? `/book?carId=${car.id}&startDate=${pickupDate}&endDate=${returnDate}`
                          : `/book?carId=${car.id}`
                      }
                      className="block"
                    >
                      <Button variant="default" size="lg" className="w-full text-base font-semibold h-11 bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/10">
                        Book Vehicle
                      </Button>
                    </Link>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Free cancellation 24h prior to reservation</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar Trust Badges */}
            <Card className="border-gray-100 shadow-sm rounded-3xl bg-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-sm tracking-wide uppercase">Rental Guarantee</h3>
                <div className="space-y-4">
                  {[
                    { icon: ShieldCheck, text: "Fully insured premium fleet", color: "text-emerald-600", bg: "bg-emerald-50" },
                    { icon: Car, text: "24/7 Cameroon road assistance", color: "text-blue-600", bg: "bg-blue-50" },
                    { icon: MapPin, text: "Flexible branch drop-offs", color: "text-purple-600", bg: "bg-purple-50" },
                  ].map(({ icon: Icon, text, color, bg }) => (
                    <div key={text} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Similar Cars Grid */}
        {similar.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-6">Explore Similar Vehicles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((v) => (
                <Link key={v.id} href={`/cars/${v.id}`} className="group">
                  <Card className="overflow-hidden border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all duration-300 rounded-3xl bg-white shadow-sm h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden bg-gray-50">
                      <Image
                        src={v.image_url ?? "/placeholder-car.jpg"}
                        alt={`${v.make} ${v.model}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                      <div className="absolute top-4 left-4">
                        <StatusBadge status={v.status} />
                      </div>
                    </div>
                    
                    <CardContent className="p-5 flex flex-col flex-1 space-y-4">
                      <div>
                        <p className="font-extrabold text-gray-900 text-base leading-tight group-hover:text-orange-500 transition-colors">{v.make} {v.model}</p>
                        <p className="text-xs text-gray-400 mt-1 font-medium">{v.year} · {v.category}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Estimated base</span>
                        <span className="font-extrabold text-orange-500 text-lg">
                          {formatCurrency(v.daily_rate)}
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-normal"> /day</span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
