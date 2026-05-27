"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star, Users, GasPump, Car, MapPin, ShieldCheck, CaretLeft, Check, Gauge, Gear,
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

export function CarDetailContent({ car, similar }: CarDetailContentProps) {
  const features = Array.isArray(car.features) ? (car.features as string[]) : [];
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  
  const days = pickupDate && returnDate ? calculateDays(new Date(pickupDate), new Date(returnDate)) : 3;
  const subtotal = car.daily_rate * days;
  const serviceFee = 5000;
  const total = subtotal + serviceFee;

  return (
    <div className="min-h-screen bg-page">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/cars"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            <CaretLeft className="w-4 h-4" />
            Back to Browse
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left — Images + Details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Main image */}
            <div className="relative rounded-sm overflow-hidden shadow-sm">
              <Image
                src={car.image_url ?? "/placeholder-car.jpg"}
                alt={`${car.make} ${car.model}`}
                width={800}
                height={450}
                className="w-full h-72 sm:h-96 object-cover"
                unoptimized
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <StatusBadge status={car.status} />
                <Badge variant="secondary">{car.category}</Badge>
              </div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-sm px-3 py-1.5 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-warning fill-warning" weight="fill" />
                <span className="font-bold text-gray-800 text-sm">
                  {car.average_rating > 0 ? car.average_rating.toFixed(1) : "New"}
                </span>
                {car.review_count > 0 && (
                  <span className="text-gray-400 text-xs">({car.review_count})</span>
                )}
              </div>
            </div>

            {/* Car info */}
            <Card className="border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {car.make} {car.model}
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                      {car.year} · {car.color}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(car.daily_rate)}
                    </p>
                    <p className="text-gray-400 text-xs">per day</p>
                  </div>
                </div>

                {/* Specs grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-y border-gray-100">
                  {[
                    { icon: Users, label: "Seats", value: `${car.seats} people` },
                    { icon: GasPump, label: "Fuel", value: car.fuel_type },
                    { icon: Gear, label: "Transmission", value: car.transmission },
                    { icon: Gauge, label: "Mileage", value: `${car.mileage.toLocaleString()} km` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="text-center">
                      <div className="w-10 h-10 bg-primary-lighter border border-primary-light rounded-sm flex items-center justify-center mx-auto mb-2">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                {features.length > 0 && (
                  <div className="mt-5">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">Features</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-5 h-5 bg-success-light rounded-full flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-success" weight="bold" />
                          </div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location placeholder */}
            <Card className="border-gray-100">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Pickup Location
                </h3>
                <p className="text-gray-600 text-sm">Contact us to confirm pickup branch</p>
                <div className="mt-3 h-28 bg-gray-50 rounded-sm border border-gray-100 flex items-center justify-center">
                  <p className="text-gray-400 text-xs">Map preview</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right — Booking card */}
          <div className="space-y-4">
            <Card className="border-gray-100 sticky top-24">
              <CardContent className="p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Book This Car</h2>

                {car.status !== "Available" ? (
                  <div className="text-center py-6">
                    <StatusBadge status={car.status} />
                    <p className="text-gray-500 text-sm mt-3">
                      This vehicle is currently not available.
                    </p>
                    <Link href="/cars" className="mt-4 block">
                      <Button variant="outline" size="sm" className="w-full">
                        Browse Available Cars
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                          Pick-up Date
                        </label>
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full rounded-sm border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                          Return Date
                        </label>
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full rounded-sm border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          min={pickupDate || new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </div>

                    {/* Price breakdown */}
                    <div className="bg-gray-50 rounded-sm p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{formatCurrency(car.daily_rate)} × {days} day{days > 1 ? 's' : ''}</span>
                        <span className="text-gray-700 font-medium">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Insurance</span>
                        <span className="text-success font-medium">Included</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Service fee</span>
                        <span className="text-gray-700 font-medium">{formatCurrency(serviceFee)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 flex justify-between">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-primary text-lg">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>

                    <Link href={`/book?carId=${car.id}${pickupDate ? `&startDate=${pickupDate}` : ''}${returnDate ? `&endDate=${returnDate}` : ''}`}>
                      <Button variant="default" size="lg" className="w-full">
                        Continue to Book
                      </Button>
                    </Link>

                    <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Free cancellation up to 24h before pickup
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trust badges */}
            <Card className="border-gray-100">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {[
                    { icon: ShieldCheck, text: "Fully insured vehicle" },
                    { icon: Car, text: "24/7 roadside assistance" },
                    { icon: MapPin, text: "Flexible pickup & dropoff" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 bg-primary-lighter border border-primary-light rounded-sm flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar cars */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Similar Vehicles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map((v) => (
                <Link key={v.id} href={`/cars/${v.id}`} className="group">
                  <Card className="overflow-hidden border-gray-100 hover:border-primary-light hover:shadow-md transition-all">
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={v.image_url ?? "/placeholder-car.jpg"}
                        alt={`${v.make} ${v.model}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{v.make} {v.model}</p>
                        <p className="text-xs text-gray-400">{v.year}</p>
                      </div>
                      <p className="font-bold text-primary text-sm">
                        {formatCurrency(v.daily_rate)}<span className="text-xs text-gray-400 font-normal">/day</span>
                      </p>
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
