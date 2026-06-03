"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CaretLeft,
  User,
  Phone,
  Envelope,
  MapPin,
  Calendar,
  IdentificationCard,
  Car,
  CircleNotch,
} from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { getCustomerDetails } from "@/lib/actions/customers";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const result = await getCustomerDetails(id);
      setData(result);
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <CircleNotch className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!data || !data.profile) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Customer not found</h2>
        <Link href="/admin/customers">
          <Button variant="outline">Back to Customers</Button>
        </Link>
      </div>
    );
  }

  const { profile, bookings } = data;
  const totalSpent = bookings
    .filter((b: any) => b.booking_status === "completed")
    .reduce((sum: number, b: any) => sum + b.total_amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors"
      >
        <CaretLeft className="w-4 h-4" />
        Back to Customers
      </Link>

      {/* Customer Profile */}
      <Card className="border-gray-100">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  width={96}
                  height={96}
                  className="rounded-2xl object-cover"
                />
              ) : (
                <span className="text-orange-500 font-bold text-3xl">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
                  <Badge variant="secondary" className="mt-2">
                    {profile.role}
                  </Badge>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{profile.phone}</p>
                    </div>
                  </div>
                )}

                {profile.city && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">
                        {profile.city}, {profile.country}
                      </p>
                    </div>
                  </div>
                )}

                {profile.license_number && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <IdentificationCard className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">License Number</p>
                      <p className="text-sm font-medium text-gray-900">{profile.license_number}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-gray-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                <p className="text-sm text-gray-500">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter((b: any) => b.booking_status === "active" || b.booking_status === "confirmed").length}
                </p>
                <p className="text-sm text-gray-500">Active Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <span className="text-orange-500 font-bold text-lg">FCFA</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
                <p className="text-sm text-gray-500">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking History */}
      <Card className="border-gray-100">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking History</h2>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {/* Vehicle Image */}
                  <div className="relative w-full sm:w-32 h-24 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={booking.vehicles?.image_url || "/placeholder-car.jpg"}
                      alt={`${booking.vehicles?.make} ${booking.vehicles?.model}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {booking.vehicles?.make} {booking.vehicles?.model}
                        </h3>
                        <p className="text-sm text-gray-500">{booking.vehicles?.year}</p>
                      </div>
                      <StatusBadge status={booking.booking_status} />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Pickup</p>
                        <p className="font-medium text-gray-900">
                          {new Date(booking.start_date).toLocaleDateString()}
                        </p>
                        {booking.pickup_branch && (
                          <p className="text-xs text-gray-500">{booking.pickup_branch.name}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-500">Return</p>
                        <p className="font-medium text-gray-900">
                          {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                        {booking.dropoff_branch && (
                          <p className="text-xs text-gray-500">{booking.dropoff_branch.name}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Booked on {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                      <p className="font-bold text-orange-500">{formatCurrency(booking.total_amount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
