"use server";

import { createClient } from "@/lib/supabase/server";
import type { VehicleWithRating } from "@/lib/supabase/types";

export type VehicleFilters = {
  category?: string;
  fuelType?: string;
  maxDailyRate?: number;
  search?: string;
  status?: string;
};

// ─── Public: list active vehicles with ratings ───────────────────────────────

export async function getVehicles(
  filters: VehicleFilters = {}
): Promise<VehicleWithRating[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("vehicles_with_ratings")
    .select("*")
    .eq("is_active", true)
    .order("average_rating", { ascending: false });

  if (filters.category && filters.category !== "All") {
    query = query.eq("category", filters.category);
  }
  if (filters.fuelType && filters.fuelType !== "All") {
    query = query.eq("fuel_type", filters.fuelType);
  }
  if (filters.status && filters.status !== "All") {
    query = query.eq("status", filters.status);
  }
  if (filters.maxDailyRate) {
    query = query.lte("daily_rate", filters.maxDailyRate);
  }
  if (filters.search) {
    query = query.or(
      `make.ilike.%${filters.search}%,model.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("getVehicles error:", error.message);
    return [];
  }

  return (data ?? []) as VehicleWithRating[];
}

// ─── Public: single vehicle ───────────────────────────────────────────────────

export async function getVehicleById(id: string): Promise<VehicleWithRating | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("vehicles_with_ratings")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("getVehicleById error:", error.message);
    return null;
  }

  return data as VehicleWithRating;
}

// ─── Check availability ───────────────────────────────────────────────────────

export async function checkVehicleAvailability(
  vehicleId: string,
  startDate: string,
  endDate: string
): Promise<boolean> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("is_vehicle_available", {
    vehicle_uuid: vehicleId,
    check_start_date: startDate,
    check_end_date: endDate,
  });

  if (error) {
    console.error("checkVehicleAvailability error:", error.message);
    return false;
  }

  return data ?? false;
}

// ─── Admin: all vehicles ──────────────────────────────────────────────────────

export async function getAllVehiclesAdmin() {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("vehicles")
    .select("*, branches(name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllVehiclesAdmin error:", error.message);
    return [];
  }

  return data ?? [];
}

// ─── Get all vehicles (for reports) ──────────────────────────────────────────

export async function getAllVehicles() {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("vehicles")
    .select("id, category, daily_rate, status")
    .eq("is_active", true);

  if (error) {
    console.error("getAllVehicles error:", error.message);
    return [];
  }

  return data ?? [];
}

// ─── Admin: create vehicle ────────────────────────────────────────────────────

export async function createVehicle(vehicle: {
  make: string;
  model: string;
  year: number;
  category: "Economy" | "SUV" | "Luxury" | "Sports" | "Van";
  color: string;
  license_plate: string;
  seats: number;
  fuel_type: "Petrol" | "Diesel" | "Electric" | "Hybrid";
  transmission: "Automatic" | "Manual";
  daily_rate: number;
  branch_id?: string | null;
  image_url?: string | null;
  cloudinary_public_id?: string | null;
  features?: string[];
  description?: string;
}): Promise<{ id: string } | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("vehicles")
    .insert(vehicle)
    .select("id")
    .single();

  if (error) {
    console.error("createVehicle error:", error.message);
    return null;
  }

  return data as { id: string };
}

// ─── Admin: update vehicle ────────────────────────────────────────────────────

export async function updateVehicle(
  id: string,
  updates: Record<string, unknown>
): Promise<boolean> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("vehicles")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("updateVehicle error:", error.message);
    return false;
  }

  return true;
}

// ─── Admin: soft-delete vehicle ───────────────────────────────────────────────

export async function deactivateVehicle(id: string): Promise<boolean> {
  return updateVehicle(id, { is_active: false });
}

// ─── Public/Admin: get active branches ────────────────────────────────────────

export async function getActiveBranches(): Promise<{ id: string; name: string; city: string }[]> {
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

  return (data ?? []) as { id: string; name: string; city: string }[];
}

