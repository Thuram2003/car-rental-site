"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CaretLeft, CaretRight, Car, MapPin, Check, ShieldCheck, Users, GasPump, CircleNotch,
  Calendar, CreditCard, Receipt, IdentificationCard, Shield, Building, Money, Phone, WarningCircle
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getVehicleById } from "@/lib/actions/vehicles";
import { createBooking, getActiveBranches } from "@/lib/actions/bookings";
import { formatCurrency, calculateDays } from "@/lib/utils";
import type { VehicleWithRating } from "@/lib/supabase/types";

const STEPS = [
  { label: "Dates & Location", icon: Calendar },
  { label: "Review Booking", icon: IdentificationCard },
  { label: "Secure Payment", icon: CreditCard },
  { label: "Confirmation", icon: Receipt },
];

const SERVICE_FEE = 5000;

function BookPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const carId = searchParams.get("carId");
  const urlStartDate = searchParams.get("startDate");
  const urlEndDate = searchParams.get("endDate");

  const [car, setCar] = useState<VehicleWithRating | null>(null);
  const [branches, setBranches] = useState<Array<{ id: string; name: string; city: string }>>([]);
  const [loadingCar, setLoadingCar] = useState(true);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  
  // Payment option states
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile_money" | "cash">("card");
  const [paymentProvider, setPaymentProvider] = useState<"MTN Mobile Money" | "Orange Money">("MTN Mobile Money");
  const [momoPhone, setMomoPhone] = useState("");

  const [form, setForm] = useState({
    startDate: urlStartDate || "",
    endDate: urlEndDate || "",
    pickupLocation: "",
    dropoffLocation: "",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  // Fetch vehicle and branches on mount
  useEffect(() => {
    async function fetchData() {
      setLoadingCar(true);
      
      const branchesData = await getActiveBranches();
      setBranches(branchesData);
      
      if (branchesData.length > 0 && !form.pickupLocation) {
        setForm(prev => ({
          ...prev,
          pickupLocation: branchesData[0].id,
          dropoffLocation: branchesData[0].id,
        }));
      }

      if (carId) {
        const vehicleData = await getVehicleById(carId);
        setCar(vehicleData);
      }
      
      setLoadingCar(false);
    }
    
    fetchData();
  }, [carId]);

  const days =
    form.startDate && form.endDate
      ? calculateDays(new Date(form.startDate), new Date(form.endDate))
      : 0;

  const subtotal = car ? days * car.daily_rate : 0;
  const total = subtotal + SERVICE_FEE;

  const handleNext = async () => {
    if (step === 2) {
      if (!car) return;
      setSubmitting(true);

      const { id, error } = await createBooking({
        vehicleId: car.id,
        startDate: form.startDate,
        endDate: form.endDate,
        pickupBranchId: form.pickupLocation,
        dropoffBranchId: form.dropoffLocation,
        dailyRate: car.daily_rate,
        subtotal,
        totalAmount: total,
        paymentMethod,
        paymentProvider: paymentMethod === "mobile_money" ? paymentProvider : undefined,
        phoneNumber: paymentMethod === "mobile_money" ? momoPhone : undefined,
      });

      setSubmitting(false);

      if (error) {
        if (error.includes("signed in")) {
          toast.error("Authentication Required", { description: "Please sign in to complete your booking." });
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

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  // Helper to format credit card numbers
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  if (loadingCar) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <CircleNotch className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5 bg-white rounded-3xl border border-gray-100 shadow-sm mt-10">
        <Car className="w-16 h-16 text-gray-300 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">No vehicle selected</h2>
          <p className="text-gray-500 font-light text-sm max-w-xs mx-auto">
            Please choose a vehicle from our fleet before checkout.
          </p>
        </div>
        <Link href="/cars" className="block pt-2">
          <Button variant="default" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
            Browse Fleet
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      
      {/* Back to details link */}
      {step < 3 && (
        <Link
          href={`/cars/${car.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-orange-500 mb-8 transition-colors"
        >
          <CaretLeft className="w-4.5 h-4.5" />
          Back to car details
        </Link>
      )}

      {/* Modern Stepper Indicator */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mb-10 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[640px] px-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCompleted = i < step;
            const isActive = i === step;
            return (
              <div key={s.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                        : isActive
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/10"
                        : "bg-gray-50 border border-gray-100 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" weight="bold" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isActive || isCompleted ? "text-gray-400" : "text-gray-300"}`}>Step 0{i + 1}</p>
                    <p className={`text-sm font-bold truncate ${isActive ? "text-orange-500" : isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                      {s.label}
                    </p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-8 rounded-full transition-colors ${
                      i < step ? "bg-emerald-500" : "bg-gray-100"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Flow Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form components */}
        <div className="lg:col-span-8">
          
          {/* STEP 0 - Dates and Locations */}
          {step === 0 && (
            <Card className="border-gray-100 shadow-sm rounded-3xl bg-white">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <h2 className="text-xl font-bold text-gray-900 pb-4 border-b border-gray-50 flex items-center gap-2">
                  <Calendar className="w-5.5 h-5.5 text-orange-500" />
                  Select Schedule & Branch
                </h2>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pick-up Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-700 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Return Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      min={form.startDate || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-700 font-medium"
                      disabled={!form.startDate}
                    />
                  </div>
                </div>

                {days > 0 && (
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 text-sm text-orange-600 flex items-center justify-between font-semibold">
                    <span>Selected Rental Term:</span>
                    <span>{days} Day{days > 1 ? "s" : ""}</span>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pick-up Location</label>
                    <Select
                      value={form.pickupLocation}
                      onValueChange={(v) => setForm({ ...form, pickupLocation: v })}
                    >
                      <SelectTrigger className="h-11 border-gray-200 bg-white rounded-xl"><SelectValue placeholder="Select pickup location" /></SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name} - {branch.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Drop-off Location</label>
                    <Select
                      value={form.dropoffLocation}
                      onValueChange={(v) => setForm({ ...form, dropoffLocation: v })}
                    >
                      <SelectTrigger className="h-11 border-gray-200 bg-white rounded-xl"><SelectValue placeholder="Select dropoff location" /></SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name} - {branch.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full h-11 bg-orange-500 hover:bg-orange-600 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                    onClick={handleNext}
                    disabled={!form.startDate || !form.endDate || days <= 0 || !form.pickupLocation || !form.dropoffLocation}
                  >
                    Continue to Review
                    <CaretRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 1 - Review Booking */}
          {step === 1 && (
            <Card className="border-gray-100 shadow-sm rounded-3xl bg-white">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <h2 className="text-xl font-bold text-gray-900 pb-4 border-b border-gray-50 flex items-center gap-2">
                  <IdentificationCard className="w-5.5 h-5.5 text-orange-500" />
                  Review Your Selection
                </h2>

                {/* Car visual summary */}
                <div className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 items-center">
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden shrink-0 border border-white shadow-sm">
                    <Image
                      src={car.image_url ?? "/placeholder-car.jpg"}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900 text-base">{car.make} {car.model}</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{car.year} · {car.category} · {car.color}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400 font-semibold">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{car.seats} seats</span>
                      <span className="flex items-center gap-1"><GasPump className="w-3.5 h-3.5" />{car.fuel_type}</span>
                    </div>
                  </div>
                </div>

                {/* Pickup and return boxes */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pickup</span>
                    <p className="font-bold text-gray-800 text-sm">{form.startDate}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 font-medium pt-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      {branches.find((b) => b.id === form.pickupLocation)?.name || "Not selected"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Return</span>
                    <p className="font-bold text-gray-800 text-sm">{form.endDate}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 font-medium pt-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      {branches.find((b) => b.id === form.dropoffLocation)?.name || "Not selected"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" size="lg" className="flex-1 h-11 border-gray-200 text-gray-700 font-bold uppercase tracking-wider" onClick={handleBack}>
                    Back
                  </Button>
                  <Button variant="default" size="lg" className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-wider flex items-center justify-center gap-1" onClick={handleNext}>
                    Proceed to Payment
                    <CaretRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}          {/* STEP 2 - Payment and Credit Card Form */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Payment Method Tabs */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-3xl border text-center flex flex-col items-center justify-center gap-2.5 transition-all font-bold text-xs uppercase tracking-wider ${
                    paymentMethod === "card"
                      ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-950/15"
                      : "bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <CreditCard className="w-6 h-6 shrink-0" />
                  <span>Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("mobile_money")}
                  className={`p-4 rounded-3xl border text-center flex flex-col items-center justify-center gap-2.5 transition-all font-bold text-xs uppercase tracking-wider ${
                    paymentMethod === "mobile_money"
                      ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-950/15"
                      : "bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Building className="w-6 h-6 shrink-0" />
                  <span>Mobile Money</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-4 rounded-3xl border text-center flex flex-col items-center justify-center gap-2.5 transition-all font-bold text-xs uppercase tracking-wider ${
                    paymentMethod === "cash"
                      ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-950/15"
                      : "bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Money className="w-6 h-6 shrink-0" />
                  <span>Cash Desk</span>
                </button>
              </div>

              {/* Dynamic Payment Device Preview Screen */}
              {paymentMethod === "card" && (
                <div className="flex justify-center py-4">
                  <div className="relative w-80 sm:w-[360px] h-52 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 shadow-xl border border-slate-800 flex flex-col justify-between overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_40%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_45%)]" />
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Premium Member</p>
                        <h4 className="font-extrabold text-sm tracking-wide text-slate-100">DriveGo Pay</h4>
                      </div>
                      <div className="w-10 h-8 bg-gradient-to-br from-amber-300 to-amber-500 rounded-lg shadow-inner flex flex-col justify-around p-1">
                        <div className="h-px bg-amber-900/10 w-full" />
                        <div className="h-px bg-amber-900/10 w-full" />
                        <div className="h-px bg-amber-900/10 w-full" />
                      </div>
                    </div>

                    <div className="relative z-10 my-4">
                      <p className="text-lg sm:text-xl font-mono tracking-widest text-slate-100 text-center">
                        {form.cardNumber || "•••• •••• •••• ••••"}
                      </p>
                    </div>

                    <div className="flex justify-between items-end relative z-10">
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Cardholder</p>
                        <p className="text-xs font-bold uppercase tracking-wide truncate max-w-[180px] text-slate-200">
                          {form.cardName || "NAME ON CARD"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Expires</p>
                        <p className="text-xs font-bold font-mono text-slate-200">{form.expiry || "MM/YY"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "mobile_money" && (
                <div className="flex justify-center py-4">
                  <div className="relative w-80 sm:w-[360px] h-52 rounded-3xl bg-slate-950 text-white p-6 shadow-xl border border-slate-800 flex flex-col justify-between overflow-hidden transition-all duration-350">
                    {paymentProvider === "MTN Mobile Money" ? (
                      <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_40%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(250,204,21,0.04),transparent_45%)]" />
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_40%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.04),transparent_45%)]" />
                      </>
                    )}

                    <div className="flex justify-between items-center relative z-10">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Mobile Wallet</span>
                        <h4 className="font-extrabold text-sm text-slate-200 tracking-wide">
                          {paymentProvider === "MTN Mobile Money" ? "MTN MoMo Push" : "Orange Money Pay"}
                        </h4>
                      </div>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm select-none bg-slate-900 border border-slate-800/80">
                        <Image
                          src={paymentProvider === "MTN Mobile Money" ? "/mtn-logo.png" : "/orange-logo.png"}
                          alt="momo-provider"
                          width={14}
                          height={28}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    </div>

                    <div className="relative z-10 my-3 text-center space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Awaiting Manual Confirmation</p>
                      <p className="text-lg font-mono tracking-widest text-slate-200">
                        {momoPhone ? `+237 ${momoPhone.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4")}` : "+237 6•• •• •• ••"}
                      </p>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800/80 text-[9px] font-semibold text-slate-400 animate-pulse mt-1">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        Pending Dial Approval
                      </div>
                    </div>

                    <div className="flex justify-between items-end relative z-10 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-slate-650 font-bold uppercase tracking-widest">Charge Total</span>
                        <p className="font-extrabold text-slate-200">{formatCurrency(total)}</p>
                      </div>
                      <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Local Transfer</span>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="flex justify-center py-4">
                  <div className="relative w-80 sm:w-[360px] h-52 rounded-3xl bg-slate-950 text-white p-6 shadow-xl border border-slate-800 flex flex-col justify-between overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_40%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.06),transparent_45%)]" />
                    
                    <div className="flex justify-between items-center relative z-10">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Zero Upfront</span>
                        <h4 className="font-extrabold text-sm text-slate-200 tracking-wide">Cash Desk Settlement</h4>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
                        <Money className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="relative z-10 my-3 text-center space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Pay in Person</p>
                      <p className="text-xl font-black text-emerald-400 tracking-tight">
                        {formatCurrency(total)}
                      </p>
                      <p className="text-[9px] text-slate-400 font-light leading-relaxed max-w-[220px] mx-auto pt-1.5">
                        Prepare exact total for rapid desk processing. Keys will be handed over post billing.
                      </p>
                    </div>

                    <div className="flex justify-between items-end relative z-10 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-slate-650 font-bold uppercase tracking-widest">Pickup Office</span>
                        <p className="font-bold text-slate-200 truncate max-w-[180px]">
                          {branches.find(b => b.id === form.pickupLocation)?.name || "Selected Branch"}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">At Handoff</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Input fields card */}
              <Card className="border-gray-100 shadow-sm rounded-3xl bg-white">
                <CardContent className="p-6 sm:p-8 space-y-5">
                  <h2 className="text-xl font-bold text-gray-900 pb-4 border-b border-gray-50 flex items-center gap-2">
                    {paymentMethod === "card" && <CreditCard className="w-5.5 h-5.5 text-orange-500" />}
                    {paymentMethod === "mobile_money" && <Building className="w-5.5 h-5.5 text-orange-500" />}
                    {paymentMethod === "cash" && <Money className="w-5.5 h-5.5 text-orange-500" />}
                    {paymentMethod === "card" && "Secure Card Payment"}
                    {paymentMethod === "mobile_money" && "Mobile Money (MTN / Orange)"}
                    {paymentMethod === "cash" && "Pay Cash at Branch"}
                  </h2>

                  <div className="flex items-center gap-2.5 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-xs text-blue-650 font-medium">
                    <Shield className="w-5 h-5 text-blue-500 shrink-0" />
                    {paymentMethod === "card" && "Your card details are encrypted using secure 256-bit SSL connections"}
                    {paymentMethod === "mobile_money" && "Input your MoMo phone number. Staff will confirm receipt upon vehicle keys collection"}
                    {paymentMethod === "cash" && "Reservation is guaranteed. Settle payment in cash at the rental desk counter"}
                  </div>

                  {/* Dynamic Form Sections */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cardholder Name</label>
                        <Input
                          placeholder="Jean-Paul Mbarga"
                          value={form.cardName}
                          onChange={(e) => setForm({ ...form, cardName: e.target.value })}
                          className="h-11 border-gray-200 placeholder:text-gray-300"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Card Number</label>
                        <Input
                          placeholder="4000 1234 5678 9010"
                          value={form.cardNumber}
                          onChange={(e) => setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })}
                          className="h-11 border-gray-200 placeholder:text-gray-300"
                          maxLength={19}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry Date</label>
                          <Input
                            placeholder="MM / YY"
                            value={form.expiry}
                            onChange={(e) => {
                              let value = e.target.value.replace(/[^0-9]/g, "");
                              if (value.length > 2) {
                                value = value.substring(0, 2) + "/" + value.substring(2, 4);
                              }
                              setForm({ ...form, expiry: value });
                            }}
                            className="h-11 border-gray-200 placeholder:text-gray-300"
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CVV</label>
                          <Input
                            placeholder="•••"
                            type="password"
                            value={form.cvv}
                            onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/[^0-9]/g, "") })}
                            className="h-11 border-gray-200 placeholder:text-gray-300"
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "mobile_money" && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      
                      {/* Provider Select Grid */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mobile Money Provider</label>
                        <div className="grid grid-cols-2 gap-4">
                          
                          {/* MTN */}
                          <button
                            onClick={() => setPaymentProvider("MTN Mobile Money")}
                            className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                              paymentProvider === "MTN Mobile Money"
                                ? "bg-yellow-50 border-yellow-400 text-yellow-950 shadow-sm"
                                : "bg-white border-gray-150 text-gray-650 hover:bg-gray-50"
                            }`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-yellow-400 flex items-center justify-center shrink-0 overflow-hidden">
                              <Image
                                src="/mtn-logo.png"
                                alt="MTN MoMo"
                                width={14}
                                height={28}
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold">MTN MoMo</p>
                              <p className="text-[9px] text-gray-400 font-semibold uppercase">MTN Cameroon</p>
                            </div>
                          </button>

                          {/* Orange */}
                          <button
                            onClick={() => setPaymentProvider("Orange Money")}
                            className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                              paymentProvider === "Orange Money"
                                ? "bg-orange-50 border-orange-400 text-orange-950 shadow-sm"
                                : "bg-white border-gray-150 text-gray-650 hover:bg-gray-50"
                            }`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center shrink-0 overflow-hidden">
                              <Image
                                src="/orange-logo.png"
                                alt="Orange Money"
                                width={14}
                                height={28}
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold">Orange Money</p>
                              <p className="text-[9px] text-gray-400 font-semibold uppercase">Orange CM</p>
                            </div>
                          </button>

                        </div>
                      </div>

                      {/* Phone Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cameroon Phone Number</label>
                        <Input
                          placeholder="677 88 99 00"
                          value={momoPhone}
                          onChange={(e) => setMomoPhone(e.target.value.replace(/[^0-9]/g, ""))}
                          icon={<Phone className="w-4.5 h-4.5 text-gray-400" />}
                          className="h-11 border-gray-200 placeholder:text-gray-300 font-mono tracking-wider"
                          maxLength={9}
                        />
                        <span className="text-[10px] text-gray-400 font-light">Input the 9-digit mobile number linked to your wallet</span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cash" && (
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-150 space-y-4 animate-in fade-in duration-200">
                      <div className="flex gap-3">
                        <WarningCircle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                        <div className="space-y-1 text-xs leading-relaxed text-gray-600 font-light">
                          <h4 className="font-bold text-gray-900 uppercase tracking-wider">Cash Desk Settlement Details</h4>
                          <p>
                            We gladly support in-person cash payments at the desk. You will settle the bill directly with the branch manager prior to keys collection.
                          </p>
                          <p className="pt-2">
                            Please make sure to present a valid driver license, passport/NIC identity document, and preparation of the exact amount of <span className="font-extrabold text-orange-500">{formatCurrency(total)}</span> is highly recommended to speed up verification.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" size="lg" className="flex-1 h-11 border-gray-200 text-gray-700 font-bold uppercase tracking-wider" onClick={handleBack} disabled={submitting}>
                      Back
                    </Button>
                    <Button
                      variant="default"
                      size="lg"
                      className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                      onClick={handleNext}
                      disabled={
                        submitting ||
                        (paymentMethod === "card" && (!form.cardName || !form.cardNumber || !form.expiry || form.cvv.length < 3)) ||
                        (paymentMethod === "mobile_money" && momoPhone.length < 9)
                      }
                    >
                      {submitting ? (
                        <>
                          <CircleNotch className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        paymentMethod === "card" ? `Pay ${formatCurrency(total)}` : "Confirm Reservation"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 3 - Confirmation */}
          {step === 3 && (
            <Card className="border-gray-100 shadow-xl rounded-3xl bg-white overflow-hidden max-w-xl mx-auto">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-10 px-8 text-center space-y-4 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_60%)]" />
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-8 h-8 text-orange-500" weight="bold" />
                </div>
                <div className="space-y-1 relative z-10">
                  <h2 className="text-2xl font-extrabold tracking-tight">Booking Confirmed!</h2>
                  <p className="text-orange-50 leading-relaxed font-light text-sm max-w-xs mx-auto">
                    Your vehicle has been successfully reserved. We sent a receipt to your registered email.
                  </p>
                </div>
              </div>
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="space-y-4 text-sm border-b border-gray-50 pb-5">
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <span>Reference Code</span>
                    {bookingRef && (
                      <span className="font-bold text-gray-900 font-mono text-base uppercase">
                        #{bookingRef.toUpperCase().slice(0, 8)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <span>Car Model</span>
                    <span className="font-bold text-gray-900">{car.make} {car.model}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <span>Total Amount Charged</span>
                    <span className="font-extrabold text-orange-500 text-base">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href="/bookings" className="flex-1">
                    <Button variant="default" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11 rounded-xl">
                      View My Bookings
                    </Button>
                  </Link>
                  <Link href="/cars" className="flex-1">
                    <Button variant="outline" className="w-full border-gray-200 text-gray-700 font-semibold h-11 rounded-xl">
                      Rent Another Car
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Column: Sticky floating summary sidebar */}
        {step < 3 && (
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <Card className="border-gray-100 shadow-sm rounded-3xl bg-white overflow-hidden">
              <div className="bg-gray-900 text-white p-5">
                <h3 className="font-bold text-sm uppercase tracking-wider">Rental Summary</h3>
              </div>
              <CardContent className="p-5 space-y-5">
                
                {/* Visual */}
                <div className="relative h-40 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                  <Image
                    src={car.image_url ?? "/placeholder-car.jpg"}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Meta details */}
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base">{car.make} {car.model}</h4>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">{car.year} · {car.category} · {car.color}</p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm border-t border-gray-50 pt-4">
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <span>Base Rental ({days || 1} day{days > 1 ? "s" : ""})</span>
                    <span className="text-gray-900 font-bold">
                      {days ? formatCurrency(subtotal) : formatCurrency(car.daily_rate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <span>Liability Coverage</span>
                    <span className="text-emerald-600 font-bold uppercase tracking-wider text-[10px]">Included</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <span>Local Service Fee</span>
                    <span className="text-gray-900 font-bold">{formatCurrency(SERVICE_FEE)}</span>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                    <span className="font-bold text-gray-900">Total Price</span>
                    <span className="font-extrabold text-orange-500 text-xl">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support guarantee banner */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-5 flex items-start gap-3">
              <ShieldCheck className="w-5.5 h-5.5 text-orange-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Free Cancellation</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-light">
                  Need to cancel? Modify or cancel your rental up to 24 hours prior to scheduled pickup for a full refund.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-50/50">
        <CircleNotch className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    }>
      <BookPageInner />
    </Suspense>
  );
}
