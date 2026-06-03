"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export type Customer = {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  license_number: string | null;
  license_expiry_date: string | null;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerWithStats = Customer & {
  total_bookings: number;
  active_bookings: number;
  total_spent: number;
};

// ─── Get all customers ───────────────────────────────────────────────────────

export async function getAllCustomers(): Promise<CustomerWithStats[]> {
  const supabase = await createClient();

  // First check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log("No user found");
    return [];
  }

  // Get current user's profile to check role
  const { data: currentProfile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || (currentProfile.role !== "admin" && currentProfile.role !== "staff")) {
    console.log("User is not admin/staff:", currentProfile?.role);
    return [];
  }

  // Use admin client to query all customers and bypass RLS
  const adminDb = await createAdminClient();
  const { data: profiles, error } = await adminDb
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllCustomers error:", error.message, error);
    return [];
  }

  console.log("Found profiles:", profiles?.length || 0);

  if (!profiles || profiles.length === 0) return [];

  // Get booking stats for each customer
  const customerIds = profiles.map((p: Customer) => p.id);

  const { data: bookings, error: bookingsError } = await adminDb
    .from("bookings")
    .select("user_id, booking_status, total_amount")
    .in("user_id", customerIds)
    .eq("is_deleted", false);

  if (bookingsError) {
    console.error("Get bookings error:", bookingsError.message);
  }

  console.log("Found bookings:", bookings?.length || 0);

  // Calculate stats for each customer
  const customersWithStats: CustomerWithStats[] = profiles.map((profile: Customer) => {
    const customerBookings = bookings?.filter((b: { user_id: string }) => b.user_id === profile.id) || [];
    const activeBookings = customerBookings.filter(
      (b: { booking_status: string }) => b.booking_status === "confirmed" || b.booking_status === "active"
    );
    const completedBookings = customerBookings.filter(
      (b: { booking_status: string }) => b.booking_status === "completed"
    );
    const totalSpent = completedBookings.reduce((sum: number, b: { total_amount: number }) => sum + b.total_amount, 0);

    return {
      ...profile,
      total_bookings: customerBookings.length,
      active_bookings: activeBookings.length,
      total_spent: totalSpent,
    };
  });

  return customersWithStats;
}

// ─── Get customer details ────────────────────────────────────────────────────

export async function getCustomerDetails(customerId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: currentProfile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || (currentProfile.role !== "admin" && currentProfile.role !== "staff")) {
    console.log("User is not admin/staff:", currentProfile?.role);
    return null;
  }

  // Use adminDb to bypass RLS
  const adminDb = await createAdminClient();
  const { data: profile, error: profileError } = await adminDb
    .from("profiles")
    .select("*")
    .eq("id", customerId)
    .single();

  if (profileError) {
    console.error("getCustomerDetails error:", profileError.message);
    return null;
  }

  // Get customer bookings
  const { data: bookings, error: bookingsError } = await adminDb
    .from("bookings")
    .select(`
      *,
      vehicles (
        make,
        model,
        year,
        image_url
      ),
      pickup_branch:branches!bookings_pickup_branch_id_fkey (name, city),
      dropoff_branch:branches!bookings_dropoff_branch_id_fkey (name, city)
    `)
    .eq("user_id", customerId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (bookingsError) {
    console.error("Get customer bookings error:", bookingsError.message);
  }

  return {
    profile,
    bookings: bookings || [],
  };
}

// ─── Get all staff members ───────────────────────────────────────────────────

export async function getAllStaffMembers(): Promise<Customer[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log("No user found");
    return [];
  }

  const { data: currentProfile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || (currentProfile.role !== "admin" && currentProfile.role !== "staff")) {
    console.log("User is not admin/staff:", currentProfile?.role);
    return [];
  }

  // Use admin client to query all staff
  const adminDb = await createAdminClient();
  const { data, error } = await adminDb
    .from("profiles")
    .select("*")
    .in("role", ["staff", "admin"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllStaffMembers error:", error.message);
    return [];
  }

  return data ?? [];
}

// ─── Update customer role (admin only) ───────────────────────────────────────

export async function updateCustomerRole(
  customerId: string,
  role: "customer" | "admin" | "staff"
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: currentProfile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || currentProfile.role !== "admin") {
    return { success: false, error: "Only administrators can modify roles." };
  }

  // Use admin client to bypass RLS
  const adminDb = await createAdminClient();
  const { error } = await (adminDb as any)
    .from("profiles")
    .update({ role })
    .eq("id", customerId);

  if (error) {
    console.error("updateCustomerRole error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// ─── Get customer statistics ─────────────────────────────────────────────────

export async function getCustomerStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      totalCustomers: 0,
      newThisMonth: 0,
      newThisWeek: 0,
    };
  }

  const { data: currentProfile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentProfile || (currentProfile.role !== "admin" && currentProfile.role !== "staff")) {
    return {
      totalCustomers: 0,
      newThisMonth: 0,
      newThisWeek: 0,
    };
  }

  // Use admin client to bypass RLS
  const adminDb = await createAdminClient();
  const { data: customers, error } = await adminDb
    .from("profiles")
    .select("id, created_at")
    .eq("role", "customer");

  if (error) {
    console.error("getCustomerStats error:", error.message);
    return {
      totalCustomers: 0,
      newThisMonth: 0,
      newThisWeek: 0,
    };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const newThisMonth = customers?.filter(
    (c: { created_at: string }) => new Date(c.created_at) >= startOfMonth
  ).length || 0;

  const newThisWeek = customers?.filter(
    (c: { created_at: string }) => new Date(c.created_at) >= startOfWeek
  ).length || 0;

  return {
    totalCustomers: customers?.length || 0,
    newThisMonth,
    newThisWeek,
  };
}
