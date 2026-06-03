"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { BookingSummary } from "@/lib/supabase/types";

// ─── Create a booking ────────────────────────────────────────────────────────

export async function createBooking(data: {
  vehicleId: string;
  startDate: string;
  endDate: string;
  pickupBranchId?: string;
  dropoffBranchId?: string;
  dailyRate: number;
  subtotal: number;
  totalAmount: number;
  specialRequests?: string;
  paymentMethod?: "card" | "mobile_money" | "cash" | "bank_transfer";
  paymentProvider?: string;
  phoneNumber?: string;
}): Promise<{ id: string; error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { id: "", error: "You must be signed in to book a vehicle." };

  // Determine initial payment status based on method
  // Cards are marked as "paid" instantly as mock checkout.
  // Cash/MoMo are marked "pending" until staff verifies them.
  const initialPaymentStatus = data.paymentMethod === "card" ? "paid" : "pending";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: booking, error } = await (supabase as any)
    .from("bookings")
    .insert({
      user_id: user.id,
      vehicle_id: data.vehicleId,
      start_date: data.startDate,
      end_date: data.endDate,
      pickup_branch_id: data.pickupBranchId ?? null,
      dropoff_branch_id: data.dropoffBranchId ?? null,
      daily_rate: data.dailyRate,
      subtotal: data.subtotal,
      total_amount: data.totalAmount,
      special_requests: data.specialRequests ?? null,
      booking_status: "confirmed",
      payment_status: initialPaymentStatus,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createBooking error:", error.message);
    return { id: "", error: error.message };
  }

  // Create payment record bypassing RLS using admin client
  const adminDb = await createAdminClient();
  const paymentMethod = data.paymentMethod ?? "card";
  const paymentProvider = data.paymentProvider ?? null;
  const transactionRef = `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: paymentError } = await (adminDb as any)
    .from("payments")
    .insert({
      booking_id: (booking as { id: string }).id,
      amount: data.totalAmount,
      payment_method: paymentMethod,
      payment_provider: paymentProvider,
      transaction_reference: transactionRef,
      status: paymentMethod === "card" ? "completed" : "pending",
      notes: data.phoneNumber ? `Phone: ${data.phoneNumber}` : null,
    });

  if (paymentError) {
    console.error("createBooking: failed to record payment:", paymentError.message);
  }

  // Update vehicle status (Reserved if paid immediately, otherwise keep Available)
  const initialVehicleStatus = initialPaymentStatus === "paid" ? "Reserved" : "Available";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: vehicleError } = await (supabase as any)
    .from("vehicles")
    .update({ status: initialVehicleStatus })
    .eq("id", data.vehicleId);

  if (vehicleError) {
    console.error("Error updating vehicle status:", vehicleError.message);
    // Don't fail the booking if vehicle status update fails
  }

  return { id: (booking as { id: string }).id, error: null };
}

// ─── Get current user's bookings ─────────────────────────────────────────────

export async function getMyBookings() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("bookings")
    .select(`
      *,
      vehicles (
        id, make, model, year, category, image_url, license_plate
      ),
      pickup_branch:branches!bookings_pickup_branch_id_fkey (name),
      dropoff_branch:branches!bookings_dropoff_branch_id_fkey (name)
    `)
    .eq("user_id", user.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyBookings error:", error.message);
    return [];
  }

  return data ?? [];
}

// ─── Get booking details ─────────────────────────────────────────────────────

export async function getBookingDetails(bookingId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("bookings")
    .select(`
      *,
      vehicles (
        id, make, model, year, category, image_url, license_plate, color, seats, transmission, fuel_type
      ),
      pickup_branch:branches!bookings_pickup_branch_id_fkey (name, city, address, phone, email, opening_hours),
      dropoff_branch:branches!bookings_dropoff_branch_id_fkey (name, city, address, phone, email, opening_hours)
    `)
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .eq("is_deleted", false)
    .single();

  if (error) {
    console.error("getBookingDetails error:", error.message);
    return null;
  }

  return data;
}

// ─── Admin: all bookings summary ─────────────────────────────────────────────

export async function getAllBookingsSummary(): Promise<BookingSummary[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: currentProfile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || (currentProfile.role !== "admin" && currentProfile.role !== "staff")) {
    return [];
  }

  const adminDb = await createAdminClient();
  const { data, error } = await adminDb
    .from("booking_summary")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllBookingsSummary error:", error.message);
    return [];
  }

  return (data ?? []) as BookingSummary[];
}

// ─── Admin: all bookings details (with joins) ─────────────────────────────────

export async function getAllBookingsDetails() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: currentProfile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || (currentProfile.role !== "admin" && currentProfile.role !== "staff")) {
    return [];
  }

  const adminDb = await createAdminClient();
  const { data, error } = await adminDb
    .from("bookings")
    .select(`
      *,
      profiles (
        full_name, phone
      ),
      vehicles (
        make, model, license_plate
      ),
      pickup_branch:branches!bookings_pickup_branch_id_fkey (name),
      dropoff_branch:branches!bookings_dropoff_branch_id_fkey (name),
      payments (
        payment_method, payment_provider, status, transaction_reference, notes
      )
    `)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllBookingsDetails error:", error.message);
    return [];
  }

  return data ?? [];
}

// ─── Admin: update booking status ────────────────────────────────────────────

export async function updateBookingStatus(
  bookingId: string,
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled",
  cancellationReason?: string
): Promise<boolean> {
  const supabase = await createClient();

  // Get booking details first to update vehicle status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: booking, error: fetchError } = await (supabase as any)
    .from("bookings")
    .select("vehicle_id, booking_status")
    .eq("id", bookingId)
    .single();

  if (fetchError) {
    console.error("Error fetching booking:", fetchError.message);
    return false;
  }

  const updates: Record<string, unknown> = { booking_status: status };
  if (status === "cancelled") {
    updates.cancellation_reason = cancellationReason ?? null;
    updates.cancelled_at = new Date().toISOString();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("bookings")
    .update(updates)
    .eq("id", bookingId);

  if (error) {
    console.error("updateBookingStatus error:", error.message);
    return false;
  }

  // Update vehicle status based on booking status
  if (status === "cancelled" || status === "completed") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: vehicleError } = await (supabase as any)
      .from("vehicles")
      .update({ status: "Available" })
      .eq("id", booking.vehicle_id);

    if (vehicleError) {
      console.error("Error updating vehicle status:", vehicleError.message);
    }
  } else if (status === "active" && booking.booking_status !== "active") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: vehicleError } = await (supabase as any)
      .from("vehicles")
      .update({ status: "Rented" })
      .eq("id", booking.vehicle_id);

    if (vehicleError) {
      console.error("Error updating vehicle status:", vehicleError.message);
    }
  }

  return true;
}

// ─── Admin: update payment status ────────────────────────────────────────────

export async function updatePaymentStatus(
  bookingId: string,
  status: "pending" | "partial" | "paid" | "refunded"
): Promise<boolean> {
  const supabase = await createClient();

  // Fetch the booking vehicle ID to update the vehicle status if payment is completed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: booking, error: fetchError } = await (supabase as any)
    .from("bookings")
    .select("vehicle_id")
    .eq("id", bookingId)
    .single();

  if (fetchError) {
    console.error("updatePaymentStatus fetch error:", fetchError.message);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("bookings")
    .update({ payment_status: status })
    .eq("id", bookingId);

  if (error) {
    console.error("updatePaymentStatus error:", error.message);
    return false;
  }

  // Update corresponding transaction in payments table
  const adminDb = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: paymentError } = await (adminDb as any)
    .from("payments")
    .update({ status: status === "paid" ? "completed" : status === "refunded" ? "refunded" : "pending" })
    .eq("booking_id", bookingId);

  if (paymentError) {
    console.error("updatePaymentStatus payment record error:", paymentError.message);
  }

  // Update vehicle status if payment becomes paid
  if (status === "paid" && booking) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: vehicleError } = await (supabase as any)
      .from("vehicles")
      .update({ status: "Reserved" })
      .eq("id", booking.vehicle_id);

    if (vehicleError) {
      console.error("Error updating vehicle status to Reserved:", vehicleError.message);
    }
  }

  return true;
}

// ─── Get active branches ─────────────────────────────────────────────────────

export async function getActiveBranches(): Promise<Array<{ id: string; name: string; city: string }>> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("branches")
    .select("id, name, city")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("getActiveBranches error:", error.message);
    return [];
  }

  return data ?? [];
}

// ─── Admin: dashboard stats ───────────────────────────────────────────────────

export async function getDashboardStats() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      totalRevenue: 0,
      totalBookings: 0,
      activeRentals: 0,
      fleetUtilization: 0,
      totalVehicles: 0,
      availableVehicles: 0,
      rentedVehicles: 0,
      maintenanceVehicles: 0,
      revenueByMonth: [],
      bookingStatusCounts: { pending: 0, confirmed: 0, active: 0, completed: 0, cancelled: 0 },
    };
  }

  const { data: currentProfile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || (currentProfile.role !== "admin" && currentProfile.role !== "staff")) {
    return {
      totalRevenue: 0,
      totalBookings: 0,
      activeRentals: 0,
      fleetUtilization: 0,
      totalVehicles: 0,
      availableVehicles: 0,
      rentedVehicles: 0,
      maintenanceVehicles: 0,
      revenueByMonth: [],
      bookingStatusCounts: { pending: 0, confirmed: 0, active: 0, completed: 0, cancelled: 0 },
    };
  }

  const adminDb = await createAdminClient();

  const [vehiclesRes, bookingsRes, revenueRes] = await Promise.all([
    adminDb.from("vehicles").select("id, status").eq("is_active", true),
    adminDb.from("bookings").select("id, booking_status, total_amount, created_at").eq("is_deleted", false),
    adminDb.from("bookings").select("total_amount, created_at").eq("booking_status", "completed").eq("is_deleted", false),
  ]);

  const vehicles: Array<{ status: string }> = vehiclesRes.data ?? [];
  const bookings: Array<{ id: string; booking_status: string }> = bookingsRes.data ?? [];
  const completedBookings: Array<{ total_amount: number; created_at: string }> = revenueRes.data ?? [];

  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.total_amount, 0);
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.status === "Available").length;
  const rentedVehicles = vehicles.filter((v) => v.status === "Rented").length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === "Maintenance").length;
  const fleetUtilization =
    totalVehicles > 0 ? Math.round((rentedVehicles / totalVehicles) * 100) : 0;

  // Revenue by month (last 6 months)
  const now = new Date();
  const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const month = d.toLocaleString("en", { month: "short" });
    const revenue = completedBookings
      .filter((b) => {
        const bd = new Date(b.created_at);
        return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
      })
      .reduce((sum, b) => sum + b.total_amount, 0);
    return { month, revenue };
  });

  const allBookings: Array<{ booking_status: string }> = bookingsRes.data ?? [];
  const bookingStatusCounts = {
    pending: allBookings.filter((b) => b.booking_status === "pending").length,
    confirmed: allBookings.filter((b) => b.booking_status === "confirmed").length,
    active: allBookings.filter((b) => b.booking_status === "active").length,
    completed: allBookings.filter((b) => b.booking_status === "completed").length,
    cancelled: allBookings.filter((b) => b.booking_status === "cancelled").length,
  };

  return {
    totalRevenue,
    totalBookings: bookings.length,
    activeRentals: rentedVehicles,
    fleetUtilization,
    totalVehicles,
    availableVehicles,
    rentedVehicles,
    maintenanceVehicles,
    revenueByMonth,
    bookingStatusCounts,
  };
}
