"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CaretLeft, CaretRight, Car, MapPin, Check, ShieldCheck, Users, GasPump, CircleNotch,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getVehicleById } from "@/lib/actions/vehicles";
import { createBooking } from "@/lib/actions/bookings";
import { formatCurrency, calculateDays } from "@/lib/utils";
import type { VehicleWithRating } from "@/lib/supabase/types";

const STEPS = ["Select Dates", "Review", "Payment", "Confirmed"];
const SERVICE_FEE = 5000;

const LOCATIONS = [
  { value: "douala", label: "Douala Branch" },
  { value: "airport", label: "Airport Branch" },
  { value: "yaounde", label: "Yaoundé Branch" },
];

// ─── Inner component (uses useSearchParams) ───────────────────────────────────

function BookPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const carId = searchParams.get("carId");
  const urlStartDate = searchParams.get("startDate");
  const urlEndDate = searchParams.get("endDate");

  const [car, setCar] = useState<VehicleWithRating | null>(null);
  const [loadingCar, setLoadingCar] = useState(true);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const [form, setForm] = useState({
    startDate: urlStartDate || "",
    endDate: urlEndDate || "",
    pickupLocation: "douala",
    dropoffLocation: "douala",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  // Fetch vehicle on mount
  useEffect(() => {
    if (!carId) {
      setLoadingCar(false);
      return;
    }
    getVehicleById(carId).then((data) => {
      setCar(data);
      setLoadingCar(false);
    });
  }, [carId]);

  const days =
    form.startDate && form.endDate
      ? calculateDays(new Date(form.startDate), new Date(form.endDate))
      : 0;

  const subtotal = car ? days * car.daily_rate : 0;
  const total = subtotal + SERVICE_FEE;

  const handleNext = async () => {
    if (step === 2) {
      // Submit booking to Supabase
      if (!car) return;
      setSubmitting(true);

      const { id, error } = await createBooking({
        vehicleId: car.id,
        startDate: form.startDate,
        endDate: form.endDate,
        dailyRate: car.daily_rate,
        subtotal,
        totalAmount: total,
      });

      setSubmitting(false);

      if (error) {
        if (error.includes("signed in")) {
          toast.error("Please sign in to complete your booking.");
          router.push(`/login?redirectTo=/book?carId=${car.id}`);
          return;
        }
        toast.error("Booking failed", { description: error });
        return;
      }

      setBookingRef(id);
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loadingCar) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <CircleNotch className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // ── No car found ───────────────────────────────────────────────────────────
  if (!car) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No vehicle selected</h2>
        <p className="text-gray-500 text-sm mb-6">
          Please choose a car from our fleet first.
        </p>
        <Link href="/cars">
          <Button variant="default">Browse Cars</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link
        href={`/cars/${car.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
      >
        <CaretLeft className="w-4 h-4" />
        Back to car details
      </Link>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step
                    ? "bg-success text-white"
                    : i === step
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < step ? <Check className="w-4 h-4" weight="bold" /> : i + 1}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium hidden sm:block ${
                  i <= step ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors ${
                  i < step ? "bg-success" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Main content ── */}
        <div className="lg:col-span-2">

          {/* Step 0 — Select Dates */}
          {step === 0 && (
            <Card className="border-gray-100">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-base font-semibold text-gray-900">Select Dates & Location</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Pick-up Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full rounded-sm border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Return Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      min={form.startDate || new Date().toISOString().split("T")[0]}
                      className="w-full rounded-sm border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {days > 0 && (
                  <div className="bg-primary-lighter border border-primary-light rounded-sm px-4 py-3 text-sm text-primary">
                    <span className="font-semibold">{days} day{days > 1 ? "s" : ""}</span> rental ·{" "}
                    {formatCurrency(subtotal)} subtotal
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Pick-up Location</label>
                  <Select
                    value={form.pickupLocation}
                    onValueChange={(v) => setForm({ ...form, pickupLocation: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((l) => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Drop-off Location</label>
                  <Select
                    value={form.dropoffLocation}
                    onValueChange={(v) => setForm({ ...form, dropoffLocation: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((l) => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="default"
                  size="lg"
                  className="w-full"
                  onClick={handleNext}
                  disabled={!form.startDate || !form.endDate || days <= 0}
                >
                  Continue to Review
                  <CaretRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 1 — Review */}
          {step === 1 && (
            <Card className="border-gray-100">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-base font-semibold text-gray-900">Review Your Booking</h2>

                <div className="flex gap-4 p-4 bg-gray-50 rounded-sm">
                  <div className="relative w-24 h-20 rounded-sm overflow-hidden shrink-0">
                    <Image
                      src={car.image_url ?? "/placeholder-car.jpg"}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{car.make} {car.model}</p>
                    <p className="text-sm text-gray-500">{car.year} · {car.category}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{car.seats} seats</span>
                      <span className="flex items-center gap-1"><GasPump className="w-3.5 h-3.5" />{car.fuel_type}</span>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-sm">
                    <p className="text-xs text-gray-400 mb-1">Pick-up</p>
                    <p className="font-semibold text-gray-800 text-sm">{form.startDate}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {LOCATIONS.find((l) => l.value === form.pickupLocation)?.label}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-sm">
                    <p className="text-xs text-gray-400 mb-1">Return</p>
                    <p className="font-semibold text-gray-800 text-sm">{form.endDate}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {LOCATIONS.find((l) => l.value === form.dropoffLocation)?.label}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(0)}>Back</Button>
                  <Button variant="default" size="lg" className="flex-1" onClick={handleNext}>
                    Proceed to Payment <CaretRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2 — Payment */}
          {step === 2 && (
            <Card className="border-gray-100">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-base font-semibold text-gray-900">Payment Details</h2>

                <div className="flex items-center gap-3 p-3 bg-info-light border border-info/20 rounded-sm">
                  <ShieldCheck className="w-5 h-5 text-info shrink-0" />
                  <p className="text-sm text-info">Your payment is secured with 256-bit SSL encryption</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Cardholder Name</label>
                  <Input
                    placeholder="James Osei"
                    value={form.cardName}
                    onChange={(e) => setForm({ ...form, cardName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Card Number</label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={form.cardNumber}
                    onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Expiry Date</label>
                    <Input
                      placeholder="MM / YY"
                      value={form.expiry}
                      onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">CVV</label>
                    <Input
                      placeholder="•••"
                      value={form.cvv}
                      onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)} disabled={submitting}>
                    Back
                  </Button>
                  <Button
                    variant="default"
                    size="lg"
                    className="flex-1"
                    onClick={handleNext}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <><CircleNotch className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      `Pay ${formatCurrency(total)}`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3 — Confirmed */}
          {step === 3 && (
            <Card className="border-gray-100">
              <CardContent className="p-8 text-center space-y-5">
                <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-success" weight="bold" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
                  {bookingRef && (
                    <p className="text-gray-500 mt-2">
                      Your booking reference is{" "}
                      <span className="font-bold text-primary font-mono">
                        #{bookingRef.toUpperCase().slice(0, 8)}
                      </span>
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  You can track your booking status in My Bookings.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/bookings">
                    <Button variant="default" size="lg">View My Bookings</Button>
                  </Link>
                  <Link href="/cars">
                    <Button variant="outline" size="lg">Browse More Cars</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Order summary sidebar ── */}
        {step < 3 && (
          <div className="space-y-4">
            <Card className="border-gray-100">
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm">Order Summary</h3>

                <div className="relative h-32 rounded-sm overflow-hidden mb-4">
                  <Image
                    src={car.image_url ?? "/placeholder-car.jpg"}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <p className="font-semibold text-gray-900 text-sm">{car.make} {car.model}</p>
                <p className="text-xs text-gray-500 mb-4">{car.year} · {car.category}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      {formatCurrency(car.daily_rate)} × {days || "—"} days
                    </span>
                    <span className="text-gray-700 font-medium">
                      {days ? formatCurrency(subtotal) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Insurance</span>
                    <span className="text-success font-medium">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service fee</span>
                    <span className="text-gray-700 font-medium">{formatCurrency(SERVICE_FEE)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-primary text-lg">
                      {days ? formatCurrency(total) : "—"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-primary-lighter border border-primary-light rounded-sm p-4">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-primary">
                  Free cancellation up to 24 hours before your pickup date.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page export (wraps in Suspense for useSearchParams) ──────────────────────

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <CircleNotch className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <BookPageInner />
    </Suspense>
  );
}
