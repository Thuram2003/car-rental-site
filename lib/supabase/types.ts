// Auto-generated types matching supabase_schema.sql
// Re-run `npx supabase gen types typescript` to regenerate from your project

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          role: "customer" | "admin" | "staff";
          license_number: string | null;
          license_expiry_date: string | null;
          date_of_birth: string | null;
          address: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "admin" | "staff";
          license_number?: string | null;
          license_expiry_date?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      branches: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string;
          phone: string | null;
          email: string | null;
          is_active: boolean;
          opening_hours: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["branches"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["branches"]["Insert"]>;
      };
      vehicles: {
        Row: {
          id: string;
          make: string;
          model: string;
          year: number;
          category: "Economy" | "SUV" | "Luxury" | "Sports" | "Van";
          color: string;
          license_plate: string;
          vin: string | null;
          seats: number;
          fuel_type: "Petrol" | "Diesel" | "Electric" | "Hybrid";
          transmission: "Automatic" | "Manual";
          mileage: number;
          daily_rate: number;
          status: "Available" | "Rented" | "Maintenance" | "Reserved";
          branch_id: string | null;
          image_url: string | null;
          cloudinary_public_id: string | null;
          features: Json;
          description: string | null;
          insurance_policy_number: string | null;
          last_service_date: string | null;
          next_service_due: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["vehicles"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehicles"]["Insert"]>;
      };
      vehicle_images: {
        Row: {
          id: string;
          vehicle_id: string;
          image_url: string;
          cloudinary_public_id: string | null;
          is_primary: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["vehicle_images"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehicle_images"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          vehicle_id: string;
          start_date: string;
          end_date: string;
          pickup_branch_id: string | null;
          dropoff_branch_id: string | null;
          daily_rate: number;
          number_of_days: number;
          subtotal: number;
          tax_amount: number;
          discount_amount: number;
          total_amount: number;
          booking_status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
          payment_status: "pending" | "partial" | "paid" | "refunded";
          special_requests: string | null;
          cancellation_reason: string | null;
          cancelled_at: string | null;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["bookings"]["Row"],
          "id" | "number_of_days" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          amount: number;
          payment_method: "cash" | "card" | "mobile_money" | "bank_transfer";
          payment_provider: string | null;
          transaction_reference: string | null;
          status: "pending" | "completed" | "failed" | "refunded";
          notes: string | null;
          processed_by: string | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          vehicle_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          is_verified: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      maintenance_logs: {
        Row: {
          id: string;
          vehicle_id: string;
          maintenance_type: "oil_change" | "tire_rotation" | "brake_service" | "inspection" | "repair" | "cleaning" | "other";
          description: string;
          cost: number | null;
          mileage_at_service: number | null;
          performed_by: string | null;
          performed_at: string;
          next_service_due: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["maintenance_logs"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["maintenance_logs"]["Insert"]>;
      };
      damage_reports: {
        Row: {
          id: string;
          booking_id: string | null;
          vehicle_id: string;
          reported_by: string;
          damage_type: "minor" | "moderate" | "major";
          description: string;
          repair_cost: number | null;
          insurance_claim_number: string | null;
          is_resolved: boolean;
          resolved_at: string | null;
          images: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["damage_reports"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["damage_reports"]["Insert"]>;
      };
    };
    Views: {
      vehicles_with_ratings: {
        Row: Database["public"]["Tables"]["vehicles"]["Row"] & {
          average_rating: number;
          review_count: number;
        };
      };
      booking_summary: {
        Row: {
          id: string;
          start_date: string;
          end_date: string;
          booking_status: string;
          payment_status: string;
          total_amount: number;
          created_at: string;
          customer_name: string;
          customer_phone: string | null;
          vehicle_name: string;
          license_plate: string;
          pickup_branch: string | null;
          dropoff_branch: string | null;
        };
      };
    };
    Functions: {
      get_vehicle_rating: {
        Args: { vehicle_uuid: string };
        Returns: { average_rating: number; review_count: number }[];
      };
      is_vehicle_available: {
        Args: {
          vehicle_uuid: string;
          check_start_date: string;
          check_end_date: string;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
};

// Convenience row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Branch = Database["public"]["Tables"]["branches"]["Row"];
export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
export type VehicleImage = Database["public"]["Tables"]["vehicle_images"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type MaintenanceLog = Database["public"]["Tables"]["maintenance_logs"]["Row"];
export type DamageReport = Database["public"]["Tables"]["damage_reports"]["Row"];
export type VehicleWithRating = Database["public"]["Views"]["vehicles_with_ratings"]["Row"];
export type BookingSummary = Database["public"]["Views"]["booking_summary"]["Row"];
