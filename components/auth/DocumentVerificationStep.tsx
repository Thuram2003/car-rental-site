"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { 
  Eye, 
  EyeSlash, 
  IdentificationCard, 
  IdentificationBadge 
} from "@phosphor-icons/react";
import Link from "next/link";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentUploadCard } from "./DocumentUploadCard";

export interface DocumentVerificationFormValues {
  idType: "cni" | "passport";
  idNumber: string;
  idFrontImage: File | null;
  idBackImage: File | null;
  licenseNumber: string;
  licenseFrontImage: File | null;
  licenseBackImage: File | null;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface DocumentVerificationStepProps {
  form: UseFormReturn<DocumentVerificationFormValues>;
  onSubmit: (values: DocumentVerificationFormValues) => void;
  onBack: () => void;
  isPending?: boolean;
}

export function DocumentVerificationStep({ 
  form, 
  onSubmit, 
  onBack,
  isPending = false 
}: DocumentVerificationStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  // Image preview states
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [licenseFrontPreview, setLicenseFrontPreview] = useState<string | null>(null);
  const [licenseBackPreview, setLicenseBackPreview] = useState<string | null>(null);

  const handleImageUpload = (
    file: File | null,
    setPreview: (preview: string | null) => void,
    onChange: (file: File | null) => void
  ) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  const removeImage = (
    setPreview: (preview: string | null) => void,
    onChange: (file: null) => void
  ) => {
    setPreview(null);
    onChange(null);
  };

  const handleSubmit = (values: DocumentVerificationFormValues) => {
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
      <form onSubmit={form.handleSubmit(handleSubmit, handleError)} className="space-y-6">
        {/* ID Type Selection */}
        <FormField
          control={form.control}
          name="idType"
          render={({ field }) => (
            <FormItem className="space-y-1.5 text-left">
              <FormLabel className="text-gray-700 text-sm">ID Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 border-gray-200 bg-white">
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  <SelectItem value="cni">National ID Card (CNI)</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs text-danger" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="idNumber"
          render={({ field }) => (
            <FormItem className="space-y-1.5 text-left">
              <FormLabel className="text-gray-700 text-sm">
                {form.watch("idType") === "cni" ? "CNI Number" : "Passport Number"}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder={
                      form.watch("idType") === "cni"
                        ? "e.g., 123456789012"
                        : "e.g., CM1234567"
                    }
                    className="h-11 border-gray-200 bg-white pr-10 focus:ring-1 focus:ring-primary placeholder:text-gray-300"
                    {...field}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300">
                    <IdentificationBadge size={18} />
                  </div>
                </div>
              </FormControl>
              <FormMessage className="text-xs text-danger" />
            </FormItem>
          )}
        />

        {/* ID Document Upload Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <IdentificationBadge className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-gray-900">
              Upload {form.watch("idType") === "cni" ? "CNI" : "Passport"} Images <span className="text-gray-400 font-normal text-xs">(Optional)</span>
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* ID Front */}
            <FormField
              control={form.control}
              name="idFrontImage"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormControl>
                    <DocumentUploadCard
                      preview={idFrontPreview}
                      onUpload={(file) => handleImageUpload(file, setIdFrontPreview, onChange)}
                      onRemove={() => removeImage(setIdFrontPreview, onChange)}
                      label="Front Side"
                      altText="ID Front"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-danger" />
                </FormItem>
              )}
            />

            {/* ID Back */}
            <FormField
              control={form.control}
              name="idBackImage"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormControl>
                    <DocumentUploadCard
                      preview={idBackPreview}
                      onUpload={(file) => handleImageUpload(file, setIdBackPreview, onChange)}
                      onRemove={() => removeImage(setIdBackPreview, onChange)}
                      label="Back Side"
                      altText="ID Back"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-danger" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Driver's License Section */}
        <FormField
          control={form.control}
          name="licenseNumber"
          render={({ field }) => (
            <FormItem className="space-y-1.5 text-left">
              <FormLabel className="text-gray-700 text-sm">Driver&apos;s License Number</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="e.g., CM-DL-2020-000000"
                    className="h-11 border-gray-200 bg-white pr-10 focus:ring-1 focus:ring-primary placeholder:text-gray-300"
                    {...field}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300">
                    <IdentificationCard size={18} />
                  </div>
                </div>
              </FormControl>
              <FormMessage className="text-xs text-danger" />
            </FormItem>
          )}
        />

        {/* License Upload Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <IdentificationCard className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-gray-900">Upload Driver&apos;s License Images <span className="text-gray-400 font-normal text-xs">(Optional)</span></h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* License Front */}
            <FormField
              control={form.control}
              name="licenseFrontImage"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormControl>
                    <DocumentUploadCard
                      preview={licenseFrontPreview}
                      onUpload={(file) => handleImageUpload(file, setLicenseFrontPreview, onChange)}
                      onRemove={() => removeImage(setLicenseFrontPreview, onChange)}
                      label="Front Side"
                      altText="License Front"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-danger" />
                </FormItem>
              )}
            />

            {/* License Back */}
            <FormField
              control={form.control}
              name="licenseBackImage"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormControl>
                    <DocumentUploadCard
                      preview={licenseBackPreview}
                      onUpload={(file) => handleImageUpload(file, setLicenseBackPreview, onChange)}
                      onRemove={() => removeImage(setLicenseBackPreview, onChange)}
                      label="Back Side"
                      altText="License Back"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-danger" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-1.5 text-left">
              <FormLabel className="text-gray-700 text-sm">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    className="h-11 border-gray-200 bg-white pr-10 focus:ring-1 focus:ring-primary placeholder:text-gray-300"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 cursor-pointer"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeSlash size={18} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-xs text-danger" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="space-y-1.5 text-left">
              <FormLabel className="text-gray-700 text-sm">Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Repeat password"
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
          name="agreeTerms"
          render={({ field }) => (
            <div className="flex items-start space-x-2.5">
              <Checkbox
                id="agreeTerms"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-0.5 h-4 w-4 border-gray-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label htmlFor="agreeTerms" className="text-sm font-normal text-gray-500 cursor-pointer leading-snug">
                I have read and agree to the{" "}
                <Link href="#" className="text-primary hover:underline">
                  Terms of Service
                </Link>
                {" "}and{" "}
                <Link href="#" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
          )}
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 h-11 bg-primary hover:bg-primary-dark text-white font-normal"
          >
            {isPending ? "Creating account..." : "Create Account"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
