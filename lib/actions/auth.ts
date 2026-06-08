"use server";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export interface AuthError {
  message: string;
}

// ─── Sign In ────────────────────────────────────────────────────────────────

export async function signIn(
  email: string,
  password: string
): Promise<{ error: AuthError | null; redirectTo?: string; needsVerification?: boolean }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: { message: error.message } };
    }

    // Check role to redirect admin vs customer
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single() as { data: { role: string } | null; error: unknown };

      const role = profile?.role;
      if (role === "admin" || role === "staff") {
        return { error: null, redirectTo: "/admin/dashboard" };
      }
    }

    return { error: null, redirectTo: "/" };
  } catch (error) {
    console.error("Sign in error:", error);
    return { error: { message: "An unexpected error occurred during sign in" } };
  }
}

// ─── Sign Up ─────────────────────────────────────────────────────────────────

export async function signUp(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  licenseNumber: string;
}): Promise<{ error: AuthError | null; needsVerification?: boolean }> {
  try {
    // Use admin client to create user WITHOUT email verification
    const adminClient = await createAdminClient();

    // Create user with email already confirmed - no verification needed!
    const { data: authData, error } = await adminClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // ✅ Email is auto-confirmed - can login immediately!
      user_metadata: {
        full_name: `${data.firstName} ${data.lastName}`,
        phone: data.phone,
        license_number: data.licenseNumber,
      },
    });

    if (error) {
      return { error: { message: error.message } };
    }

    // Profile is auto-created by the handle_new_user trigger.
    // Update phone + license_number which the trigger doesn't set
    if (authData.user) {
      await (adminClient as any)
        .from("profiles")
        .update({ phone: data.phone, license_number: data.licenseNumber })
        .eq("id", authData.user.id);
    }

    // No email verification needed - users can login immediately
    return { error: null, needsVerification: false };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: { message: "An unexpected error occurred during registration" } };
  }
}

// ─── Sign Out ────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ─── Get Session ─────────────────────────────────────────────────────────────

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ─── Get Current User Profile ────────────────────────────────────────────────

export async function getCurrentProfile(): Promise<(Profile & { email?: string; id_type?: string; id_number?: string }) | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    ...(profile as Profile),
    email: user.email,
    id_type: user.user_metadata?.id_type || "cni",
    id_number: user.user_metadata?.id_number || "",
  } as Profile & { email?: string; id_type?: string; id_number?: string };
}

// ─── Update User Profile ─────────────────────────────────────────────────────

export async function updateProfile(data: {
  full_name: string;
  phone?: string;
  avatar_url?: string | null;
  license_number?: string;
  license_expiry_date?: string | null;
  date_of_birth?: string | null;
  address?: string;
  city?: string;
  country?: string;
  id_type?: "cni" | "passport";
  id_number?: string;
}): Promise<{ error: AuthError | null; profile?: Profile & { email?: string; id_type?: string; id_number?: string } }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: { message: "Not authenticated" } };
    }

    // Update the Auth metadata for id_type and id_number
    if (data.id_type || data.id_number) {
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          id_type: data.id_type,
          id_number: data.id_number,
        }
      });
      if (metaError) {
        console.error("Error updating user metadata:", metaError);
      }
    }

    const { data: updatedProfile, error } = await (supabase as any)
      .from("profiles")
      .update({
        full_name: data.full_name,
        phone: data.phone || null,
        avatar_url: data.avatar_url || null,
        license_number: data.license_number || null,
        license_expiry_date: data.license_expiry_date || null,
        date_of_birth: data.date_of_birth || null,
        address: data.address || null,
        city: data.city || null,
        country: data.country || "Cameroon",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return { error: { message: error.message } };
    }

    return { 
      error: null, 
      profile: {
        ...(updatedProfile as Profile),
        email: user.email,
        id_type: data.id_type || user.user_metadata?.id_type || "cni",
        id_number: data.id_number || user.user_metadata?.id_number || "",
      }
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: { message: "An unexpected error occurred while updating profile" } };
  }
}

// ─── Update Account Password ─────────────────────────────────────────────────

export async function updatePassword(password: string): Promise<{ error: AuthError | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { error: { message: error.message } };
    }

    return { error: null };
  } catch (error) {
    console.error("Update password error:", error);
    return { error: { message: "An unexpected error occurred while updating password" } };
  }
}

// ─── Admin: get all customers ─────────────────────────────────────────────────

export async function getCustomers(): Promise<Profile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCustomers error:", error.message);
    return [];
  }

  return (data ?? []) as Profile[];
}

// ─── Sign Out ────────────────────────────────────────────────────────────────

export async function signOutAction(): Promise<{ error: { message: string } | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: { message: error.message } };
    }
    return { error: null };
  } catch (error) {
    console.error("Sign out error:", error);
    return { error: { message: "An unexpected error occurred during sign out" } };
  }
}

// ─── Resend Verification Email ───────────────────────────────────────────────

export async function resendVerificationEmail(email: string): Promise<{ success: boolean; error: string | null }> {
  try {
    // Get user ID from email
    const adminClient = await createAdminClient();
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      return { success: false, error: "Failed to find user" };
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Send verification email via Resend API (not Supabase)
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        userId: user.id,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return { success: false, error: result.error || "Failed to send verification email" };
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Resend verification email error:", error);
    return { success: false, error: error.message || "An unexpected error occurred during resending." };
  }
}
