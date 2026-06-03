"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Branch = {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  opening_hours: Record<string, string> | null;
  created_at: string;
  updated_at: string;
};

// ─── Get all branches (admin) ────────────────────────────────────────────────

export async function getAllBranches(): Promise<Branch[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("branches")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("getAllBranches error:", error.message);
    return [];
  }

  return (data ?? []) as Branch[];
}

// ─── Create branch ───────────────────────────────────────────────────────────

export async function createBranch(input: {
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  opening_hours?: Record<string, string>;
}): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("branches")
    .insert({
      name: input.name,
      address: input.address,
      city: input.city,
      phone: input.phone ?? null,
      email: input.email ?? null,
      opening_hours: input.opening_hours ?? null,
      is_active: true,
    });

  if (error) {
    console.error("createBranch error:", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/settings");
  return { success: true, error: null };
}

// ─── Update branch ───────────────────────────────────────────────────────────

export async function updateBranch(
  id: string,
  input: {
    name?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    opening_hours?: Record<string, string>;
    is_active?: boolean;
  }
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("branches")
    .update(input)
    .eq("id", id);

  if (error) {
    console.error("updateBranch error:", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/settings");
  return { success: true, error: null };
}

// ─── Delete branch (soft delete by setting is_active = false) ───────────────

export async function deleteBranch(id: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  // Check if branch has active bookings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: bookings, error: checkError } = await (supabase as any)
    .from("bookings")
    .select("id")
    .or(`pickup_branch_id.eq.${id},dropoff_branch_id.eq.${id}`)
    .in("booking_status", ["confirmed", "active"])
    .limit(1);

  if (checkError) {
    console.error("Check bookings error:", checkError.message);
    return { success: false, error: "Failed to check branch bookings" };
  }

  if (bookings && bookings.length > 0) {
    return {
      success: false,
      error: "Cannot delete branch with active bookings. Please complete or cancel them first.",
    };
  }

  // Soft delete by setting is_active to false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("branches")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    console.error("deleteBranch error:", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/settings");
  return { success: true, error: null };
}

// ─── Get branch statistics ───────────────────────────────────────────────────

export async function getBranchStats(branchId: string) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [vehiclesRes, bookingsRes] = await Promise.all([
    db.from("vehicles").select("id").eq("branch_id", branchId).eq("is_active", true),
    db
      .from("bookings")
      .select("id, total_amount")
      .or(`pickup_branch_id.eq.${branchId},dropoff_branch_id.eq.${branchId}`)
      .eq("is_deleted", false),
  ]);

  const vehicleCount = vehiclesRes.data?.length ?? 0;
  const bookingCount = bookingsRes.data?.length ?? 0;
  const totalRevenue = bookingsRes.data?.reduce((sum: number, b: { total_amount: number }) => sum + b.total_amount, 0) ?? 0;

  return {
    vehicleCount,
    bookingCount,
    totalRevenue,
  };
}
