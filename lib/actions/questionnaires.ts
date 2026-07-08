"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

// ============================================
// TYPES
// ============================================

export type QuestionType = "text" | "multiple_choice" | "rating" | "yes_no" | "textarea";

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  required: boolean;
  min_rating?: number;
  max_rating?: number;
}

export interface QuestionnaireResponse {
  question_id: string;
  answer: string | number | boolean;
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string | null;
  type: string;
  target_audience: string;
  is_active: boolean;
  is_mandatory: boolean;
  questions: Question[];
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireResponseRecord {
  id: string;
  questionnaire_id: string;
  user_id: string;
  booking_id: string | null;
  vehicle_id: string | null;
  responses: QuestionnaireResponse[];
  is_completed: boolean;
  completed_at: string | null;
  time_taken_seconds: number | null;
  created_at: string;
}

// ============================================
// ADMIN: CREATE QUESTIONNAIRE
// ============================================

export async function createQuestionnaire(data: {
  title: string;
  description?: string;
  type: string;
  target_audience?: string;
  is_mandatory?: boolean;
  questions: Question[];
  start_date?: string;
  end_date?: string;
}): Promise<{ id: string; error: string | null }> {
  const supabase = await createClient();

  // Check admin permission
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { id: "", error: "Unauthorized" };

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return { id: "", error: "Only admins can create questionnaires" };
  }

  // Create questionnaire
  const { data: questionnaire, error } = await (supabase as any)
    .from("questionnaires")
    .insert({
      title: data.title,
      description: data.description || null,
      type: data.type,
      target_audience: data.target_audience || "all",
      is_mandatory: data.is_mandatory || false,
      questions: data.questions,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createQuestionnaire error:", error.message);
    return { id: "", error: error.message };
  }

  return { id: questionnaire.id, error: null };
}

// ============================================
// ADMIN: UPDATE QUESTIONNAIRE
// ============================================

export async function updateQuestionnaire(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    is_active: boolean;
    is_mandatory: boolean;
    questions: Question[];
    start_date: string;
    end_date: string;
  }>
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await (supabase as any)
    .from("questionnaires")
    .update(data)
    .eq("id", id);

  if (error) {
    console.error("updateQuestionnaire error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// ============================================
// ADMIN: DELETE QUESTIONNAIRE
// ============================================

export async function deleteQuestionnaire(id: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await (supabase as any).from("questionnaires").delete().eq("id", id);

  if (error) {
    console.error("deleteQuestionnaire error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// ============================================
// ADMIN: GET ALL QUESTIONNAIRES
// ============================================

export async function getAllQuestionnaires(): Promise<Questionnaire[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return [];
  }

  const adminDb = await createAdminClient();
  const { data, error } = await adminDb
    .from("questionnaires")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllQuestionnaires error:", error.message);
    return [];
  }

  return (data ?? []) as Questionnaire[];
}

// ============================================
// ADMIN: GET QUESTIONNAIRE SUMMARY (with stats)
// ============================================

export async function getQuestionnaireSummary() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return [];
  }

  const adminDb = await createAdminClient();
  const { data, error } = await adminDb.from("questionnaire_summary").select("*").order("created_at", { ascending: false });

  if (error) {
    console.error("getQuestionnaireSummary error:", error.message);
    return [];
  }

  return data ?? [];
}

// ============================================
// ADMIN: GET ALL RESPONSES FOR A QUESTIONNAIRE
// ============================================

export async function getQuestionnaireResponses(questionnaireId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return [];
  }

  const adminDb = await createAdminClient();
  const { data, error } = await adminDb
    .from("questionnaire_responses")
    .select(
      `
      *,
      profiles (
        full_name,
        email
      ),
      bookings (
        id,
        start_date,
        end_date
      ),
      vehicles (
        make,
        model,
        license_plate
      )
    `
    )
    .eq("questionnaire_id", questionnaireId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getQuestionnaireResponses error:", error.message);
    return [];
  }

  return data ?? [];
}

// ============================================
// CUSTOMER: GET AVAILABLE QUESTIONNAIRES
// ============================================

export async function getAvailableQuestionnaires(): Promise<Questionnaire[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Get active questionnaires that user hasn't completed yet
  const { data, error } = await (supabase as any)
    .from("questionnaires")
    .select("*")
    .eq("is_active", true)
    .or(`start_date.is.null,start_date.lte.${new Date().toISOString()}`)
    .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAvailableQuestionnaires error:", error.message);
    return [];
  }

  // Filter out questionnaires user has already completed
  const questionnaires = (data ?? []) as Questionnaire[];
  const filtered = [];

  for (const q of questionnaires) {
    const { data: existingResponse } = await (supabase as any)
      .from("questionnaire_responses")
      .select("id, is_completed")
      .eq("questionnaire_id", q.id)
      .eq("user_id", user.id)
      .single();

    // Only show if user hasn't responded or hasn't completed it
    if (!existingResponse || !existingResponse.is_completed) {
      filtered.push(q);
    }
  }

  return filtered;
}

// ============================================
// CUSTOMER: GET QUESTIONNAIRE BY ID
// ============================================

export async function getQuestionnaireById(id: string): Promise<Questionnaire | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await (supabase as any).from("questionnaires").select("*").eq("id", id).single();

  if (error) {
    console.error("getQuestionnaireById error:", error.message);
    return null;
  }

  return data as Questionnaire;
}

// ============================================
// CUSTOMER: SUBMIT QUESTIONNAIRE RESPONSE
// ============================================

export async function submitQuestionnaireResponse(data: {
  questionnaireId: string;
  bookingId?: string;
  vehicleId?: string;
  responses: QuestionnaireResponse[];
  timeTakenSeconds?: number;
}): Promise<{ id: string; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { id: "", error: "You must be signed in to submit responses." };

  // Check if user already responded
  const { data: existing } = await (supabase as any)
    .from("questionnaire_responses")
    .select("id, is_completed")
    .eq("questionnaire_id", data.questionnaireId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing && existing.is_completed) {
    return { id: "", error: "You have already completed this questionnaire." };
  }

  if (existing) {
    // Update existing incomplete response
    const { data: updated, error } = await (supabase as any)
      .from("questionnaire_responses")
      .update({
        responses: data.responses,
        is_completed: true,
        time_taken_seconds: data.timeTakenSeconds || null,
      })
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error) {
      console.error("submitQuestionnaireResponse update error:", error.message);
      return { id: "", error: error.message };
    }

    return { id: updated.id, error: null };
  } else {
    // Create new response
    const { data: newResponse, error } = await (supabase as any)
      .from("questionnaire_responses")
      .insert({
        questionnaire_id: data.questionnaireId,
        user_id: user.id,
        booking_id: data.bookingId || null,
        vehicle_id: data.vehicleId || null,
        responses: data.responses,
        is_completed: true,
        time_taken_seconds: data.timeTakenSeconds || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("submitQuestionnaireResponse insert error:", error.message);
      return { id: "", error: error.message };
    }

    return { id: newResponse.id, error: null };
  }
}

// ============================================
// CUSTOMER: GET MY RESPONSES
// ============================================

export async function getMyQuestionnaireResponses() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await (supabase as any)
    .from("questionnaire_responses")
    .select(
      `
      *,
      questionnaires (
        title,
        type,
        description
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyQuestionnaireResponses error:", error.message);
    return [];
  }

  return data ?? [];
}

// ============================================
// CHECK IF USER HAS PENDING MANDATORY QUESTIONNAIRES
// ============================================

export async function hasPendingMandatoryQuestionnaires(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // Get mandatory questionnaires
  const { data: mandatoryQuestionnaires } = await (supabase as any)
    .from("questionnaires")
    .select("id")
    .eq("is_active", true)
    .eq("is_mandatory", true)
    .or(`start_date.is.null,start_date.lte.${new Date().toISOString()}`)
    .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`);

  if (!mandatoryQuestionnaires || mandatoryQuestionnaires.length === 0) {
    return false;
  }

  // Check if user completed all mandatory ones
  for (const q of mandatoryQuestionnaires) {
    const { data: response } = await (supabase as any)
      .from("questionnaire_responses")
      .select("is_completed")
      .eq("questionnaire_id", q.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!response || !response.is_completed) {
      return true; // Found a pending mandatory questionnaire
    }
  }

  return false;
}
