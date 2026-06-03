"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { EnvelopeSimple, CheckCircle, XCircle } from "@phosphor-icons/react";
import { resendVerificationEmail } from "@/lib/actions/auth";

type VerificationStatus = "idle" | "verifying" | "success" | "error";

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [inputEmail, setInputEmail] = useState("");
  
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const type = searchParams.get("type");

  useEffect(() => {
    // 1. Immediately handle Supabase verification error redirects
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    
    if (errorParam) {
      setVerificationStatus("error");
      setErrorMessage(
        errorDescription || 
        (errorParam === "verification_failed" 
          ? "The verification link has expired, was already used, or is invalid. Please request a new link below." 
          : "Verification failed.")
      );
      return;
    }

    // 2. If we have token_hash and type from Supabase email link, verify it
    async function verifyEmail() {
      if (token && type === "email") {
        setVerificationStatus("verifying");
        
        try {
          const supabase = createClient();
          
          // Verify the email using Supabase's verifyOtp
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "email",
          });

          if (error) {
            throw error;
          }

          setVerificationStatus("success");
          toast.success("Email verified successfully!");
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } catch (error: any) {
          console.error("[Verify Email] Error:", error);
          setVerificationStatus("error");
          setErrorMessage(error.message || "Verification failed");
          toast.error("Verification failed", {
            description: error.message || "Please try again",
          });
        }
      }
    }

    verifyEmail();
  }, [token, type, router, searchParams]);

  async function handleResend() {
    const targetEmail = email || inputEmail;
    if (!targetEmail) {
      toast.error("Email not found", {
        description: "Please enter your email to request a new link.",
      });
      return;
    }

    setIsResending(true);
    try {
      const { success, error } = await resendVerificationEmail(targetEmail);

      if (!success) {
        throw new Error(error || "Failed to resend confirmation email");
      }

      toast.success("Verification email sent!", {
        description: "Check your inbox for the verification link.",
      });
    } catch (error: any) {
      toast.error("Failed to send email", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsResending(false);
    }
  }

  // Verifying state
  if (verificationStatus === "verifying") {
    return (
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Verifying your email</h1>
            <p className="text-gray-600 md:text-base font-normal">
              Please wait while we verify your account...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (verificationStatus === "success") {
    return (
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle size={48} className="text-green-600" weight="fill" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Email verified!</h1>
            <p className="text-gray-600 md:text-base font-normal">
              Your email has been successfully verified.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-sm text-gray-600 text-center">
            Redirecting you to login in a moment...
          </p>

          <Button 
            onClick={() => router.push("/login")}
            className="w-full h-11"
          >
            Continue to Login
          </Button>
        </div>
      </div>
    );
  }

  // Error state
  if (verificationStatus === "error") {
    const hasEmail = !!(email || inputEmail);
    return (
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
            <XCircle size={48} className="text-red-600" weight="fill" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Verification failed</h1>
            <p className="text-red-600 md:text-base font-normal px-2">
              {errorMessage || "We couldn't verify your email."}
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            Supabase link verification failed. This usually means the email verification token has expired (expires in 24 hours), or the link has already been used once.
          </p>

          {/* Email input field when no email was passed in parameters */}
          {!email && (
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Your Registered Email</label>
              <Input
                type="email"
                placeholder="e.g., name@example.com"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                icon={<EnvelopeSimple size={18} />}
                className="h-11 border-gray-200"
              />
            </div>
          )}

          <Button
            onClick={handleResend}
            disabled={isResending || !hasEmail}
            className="w-full h-11"
          >
            {isResending ? "Sending Link..." : "Request new verification link"}
          </Button>

          <Button 
            onClick={() => router.push("/login")}
            variant="outline" 
            className="w-full h-11"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  // Idle state - show email sent message
  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <EnvelopeSimple size={32} className="text-primary" weight="fill" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Check your email</h1>
          <p className="text-gray-600 md:text-base font-normal">
            We've sent a verification link to
          </p>
          {email && (
            <p className="text-gray-900 font-medium text-base">{email}</p>
          )}
        </div>
      </div>

      <div className="space-y-5 pt-2">
        <p className="text-sm text-gray-600 text-center">
          Click the link in the email to verify your account and start renting.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleResend}
            disabled={isResending || !email}
            variant="outline"
            className="w-full h-11"
          >
            {isResending ? "Sending..." : "Resend verification email"}
          </Button>

          <Button 
            onClick={() => router.push("/login")}
            variant="ghost" 
            className="w-full h-11"
          >
            Back to Login
          </Button>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Didn't receive the email? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
}
