"use server";

import { createClient } from "@/lib/supabase/server";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "unread" | "read" | "resolved";
  created_at: string;
};

// ─── Submit contact form ─────────────────────────────────────────────────────

export async function submitContactMessage(values: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  // Try to insert the message into the contact_messages table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("contact_messages")
    .insert([
      {
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        subject: values.subject,
        message: values.message,
      },
    ]);

  if (error) {
    console.error("submitContactMessage error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// ─── Admin: get all contact messages ─────────────────────────────────────────

export async function getContactMessages(): Promise<ContactMessage[]> {
  const supabase = await createClient();

  // First verify user is admin or staff
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getContactMessages error:", error.message);
    return [];
  }

  return data || [];
}

// ─── Admin: update message status ────────────────────────────────────────────

export async function updateContactMessageStatus(
  id: string,
  status: "unread" | "read" | "resolved"
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  // First verify user is admin or staff
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return { success: false, error: "Unauthorized" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("contact_messages")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("updateContactMessageStatus error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
