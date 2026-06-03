"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CaretLeft,
  Car,
  MapPin,
  Calendar,
  Money,
  User,
  Phone,
  CircleNotch,
  CheckCircle,
  XCircle,
  Clock,
  Envelope,
  WarningCircle,
  ShieldCheck,
  ClipboardText,
  CalendarBlank,
  CreditCard,
  Building,
} from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getBookingDetails, updateBookingStatus } from "@/lib/actions/bookings";
import { toast } from "sonner";

const CANCEL_REASONS = [
  "Change of travel plans",
  "Found a better price elsewhere",
  "Vehicle specs no longer match my needs",
  "Booking dates or location error",
  "Medical or personal emergency",
  "Other / rather not say",
];

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Cancellation states
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [submittingCancellation, setSubmittingCancellation] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      setLoading(true);
      const data = await getBookingDetails(id);
      setBooking(data);
      setLoading(false);
    }
    loadBooking();
  }, [id]);

  const handleCancelBooking = async () => {
    if (!selectedReason) {
      toast.error("Please select a cancellation reason");
      return;
    }

    const finalReason = selectedReason === "Other / rather not say" && customReason.trim()
      ? `Other: ${customReason.trim()}`
      : selectedReason;

    setSubmittingCancellation(true);
    const success = await updateBookingStatus(booking.id, "cancelled", finalReason);
    setSubmittingCancellation(false);

    if (success) {
      toast.success("Booking cancelled successfully", {
        description: "Your reservation has been cancelled. Any pending charges have been voided."
      });
      // Update local state instantly
      setBooking((prev: any) => ({
        ...prev,
        booking_status: "cancelled",
        cancellation_reason: finalReason,
        cancelled_at: new Date().toISOString(),
      }));
      setIsCancelling(false);
    } else {
      toast.error("Failed to cancel booking", {
        description: "An error occurred while updating your reservation. Please try again."
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <CircleNotch className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-10">
        <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Booking not found</h2>
        <p className="text-gray-500 mb-6 font-light max-w-sm mx-auto">
          This booking doesn't exist or you do not have permission to view it.
        </p>
        <Link href="/bookings">
          <Button variant="default" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
            Back to My Bookings
          </Button>
        </Link>
      </div>
    );
  }

  const vehicle = booking.vehicles;
  const pickupBranch = booking.pickup_branch;
  const dropoffBranch = booking.dropoff_branch;
  const status = booking.booking_status;

  // Capitalize statuses for Badge display mapping
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
  const displayPaymentStatus = booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1);

  // Render format helper for branch opening hours
  const renderOpeningHours = (hours: any) => {
    if (!hours) return "Mon - Sun: 8:00 AM - 8:00 PM";
    if (typeof hours === "string") return hours;
    if (typeof hours === "object") {
      return hours.weekday || hours.hours || "Mon - Sun: 8:00 AM - 8:00 PM";
    }
    return "Mon - Sun: 8:00 AM - 8:00 PM";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
      
      {/* Back Button */}
      <Link
        href="/bookings"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors"
      >
        <CaretLeft className="w-4 h-4" />
        Back to My Bookings
      </Link>

      {/* Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Digital Voucher / Ticket */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            
            {/* Ticket Header (Premium Theme) */}
            <div className="bg-slate-950 text-white p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_50%)]" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-500/20">
                      DG
                    </div>
                    <span className="font-extrabold tracking-wider text-xs uppercase text-slate-300">DriveGo Rental Pass</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white pt-1">
                    Rental Voucher
                  </h1>
                  <p className="text-slate-400 text-xs font-mono font-bold tracking-wider">
                    REF: <span className="text-orange-400 uppercase">#{booking.id.slice(0, 8).toUpperCase()}</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center gap-4 justify-between sm:justify-start">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Rental Status</p>
                      <StatusBadge status={displayStatus} className="mt-1" />
                    </div>
                    <div className="w-px h-8 bg-slate-800 hidden sm:block" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Payment</p>
                      <StatusBadge status={displayPaymentStatus} className="mt-1" />
                    </div>
                  </div>

                  {/* Micro header barcode */}
                  <div className="hidden sm:flex flex-col items-center p-2.5 bg-white rounded-xl space-y-1 shadow-inner select-none shrink-0">
                    <div className="flex items-center gap-0.5 h-7">
                      {[1, 2, 1, 3, 1, 2, 4, 1, 3, 1, 2, 1, 3, 2, 1].map((width, idx) => (
                        <div key={idx} className="bg-slate-950 h-full" style={{ width: `${width}px` }} />
                      ))}
                    </div>
                    <span className="font-mono text-[7px] font-bold tracking-wider text-slate-400">DG-{booking.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Cutout Border #1 */}
            <div className="relative mx-[-24px] sm:mx-[-32px] my-1">
              <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-50 border-r border-gray-100 rounded-full z-10 shadow-inner" />
              <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-50 border-l border-gray-100 rounded-full z-10 shadow-inner" />
              <div className="border-t-2 border-dashed border-gray-100 w-full" />
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Section 1: Vehicle Details & Barcode Desk Ticket */}
              <div className="grid md:grid-cols-12 gap-6 items-center">
                
                {/* Vehicle Graphics & Specs */}
                <div className="md:col-span-8 flex flex-col sm:flex-row gap-6 items-start">
                  
                  {/* Photo */}
                  <div className="relative w-full sm:w-48 h-36 rounded-2xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50 shadow-sm">
                    <Image
                      src={vehicle?.image_url || "/placeholder-car.jpg"}
                      alt={`${vehicle?.make} ${vehicle?.model}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Specs grid */}
                  <div className="space-y-3 flex-1">
                    <div>
                      <h2 className="text-xl font-black text-gray-900 leading-tight">
                        {vehicle?.make} {vehicle?.model}
                      </h2>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
                        {vehicle?.year} · {vehicle?.category} · {vehicle?.color}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-2">
                      <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <Car className="w-4 h-4 text-orange-500 shrink-0" />
                        <span className="truncate">{vehicle?.license_plate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <Money className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>{formatCurrency(booking.daily_rate)}/day</span>
                      </div>
                      {vehicle?.seats && (
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                          <User className="w-4 h-4 text-orange-500 shrink-0" />
                          <span>{vehicle.seats} Seats</span>
                        </div>
                      )}
                      {vehicle?.transmission && (
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                          <Building className="w-4 h-4 text-orange-500 shrink-0" />
                          <span>{vehicle.transmission}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vertical Separator */}
                <div className="hidden md:block w-px h-28 bg-gray-100 mx-2" />

                {/* Desk QR / Barcode Scan */}
                <div className="md:col-span-3 flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center space-y-3">
                  <div className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-[1px] h-12 select-none">
                      {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 1, 3, 2, 1].map((width, idx) => (
                        <div key={idx} className="bg-gray-800 h-full" style={{ width: `${width}px` }} />
                      ))}
                    </div>
                    <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                      DG-{booking.id.slice(0, 6).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium max-w-[120px] leading-relaxed">
                    Show barcode at desk for rapid keys pickup
                  </p>
                </div>
              </div>

              {/* Ticket Cutout Border #2 */}
              <div className="relative mx-[-24px] sm:mx-[-32px] my-1">
                <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-50 border-r border-gray-100 rounded-full z-10 shadow-inner" />
                <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-50 border-l border-gray-100 rounded-full z-10 shadow-inner" />
                <div className="border-t-2 border-dashed border-gray-100 w-full" />
              </div>

              {/* Section 2: Branch Details & Schedules */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Rental Branch Details
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Pickup Card */}
                  <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-emerald-100/50">
                        <CheckCircle className="w-5 h-5" weight="fill" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Pick-up Branch</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Start of rental</p>
                      </div>
                    </div>

                    <div className="space-y-3.5 text-xs pt-1">
                      <div className="flex items-start gap-3">
                        <CalendarBlank className="w-4.5 h-4.5 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date & Time</p>
                          <p className="font-semibold text-gray-800 mt-0.5">
                            {new Date(booking.start_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {pickupBranch && (
                        <>
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4.5 h-4.5 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Location</p>
                              <p className="font-semibold text-gray-850 mt-0.5">{pickupBranch.name}</p>
                              <p className="text-gray-500 font-light mt-0.5">{pickupBranch.address}, {pickupBranch.city}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100/60">
                            {pickupBranch.phone && (
                              <a
                                href={`tel:${pickupBranch.phone}`}
                                className="flex items-center gap-2 text-gray-500 hover:text-orange-500 font-medium transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{pickupBranch.phone}</span>
                              </a>
                            )}
                            <div className="flex items-center gap-2 text-gray-400 font-medium">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{renderOpeningHours(pickupBranch.opening_hours)}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Return Card */}
                  <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-orange-100/50">
                        <XCircle className="w-5 h-5" weight="fill" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Drop-off Branch</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">End of rental</p>
                      </div>
                    </div>

                    <div className="space-y-3.5 text-xs pt-1">
                      <div className="flex items-start gap-3">
                        <CalendarBlank className="w-4.5 h-4.5 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date & Time</p>
                          <p className="font-semibold text-gray-800 mt-0.5">
                            {new Date(booking.end_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {dropoffBranch && (
                        <>
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4.5 h-4.5 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Location</p>
                              <p className="font-semibold text-gray-850 mt-0.5">{dropoffBranch.name}</p>
                              <p className="text-gray-500 font-light mt-0.5">{dropoffBranch.address}, {dropoffBranch.city}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100/60">
                            {dropoffBranch.phone && (
                              <a
                                href={`tel:${dropoffBranch.phone}`}
                                className="flex items-center gap-2 text-gray-500 hover:text-orange-500 font-medium transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{dropoffBranch.phone}</span>
                              </a>
                            )}
                            <div className="flex items-center gap-2 text-gray-400 font-medium">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{renderOpeningHours(dropoffBranch.opening_hours)}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Ticket Cutout Border #3 */}
              <div className="relative mx-[-24px] sm:mx-[-32px] my-1">
                <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-50 border-r border-gray-100 rounded-full z-10 shadow-inner" />
                <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-50 border-l border-gray-100 rounded-full z-10 shadow-inner" />
                <div className="border-t-2 border-dashed border-gray-100 w-full" />
              </div>

              {/* Section 3: Financial Summary */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Payment Details
                </h3>

                <div className="space-y-4">
                  
                  <div className="space-y-2 text-sm text-gray-600 font-medium">
                    <div className="flex justify-between items-center">
                      <span>Daily Rate Basis</span>
                      <span className="text-gray-900 font-semibold">{formatCurrency(booking.daily_rate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Rental Duration</span>
                      <span className="text-gray-900 font-semibold">
                        {booking.number_of_days} Day{booking.number_of_days > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Subtotal</span>
                      <span className="text-gray-900 font-semibold">{formatCurrency(booking.subtotal)}</span>
                    </div>

                    {booking.tax_amount > 0 && (
                      <div className="flex justify-between items-center text-gray-500">
                        <span>Taxes & Duties</span>
                        <span className="text-gray-900 font-semibold">{formatCurrency(booking.tax_amount)}</span>
                      </div>
                    )}

                    {booking.discount_amount > 0 && (
                      <div className="flex justify-between items-center text-emerald-600">
                        <span>Promo Discount</span>
                        <span>-{formatCurrency(booking.discount_amount)}</span>
                      </div>
                    )}
                  </div>

                  {/* Grand total highlight */}
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md shadow-orange-500/10">
                    <div>
                      <p className="text-[10px] text-orange-100 font-bold uppercase tracking-wider">Total Amount Paid</p>
                      <h3 className="text-2xl font-black tracking-tight mt-0.5">{formatCurrency(booking.total_amount)}</h3>
                    </div>
                    <div className="flex items-center gap-2.5 bg-white/10 rounded-xl px-4 py-2 text-xs font-semibold backdrop-blur-sm self-stretch sm:self-auto justify-center">
                      <CreditCard className="w-4 h-4 text-orange-200" />
                      <span>DriveGo Secure Card Billing</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Special Requests Section */}
              {booking.special_requests && (
                <>
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                      <ClipboardText className="w-4.5 h-4.5 text-gray-400" />
                      Special Request Notes
                    </h3>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs text-gray-600 leading-relaxed font-light">
                      {booking.special_requests}
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>

        {/* Right Column: Sidebar (Timeline & Cancellation Panel) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Booking Timeline Tracker */}
          <Card className="border-gray-100 shadow-sm rounded-3xl bg-white">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3 flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-orange-500" />
                Booking Timeline
              </h3>

              {status === "cancelled" ? (
                /* Timeline if Cancelled */
                <div className="relative pl-6 space-y-6 mt-6 border-l-2 border-red-100">
                  {/* Step 1: Created */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Booking Placed</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(booking.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Step 2: Cancelled */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                      <XCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider">Booking Cancelled</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {booking.cancelled_at ? new Date(booking.cancelled_at).toLocaleString() : "Processed"}
                      </p>
                      {booking.cancellation_reason && (
                        <p className="mt-2 text-xs text-red-700 bg-red-50/50 border border-red-100 rounded-lg p-2 font-light leading-relaxed">
                          <span className="font-semibold">Reason:</span> {booking.cancellation_reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard Booking Lifecycle Timeline */
                <div className="relative pl-6 space-y-6 mt-6 border-l-2 border-gray-100">
                  
                  {/* Step 1: Placed */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Reservation Created</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(booking.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Confirmed */}
                  <div className="relative">
                    <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                      ["confirmed", "active", "completed"].includes(status)
                        ? "bg-emerald-500"
                        : "bg-orange-500 animate-pulse"
                    }`}>
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${
                        ["confirmed", "active", "completed"].includes(status) ? "text-gray-900" : "text-orange-500"
                      }`}>
                        Staff Verification
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {["confirmed", "active", "completed"].includes(status)
                          ? "Approved & scheduled for pickup"
                          : "Awaiting final fleet verification"}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Active */}
                  <div className="relative">
                    <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                      ["active", "completed"].includes(status)
                        ? "bg-emerald-500"
                        : status === "confirmed"
                        ? "bg-orange-500"
                        : "bg-gray-200"
                    }`}>
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${
                        status === "active" ? "text-orange-500" : ["active", "completed"].includes(status) ? "text-gray-950" : "text-gray-400"
                      }`}>
                        Out on Rental
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {status === "active"
                          ? "Vehicle is out with client"
                          : status === "completed"
                          ? "Rental completed successfully"
                          : "Scheduled for pick-up"}
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Completed */}
                  <div className="relative">
                    <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                      status === "completed" ? "bg-emerald-500" : "bg-gray-200"
                    }`}>
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${
                        status === "completed" ? "text-gray-900" : "text-gray-400"
                      }`}>
                        Closed / Returned
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {status === "completed"
                          ? "Returned, inspected, and closed"
                          : "Return scheduled at location"}
                      </p>
                    </div>
                  </div>

                </div>
              )}
            </CardContent>
          </Card>

          {/* Cancellation Control Panel */}
          {["confirmed", "pending"].includes(status) && (
            <Card className="border-red-100 bg-rose-50/50 shadow-sm rounded-3xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                
                {!isCancelling ? (
                  /* Option to trigger cancellation */
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <WarningCircle className="w-5.5 h-5.5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Free Cancellation Info</h4>
                        <p className="text-xs text-gray-500 leading-relaxed font-light">
                          Need to adjust travel dates or cancel completely? Cancellation is free and immediate.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 bg-white rounded-2xl h-10 text-xs font-bold uppercase tracking-wider transition-colors"
                      onClick={() => setIsCancelling(true)}
                    >
                      Cancel Reservation
                    </Button>
                  </div>
                ) : (
                  /* Interactive Reason Form */
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Cancel Reservation</h4>
                      <p className="text-xs text-gray-450 leading-relaxed font-light">
                        Please share your feedback with us to complete the cancellation.
                      </p>
                    </div>

                    {/* Quick Reasons Selection */}
                    <div className="space-y-2 pt-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reason for cancelling</label>
                      <div className="grid gap-1.5">
                        {CANCEL_REASONS.map((reason) => (
                          <button
                            key={reason}
                            onClick={() => {
                              setSelectedReason(reason);
                              if (reason !== "Other / rather not say") setCustomReason("");
                            }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                              selectedReason === reason
                                ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                : "bg-white border-gray-150 text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Detail Textarea */}
                    {selectedReason === "Other / rather not say" && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Provide Details</label>
                        <textarea
                          placeholder="Please provide details about the cancellation..."
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-700 min-h-[80px]"
                        />
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="ghost"
                        className="flex-1 text-gray-500 hover:bg-gray-100 rounded-2xl h-10 text-xs font-bold uppercase tracking-wider"
                        onClick={() => {
                          setIsCancelling(false);
                          setSelectedReason("");
                          setCustomReason("");
                        }}
                        disabled={submittingCancellation}
                      >
                        Keep Pass
                      </Button>
                      <Button
                        variant="default"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl h-10 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                        onClick={handleCancelBooking}
                        disabled={submittingCancellation || !selectedReason || (selectedReason === "Other / rather not say" && !customReason.trim())}
                      >
                        {submittingCancellation ? (
                          <>
                            <CircleNotch className="w-4 h-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          "Confirm Cancel"
                        )}
                      </Button>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          )}

          {/* If completed */}
          {status === "completed" && (
            <Card className="border-emerald-100 bg-emerald-50/30 rounded-3xl overflow-hidden shadow-sm">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-6 h-6" weight="bold" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Rental Completed!</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-light">
                    We hope you had a fantastic experience with your rental. Tell others how it went!
                  </p>
                </div>
                <Link href={`/cars/${vehicle.id}`} className="block pt-1">
                  <Button variant="default" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-10 text-xs font-bold uppercase tracking-wider">
                    Rate Vehicle
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

        </div>

      </div>

    </div>
  );
}
