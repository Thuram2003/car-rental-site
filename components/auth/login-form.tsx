"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Envelope, Eye, EyeSlash, ArrowRight } from "@phosphor-icons/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (values: LoginValues) => {
    setIsPending(true);
    // Supabase auth will go here
    await new Promise((r) => setTimeout(r, 1200));
    setIsPending(false);
    toast.success("Welcome back!", { description: "Redirecting to your dashboard..." });
  };

  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl text-gray-900 font-bold">Sign in</h1>
        <p className="text-gray-400 md:text-base font-normal">
          Welcome back! Enter your details to access your account.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-gray-700 text-sm">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="you@example.com"
                      className="h-11 border-gray-200 bg-white pr-10 focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-300"
                      {...field}
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300">
                      <Envelope size={20} />
                    </div>
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-danger" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-gray-700 text-sm">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="h-11 border-gray-200 bg-white pr-10 focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-300"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 cursor-pointer"
                    >
                      {showPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-danger" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="h-4 w-4 border-gray-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor="rememberMe" className="text-sm font-normal text-gray-500 cursor-pointer">
                    Remember me
                  </label>
                </div>
              )}
            />
            <Link href="/forgot-password" className="text-sm text-gray-700 hover:text-primary transition-colors">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-primary hover:bg-primary-dark text-white font-normal transition-all"
          >
            {isPending ? "Signing in..." : "Sign in"}
            {!isPending && <ArrowRight size={16} />}
          </Button>

          <div className="text-center sm:text-left pt-2">
            <p className="text-sm text-gray-500 font-normal">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </form>
      </Form>

      <div className="bg-primary-lighter border border-primary-light rounded-sm p-4 text-center">
        <p className="text-xs text-primary">
          <span className="font-semibold">Browse freely.</span> Sign in is only required to book a car.
        </p>
      </div>
    </div>
  );
}
