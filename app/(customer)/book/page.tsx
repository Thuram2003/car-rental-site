"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CaretLeft, CaretRight, Car, MapPin, CreditCard, Check, ShieldCheck, Users, GasPump,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MOCK_VEHICLES } from "@/lib/mock-data";
import { formatCurrency, calculateDays } from "@/lib/utils";

const STEPS = ["Select Dates", "Review", "Payment", "Confirmed"];

const CAR = MOCK_VEHICLES[0];
const LOCATIONS = [
  { value: "downtown", label: "Downtown Branch" },
  { value: "airport", label: "Airport Branch" },
  { value: "mall", label: "Mall Branch" },
];

export default function BookPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    pickupLocation: "downtown",
    dropoffLocation: "downtown",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const days =
    form.startDate && form.endDate
      ? calculateDays(new Date(form.startDate), new Date(form.endDate))
      : 0;

  const subtotal = days * CAR.dailyRate;
  const serviceFee = 15;
  const total = subtotal + serviceFee;

  const handleNext = async () => {
    if (step === 2) {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 1500));
      setLoading(false);
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link
        href={`/cars/${CAR.id}`}
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
        {/* Main content */}
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
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                    <Image src={CAR.imageUrl} alt={`${CAR.make} ${CAR.model}`} fill className="object-cover" unoptimized />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{CAR.make} {CAR.model}</p>
                    <p className="text-sm text-gray-500">{CAR.year} · {CAR.category}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{CAR.seats} seats</span>
                      <span className="flex items-center gap-1"><GasPump className="w-3.5 h-3.5" />{CAR.fuelType}</span>
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
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                  <Button
                    variant="default"
                    size="lg"
                    className="flex-1"
                    onClick={handleNext}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : `Pay ${formatCurrency(total)}`}
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
                  <p className="text-gray-500 mt-2">
                    Your booking reference is{" "}
                    <span className="font-bold text-primary">#DG-2026-0042</span>
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  A confirmation email has been sent to your registered email address.
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

        {/* Order summary sidebar */}
        {step < 3 && (
          <div className="space-y-4">
            <Card className="border-gray-100">
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm">Order Summary</h3>

                <div className="relative h-32 rounded-sm overflow-hidden mb-4">
                  <Image src={CAR.imageUrl} alt={`${CAR.make} ${CAR.model}`} fill className="object-cover" unoptimized />
                </div>

                <p className="font-semibold text-gray-900 text-sm">{CAR.make} {CAR.model}</p>
                <p className="text-xs text-gray-500 mb-4">{CAR.year} · {CAR.category}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{formatCurrency(CAR.dailyRate)} × {days || "—"} days</span>
                    <span className="text-gray-700 font-medium">{days ? formatCurrency(subtotal) : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Insurance</span>
                    <span className="text-success font-medium">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service fee</span>
                    <span className="text-gray-700 font-medium">{formatCurrency(serviceFee)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-primary text-lg">{days ? formatCurrency(total) : "—"}</span>
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
