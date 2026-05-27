"use server";

import { createClient } from "@/lib/supabase/server";
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
}): Promise<{ id: string; error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { id: "", error: "You must be signed in to book a vehicle." };

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
      booking_status: "pending",
      payment_status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("createBooking error:", error.message);
    return { id: "", error: error.message };
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

// ─── Admin: all bookings summary ─────────────────────────────────────────────

export async function getAllBookingsSummary(): Promise<BookingSummary[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("booking_summary")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllBookingsSummary error:", error.message);
    return [];
  }

  return (data ?? []) as BookingSummary[];
}

// ─── Admin: update booking status ────────────────────────────────────────────

export async function updateBookingStatus(
  bookingId: string,
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled",
  cancellationReason?: string
): Promise<boolean> {
  const supabase = await createClient();

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

  return true;
}

// ─── Admin: dashboard stats ───────────────────────────────────────────────────

export async function getDashboardStats() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [vehiclesRes, bookingsRes, revenueRes] = await Promise.all([
    db.from("vehicles").select("id, status").eq("is_active", true),
    db.from("bookings").select("id, booking_status, total_amount, created_at").eq("is_deleted", false),
    db.from("bookings").select("total_amount, created_at").eq("booking_status", "completed").eq("is_deleted", false),
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
