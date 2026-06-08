"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { EnvelopeSimple, CheckCircle, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState("");

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to send reset email");
      }

      setEmailSent(values.email);
      setIsSuccess(true);
      toast.success("Reset link sent!", {
        description: "Check your email for the password reset link.",
      });
    } catch (error: any) {
      toast.error("Failed to send reset email", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle size={48} className="text-green-600" weight="fill" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Check your email</h1>
            <p className="text-gray-600 md:text-base font-normal">
              We've sent a password reset link to
            </p>
            <p className="text-gray-900 font-medium text-base">{emailSent}</p>
          </div>
        </div>

        <div className="space-y-5 pt-2">
          <p className="text-sm text-gray-600 text-center">
            Click the link in the email to reset your password. The link will expire in 1 hour.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => setIsSuccess(false)}
              variant="outline"
              className="w-full h-11"
            >
              Resend email
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
            Didn't receive the email? Check your spam folder.
          </p>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500">
      <div className="space-y-3">
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">Forgot password?</h1>
        <p className="text-gray-600 md:text-base leading-relaxed font-normal">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Email Address
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="e.g., john.doe@example.com"
              {...form.register("email")}
              icon={<EnvelopeSimple size={18} />}
              className="h-11"
              disabled={isLoading}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11"
        >
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-center text-gray-600">
          Remember your password?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
