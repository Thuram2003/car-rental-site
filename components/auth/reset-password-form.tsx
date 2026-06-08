"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, CheckCircle, XCircle, Eye, EyeSlash } from "@phosphor-icons/react";

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(new RegExp("[A-Z]"), "Password must contain at least one uppercase letter")
    .regex(new RegExp("[a-z]"), "Password must contain at least one lowercase letter")
    .regex(new RegExp("[0-9]"), "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setIsError(true);
      setErrorMessage("Invalid or missing reset token");
    }
  }, [token]);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) {
      toast.error("Invalid reset link");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token, 
          password: values.password 
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to reset password");
      }

      setIsSuccess(true);
      toast.success("Password reset successful!");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      toast.error("Failed to reset password", {
        description: error.message || "Please try again",
      });
      setIsError(true);
      setErrorMessage(error.message || "Failed to reset password");
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
            <h1 className="text-3xl font-bold text-gray-900">Password reset successful!</h1>
            <p className="text-gray-600 md:text-base font-normal">
              Your password has been successfully reset.
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
  if (isError && !token) {
    return (
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
            <XCircle size={48} className="text-red-600" weight="fill" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Invalid reset link</h1>
            <p className="text-red-600 md:text-base font-normal">
              {errorMessage || "This password reset link is invalid or has expired."}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Button 
            onClick={() => router.push("/forgot-password")}
            className="w-full h-11"
          >
            Request new reset link
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

  // Form state
  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">Reset your password</h1>
        <p className="text-gray-600 md:text-base leading-relaxed font-normal">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              {...form.register("password")}
              icon={<Lock size={18} />}
              className="h-11 pr-10"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Confirm New Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              {...form.register("confirmPassword")}
              icon={<Lock size={18} />}
              className="h-11 pr-10"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 font-medium mb-2">Password must contain:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• At least 8 characters</li>
            <li>• One uppercase letter</li>
            <li>• One lowercase letter</li>
            <li>• One number</li>
          </ul>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11"
        >
          {isLoading ? "Resetting..." : "Reset password"}
        </Button>
      </form>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-center text-gray-600">
          Remember your password?{" "}
          <Button 
            variant="link" 
            onClick={() => router.push("/login")}
            className="p-0 h-auto font-medium text-primary hover:underline"
          >
            Sign in
          </Button>
        </p>
      </div>
    </div>
  );
}
