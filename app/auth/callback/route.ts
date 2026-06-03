import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/login";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/login?verified=true`);
    } else {
      console.error("exchangeCodeForSession error:", error.message);
    }
  } else if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(`${origin}/login?verified=true`);
    } else {
      console.error("verifyOtp error:", error.message);
    }
  }

  // Return the user to verify-email page with error
  return NextResponse.redirect(`${origin}/verify-email?error=verification_failed`);
}
