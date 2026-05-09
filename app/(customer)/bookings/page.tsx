"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarBlank, MapPin, CaretRight, Car } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_BOOKINGS } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function BookingsPage() {
  const bookings = MOCK_BOOKINGS;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">{bookings.length} total bookings</p>
        </div>
        <Link href="/cars">
          <Button variant="default" size="sm">
            <Car className="w-4 h-4" />
            Book a Car
          </Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {["All", "Reserved", "Confirmed", "Completed", "Cancelled"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              tab === "All"
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-sm border border-gray-100">
          <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No bookings yet</h3>
          <p className="text-gray-400 text-sm mt-1">Start by browsing our fleet</p>
          <Link href="/cars" className="mt-4 inline-block">
            <Button variant="default" size="sm">Browse Cars</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-gray-100 overflow-hidden hover:border-primary-light transition-colors">
              <div className="flex flex-col sm:flex-row">
                {/* Car image */}
                <div className="relative w-full sm:w-40 h-36 sm:h-auto shrink-0">
                  <Image
                    src={booking.vehicle.imageUrl}
                    alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Details */}
                <CardContent className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">
                          {booking.vehicle.make} {booking.vehicle.model}
                        </h3>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="text-xs text-gray-400">
                        Ref: <span className="font-mono font-medium text-gray-600">{booking.id.toUpperCase()}</span>
                      </p>
                    </div>
                    <p className="font-bold text-primary text-lg shrink-0">
                      {formatCurrency(booking.totalCost)}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <CalendarBlank className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{booking.pickupLocation}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-400">Booked on {formatDate(booking.createdAt)}</p>
                    <div className="flex items-center gap-2">
                      {(booking.status === "Reserved" || booking.status === "Confirmed") && (
                        <Button variant="destructive" size="sm">Cancel</Button>
                      )}
                      <Link href={`/bookings/${booking.id}`}>
                        <Button variant="outline" size="sm">
                          Details <CaretRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
