"use client";

import { useState, useEffect } from "react";
import {
  MagnifyingGlass,
  Check,
  X,
  Eye,
  Phone,
  CalendarBlank,
  Car,
  Money,
  CreditCard,
  Building,
  WarningCircle,
  CircleNotch,
  ArrowRight,
  ClipboardText,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getAllBookingsDetails,
  updateBookingStatus,
  updatePaymentStatus,
} from "@/lib/actions/bookings";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_FILTERS = ["All", "pending", "confirmed", "active", "completed", "cancelled"] as const;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  
  // Validation processing states
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getAllBookingsDetails();
      setBookings(data);
      if (data.length > 0) {
        setSelectedBooking(data[0]);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const filtered = bookings.filter((b) => {
    const customerName = b.profiles?.full_name || "";
    const vehicleName = `${b.vehicles?.make} ${b.vehicles?.model}` || "";
    const licensePlate = b.vehicles?.license_plate || "";
    const refCode = b.id.slice(0, 8);

    const matchSearch =
      !search ||
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      vehicleName.toLowerCase().includes(search.toLowerCase()) ||
      licensePlate.toLowerCase().includes(search.toLowerCase()) ||
      refCode.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "All" || b.booking_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSelectBooking = (booking: any) => {
    setSelectedBooking(booking);
  };

  // Status adjustment server action
  const handleStatusChange = async (id: string, newStatus: "confirmed" | "active" | "completed" | "cancelled", reason?: string) => {
    setUpdatingStatus(true);
    const success = await updateBookingStatus(id, newStatus, reason);
    setUpdatingStatus(false);

    if (success) {
      toast.success(`Booking status updated to ${newStatus}`);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, booking_status: newStatus, cancellation_reason: reason ?? null } : b))
      );
      setSelectedBooking((prev: any) =>
        prev && prev.id === id ? { ...prev, booking_status: newStatus, cancellation_reason: reason ?? null } : prev
      );
    } else {
      toast.error("Failed to update booking status");
    }
  };

  // Payment status adjustment server action
  const handlePaymentStatusChange = async (id: string, newPaymentStatus: "pending" | "paid" | "refunded") => {
    setUpdatingPayment(true);
    const success = await updatePaymentStatus(id, newPaymentStatus);
    setUpdatingPayment(false);

    if (success) {
      toast.success(`Payment marked as ${newPaymentStatus}`);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, payment_status: newPaymentStatus } : b))
      );
      setSelectedBooking((prev: any) => {
        if (prev && prev.id === id) {
          const updatedPayments = prev.payments ? [...prev.payments] : [];
          if (updatedPayments.length > 0) {
            updatedPayments[0] = {
              ...updatedPayments[0],
              status: newPaymentStatus === "paid" ? "completed" : newPaymentStatus === "refunded" ? "refunded" : "pending"
            };
          }
          return { ...prev, payment_status: newPaymentStatus, payments: updatedPayments };
        }
        return prev;
      });
    } else {
      toast.error("Failed to update payment status");
    }
  };

  return (
    <div className="space-y-6 relative z-10">
      
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Rental Bookings</h1>
          <p className="text-sm text-gray-500 font-light mt-0.5">
            {loading ? "Loading records..." : `${bookings.length} reservations logged`}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs shrink-0">
            <Input
              placeholder="Search by customer, plate, or ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<MagnifyingGlass className="w-4.5 h-4.5 text-gray-400" />}
              className="h-10 pl-9 border-gray-200"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap items-center w-full md:w-auto justify-start md:justify-end overflow-x-auto pb-1 md:pb-0">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  statusFilter === s
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/10"
                    : "bg-gray-50 border border-gray-100 text-gray-500 hover:border-gray-200 hover:text-gray-800"
                }`}
              >
                {s === "All" ? "All" : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh] bg-white border border-gray-150 rounded-3xl p-10">
          <CircleNotch className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Bookings List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-900 text-white text-[10px] uppercase font-bold tracking-wider border-b border-gray-800">
                      <th className="py-4 px-5">Ref / Client</th>
                      <th className="py-4 px-4">Vehicle</th>
                      <th className="py-4 px-4">Dates</th>
                      <th className="py-4 px-4 text-right">Total</th>
                      <th className="py-4 px-5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b) => {
                      const isSelected = selectedBooking?.id === b.id;
                      const displayStatus = b.booking_status.charAt(0).toUpperCase() + b.booking_status.slice(1);
                      
                      return (
                        <tr
                          key={b.id}
                          onClick={() => handleSelectBooking(b)}
                          className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${
                            isSelected ? "bg-orange-50/40 hover:bg-orange-50/50" : ""
                          }`}
                        >
                          <td className="py-4 px-5">
                            <div className="space-y-1">
                              <span className="font-mono text-xs font-bold text-orange-500 uppercase">
                                #{b.id.slice(0, 8).toUpperCase()}
                              </span>
                              <p className="font-extrabold text-gray-950 truncate max-w-[120px]">{b.profiles?.full_name}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-0.5">
                              <p className="font-bold text-gray-800 text-xs truncate max-w-[150px]">
                                {b.vehicles?.make} {b.vehicles?.model}
                              </p>
                              <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                                {b.vehicles?.license_plate}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs font-medium text-gray-500">
                            <div>{formatDate(b.start_date)}</div>
                            <div className="text-[10px] text-gray-300">to {formatDate(b.end_date)}</div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-black text-gray-900 text-xs">
                              {formatCurrency(b.total_amount)}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex flex-col gap-1 items-center">
                              <StatusBadge status={displayStatus} className="scale-90" />
                              <StatusBadge status={b.payment_status.charAt(0).toUpperCase() + b.payment_status.slice(1)} className="scale-75 opacity-70" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16 px-6">
                  <WarningCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-semibold">No bookings found</p>
                  <p className="text-xs text-gray-400 font-light mt-1">Try resetting the active filters above.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Inspector Panel */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            {selectedBooking ? (
              <Card className="border-gray-100 shadow-md rounded-3xl bg-white overflow-hidden">
                <div className="bg-gray-950 text-white p-5 border-b border-gray-900 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Selected Pass</span>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider font-mono">
                      #{selectedBooking.id.slice(0, 8).toUpperCase()}
                    </h3>
                  </div>
                  <div className="flex gap-1.5 scale-90">
                    <StatusBadge status={selectedBooking.booking_status.charAt(0).toUpperCase() + selectedBooking.booking_status.slice(1)} />
                    <StatusBadge status={selectedBooking.payment_status.charAt(0).toUpperCase() + selectedBooking.payment_status.slice(1)} />
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  
                  {/* Customer Information */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Details</h4>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                      <p className="font-black text-gray-900 text-sm">{selectedBooking.profiles?.full_name}</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 border-t border-gray-100/80 text-xs">
                        {selectedBooking.profiles?.phone && (
                          <a
                            href={`tel:${selectedBooking.profiles.phone}`}
                            className="flex items-center gap-2 text-gray-500 hover:text-orange-500 font-semibold transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span>{selectedBooking.profiles.phone}</span>
                          </a>
                        )}
                        <span className="text-gray-400 hidden sm:inline">·</span>
                        <div className="flex items-center gap-1.5 text-gray-400 font-medium">
                          <CalendarBlank className="w-3.5 h-3.5 shrink-0" />
                          <span>Joined {formatDate(selectedBooking.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle specs & terms */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rental Details</h4>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3.5 text-xs text-gray-600 font-medium">
                      
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Vehicle Model</p>
                          <p className="font-bold text-gray-900 text-sm">
                            {selectedBooking.vehicles?.make} {selectedBooking.vehicles?.model}
                          </p>
                        </div>
                        <span className="bg-white border border-gray-150 px-2.5 py-1 rounded-xl text-[10px] font-bold text-gray-700 tracking-wider font-mono shadow-sm">
                          {selectedBooking.vehicles?.license_plate}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-150/50">
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Start Schedule</p>
                          <p className="font-bold text-gray-800">{formatDate(selectedBooking.start_date)}</p>
                          <p className="text-[10px] text-gray-400 font-light truncate">
                            {selectedBooking.pickup_branch?.name || "Pickup office"}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">End Schedule</p>
                          <p className="font-bold text-gray-800">{formatDate(selectedBooking.end_date)}</p>
                          <p className="text-[10px] text-gray-400 font-light truncate">
                            {selectedBooking.dropoff_branch?.name || "Return office"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-150/50 flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-wider">
                        <span>Rental Term</span>
                        <span className="text-gray-950 font-black">{selectedBooking.number_of_days} Day{selectedBooking.number_of_days > 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details Audit */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Audit Log</h4>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3.5 text-xs">
                      
                      {selectedBooking.payments?.[0] ? (
                        (() => {
                          const payment = selectedBooking.payments[0];
                          const method = payment.payment_method;
                          return (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Payment Method</span>
                                <span className="font-bold text-gray-900 flex items-center gap-1.5 capitalize">
                                  {method === "card" && <CreditCard className="w-4 h-4 text-orange-500" />}
                                  {method === "mobile_money" && <Building className="w-4 h-4 text-orange-500" />}
                                  {method === "cash" && <Money className="w-4 h-4 text-orange-500" />}
                                  {method === "mobile_money" ? payment.payment_provider || "Mobile Money" : method}
                                </span>
                              </div>

                              <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Reference Code</span>
                                <span className="font-mono text-gray-700 font-bold uppercase select-all">
                                  {payment.transaction_reference || "N/A"}
                                </span>
                              </div>

                              {payment.notes && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Sender Details</span>
                                  <span className="font-mono text-gray-800 font-bold select-all">
                                    {payment.notes}
                                  </span>
                                </div>
                              )}

                              <div className="flex justify-between items-center pt-2 border-t border-gray-150/40">
                                <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Txn Ledger Status</span>
                                <span className={`font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${
                                  payment.status === "completed"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : payment.status === "refunded"
                                    ? "bg-slate-100 text-slate-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}>
                                  {payment.status}
                                </span>
                              </div>
                            </>
                          );
                        })()
                      ) : (
                        <div className="flex gap-2">
                          <WarningCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                          <p className="text-gray-400 font-light">
                            No associated transaction ledger record found in the database.
                          </p>
                        </div>
                      )}

                      <div className="pt-2.5 border-t border-gray-150/50 flex justify-between items-baseline">
                        <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Total Due</span>
                        <span className="text-lg font-black text-orange-500">{formatCurrency(selectedBooking.total_amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests log */}
                  {selectedBooking.special_requests && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <ClipboardText className="w-3.5 h-3.5" />
                        Client Requests
                      </h4>
                      <p className="p-3 bg-orange-50/30 border border-orange-100/50 rounded-xl text-xs text-gray-600 font-light leading-relaxed">
                        {selectedBooking.special_requests}
                      </p>
                    </div>
                  )}

                  {/* Cancellation Reason details */}
                  {selectedBooking.booking_status === "cancelled" && selectedBooking.cancellation_reason && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                        <WarningCircle className="w-3.5 h-3.5 text-red-500" />
                        Cancellation Log
                      </h4>
                      <p className="p-3 bg-red-50/50 border border-red-100 rounded-xl text-xs text-red-800 font-light leading-relaxed">
                        <span className="font-semibold">Reason:</span> {selectedBooking.cancellation_reason}
                      </p>
                    </div>
                  )}

                  {/* Actions & validations Section */}
                  <div className="border-t border-gray-100 pt-5 space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dashboard Controls</h4>
                    
                    <div className="space-y-3">
                      {/* Payment validations */}
                      {selectedBooking.payment_status === "pending" && (
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 space-y-2.5">
                          <p className="text-[10px] text-orange-800 font-bold uppercase tracking-wider flex items-center gap-1">
                            <WarningCircle className="w-4 h-4 text-orange-500" />
                            Awaiting Payment Validation
                          </p>
                          <p className="text-[11px] text-orange-600 font-light leading-relaxed">
                            This transaction was initiated via Cash or Mobile Money. Verify the funds arrival manually, then mark paid.
                          </p>
                          <Button
                            onClick={() => handlePaymentStatusChange(selectedBooking.id, "paid")}
                            disabled={updatingPayment}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-9 text-xs uppercase tracking-wider rounded-xl shadow-sm shadow-orange-500/10 flex items-center justify-center gap-1"
                          >
                            {updatingPayment ? (
                              <CircleNotch className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4" weight="bold" />
                                Verify & Mark Paid
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Refund controls */}
                      {selectedBooking.payment_status === "paid" && (
                        <Button
                          variant="outline"
                          onClick={() => handlePaymentStatusChange(selectedBooking.id, "refunded")}
                          disabled={updatingPayment}
                          className="w-full border-red-200 text-red-650 hover:bg-red-50 hover:text-red-700 h-9 text-xs font-bold uppercase tracking-wider rounded-xl"
                        >
                          {updatingPayment ? <CircleNotch className="w-4 h-4 animate-spin" /> : "Refund Payment"}
                        </Button>
                      )}

                      {/* Booking status controls (Pending -> Confirmed) */}
                      {selectedBooking.booking_status === "pending" && (
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleStatusChange(selectedBooking.id, "confirmed")}
                            disabled={updatingStatus}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold h-9 text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1"
                          >
                            {updatingStatus ? <CircleNotch className="w-4 h-4 animate-spin" /> : "Approve Pass"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const reason = prompt("Enter rejection/cancellation reason:") || "Rejected by staff";
                              handleStatusChange(selectedBooking.id, "cancelled", reason);
                            }}
                            disabled={updatingStatus}
                            className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 h-9 text-xs font-bold uppercase tracking-wider rounded-xl"
                          >
                            {updatingStatus ? <CircleNotch className="w-4 h-4 animate-spin" /> : "Reject Booking"}
                          </Button>
                        </div>
                      )}

                      {/* Booking status controls (Confirmed -> Active) */}
                      {selectedBooking.booking_status === "confirmed" && (
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleStatusChange(selectedBooking.id, "active")}
                            disabled={updatingStatus}
                            className="flex-1 bg-slate-900 hover:bg-slate-850 text-white font-bold h-9 text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5"
                          >
                            {updatingStatus ? <CircleNotch className="w-4 h-4 animate-spin" /> : (
                              <>
                                <Car className="w-4 h-4" />
                                Dispatch Key (Active)
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const reason = prompt("Enter cancellation reason:") || "Cancelled by client request";
                              handleStatusChange(selectedBooking.id, "cancelled", reason);
                            }}
                            disabled={updatingStatus}
                            className="border-rose-200 text-rose-600 hover:bg-rose-50 px-4 h-9 text-xs font-bold uppercase tracking-wider rounded-xl"
                          >
                            {updatingStatus ? <CircleNotch className="w-4 h-4 animate-spin" /> : "Cancel"}
                          </Button>
                        </div>
                      )}

                      {/* Booking status controls (Active -> Completed) */}
                      {selectedBooking.booking_status === "active" && (
                        <Button
                          onClick={() => handleStatusChange(selectedBooking.id, "completed")}
                          disabled={updatingStatus}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/10"
                        >
                          {updatingStatus ? <CircleNotch className="w-4 h-4 animate-spin" /> : (
                            <>
                              <Check className="w-4.5 h-4.5" weight="bold" />
                              Inspect & Close Rental (Completed)
                            </>
                          )}
                        </Button>
                      )}

                      {/* Completed / Cancelled notification */}
                      {["completed", "cancelled"].includes(selectedBooking.booking_status) && (
                        <div className="flex gap-2.5 p-3.5 bg-gray-50 border border-gray-150 rounded-2xl text-[11px] text-gray-500 font-medium">
                          <WarningCircle className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                          This reservation is closed. Booking status changes are locked. Settle any refund actions separately.
                        </div>
                      )}
                    </div>

                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-20 bg-white border border-gray-150 rounded-3xl p-6">
                <WarningCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-semibold">No booking selected</p>
                <p className="text-xs text-gray-400 font-light mt-1">Select a booking row to inspect and edit.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
