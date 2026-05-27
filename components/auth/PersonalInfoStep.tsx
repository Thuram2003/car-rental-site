"use client";

import Link from "next/link";
import { UseFormReturn } from "react-hook-form";
import { Envelope } from "@phosphor-icons/react";
import { toast } from "sonner";
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
import { PhoneInput } from "@/components/ui/phone-input";

export interface PersonalInfoFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PersonalInfoStepProps {
  form: UseFormReturn<PersonalInfoFormValues>;
  onSubmit: (values: PersonalInfoFormValues) => void;
  showLoginLink?: boolean;
}

export function PersonalInfoStep({ 
  form, 
  onSubmit,
  showLoginLink = true 
}: PersonalInfoStepProps) {
  const handleSubmit = (values: PersonalInfoFormValues) => {
    onSubmit(values);
  };

  const handleError = () => {
    const errors = form.formState.errors;
    const errorMessages = Object.values(errors).map(error => error.message).filter(Boolean);
    
    if (errorMessages.length > 0) {
      toast.error("Please fix the following errors", {
        description: errorMessages[0] as string,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, handleError)} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="space-y-1.5 text-left">
                <FormLabel className="text-gray-700 text-sm">First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="James"
                    className="h-11 border-gray-200 bg-white focus:ring-1 focus:ring-primary placeholder:text-gray-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-danger" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="space-y-1.5 text-left">
                <FormLabel className="text-gray-700 text-sm">Last Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Osei"
                    className="h-11 border-gray-200 bg-white focus:ring-1 focus:ring-primary placeholder:text-gray-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-danger" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1.5 text-left">
              <FormLabel className="text-gray-700 text-sm">Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="you@example.com"
                    className="h-11 border-gray-200 bg-white pr-10 focus:ring-1 focus:ring-primary placeholder:text-gray-300"
                    {...field}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300">
                    <Envelope size={18} />
                  </div>
                </div>
              </FormControl>
              <FormMessage className="text-xs text-danger" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="space-y-1.5 text-left">
              <FormLabel className="text-gray-700 text-sm">Phone Number</FormLabel>
              <FormControl>
                <PhoneInput
                  international
                  defaultCountry="CM"
                  placeholder="+237 6 XX XX XX XX"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-danger" />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary-dark text-white font-normal">
          Continue
        </Button>

        {showLoginLink && (
          <div className="text-center sm:text-left pt-2">
            <p className="text-sm text-gray-500 font-normal">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </form>
    </Form>
  );
}
