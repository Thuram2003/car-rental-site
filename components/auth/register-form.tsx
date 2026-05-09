"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { 
  Envelope, 
  Eye, 
  EyeSlash, 
  IdentificationCard, 
  IdentificationBadge, 
  UploadSimple,
  X,
  CheckCircle
} from "@phosphor-icons/react";
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
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const step1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(7, "Phone number is required"),
});

const step2Schema = z.object({
  idType: z.enum(["cni", "passport"], {
    required_error: "Please select an ID type",
  }),
  idNumber: z.string().min(5, "ID number is required"),
  idFrontImage: z.any().refine((file) => file !== null, "Front image is required"),
  idBackImage: z.any().refine((file) => file !== null, "Back image is required"),
  licenseNumber: z.string().min(5, "Driver's license number is required"),
  licenseFrontImage: z.any().refine((file) => file !== null, "License front image is required"),
  licenseBackImage: z.any().refine((file) => file !== null, "License back image is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  agreeTerms: z.boolean().refine((v) => v === true, "You must agree to the terms"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

export function RegisterForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [step1Data, setStep1Data] = useState<Step1Values | null>(null);

  // Image preview states
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [licenseFrontPreview, setLicenseFrontPreview] = useState<string | null>(null);
  const [licenseBackPreview, setLicenseBackPreview] = useState<string | null>(null);

  const form1 = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "" },
  });

  const form2 = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { 
      idType: "cni", 
      idNumber: "", 
      idFrontImage: null,
      idBackImage: null,
      licenseNumber: "", 
      licenseFrontImage: null,
      licenseBackImage: null,
      password: "", 
      confirmPassword: "", 
      agreeTerms: false 
    },
  });

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

  const onStep1Submit = (values: Step1Values) => {
    setStep1Data(values);
    setStep(2);
  };

  const onStep2Submit = async (values: Step2Values) => {
    setIsPending(true);
    // Supabase auth will go here
    await new Promise((r) => setTimeout(r, 1200));
    setIsPending(false);
    toast.success("Account created!", { description: "Please check your email to verify your account." });
  };

  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2 text-left">
        <h1 className="text-3xl text-gray-900 font-bold">Create account</h1>
        <p className="text-gray-400 md:text-base font-normal">
          Join DriveGo and start renting today
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= s ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              {s}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${step >= s ? "text-gray-700" : "text-gray-400"}`}>
              {s === 1 ? "Personal Info" : "ID & License"}
            </span>
            {s < 2 && (
              <div className={`flex-1 h-0.5 ${step > s ? "bg-primary" : "bg-gray-100"}`} />
            )}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <Form {...form1}>
          <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form1.control}
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
                control={form1.control}
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
              control={form1.control}
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
              control={form1.control}
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

            <div className="text-center sm:text-left pt-2">
              <p className="text-sm text-gray-500 font-normal">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </Form>
      ) : (
        <Form {...form2}>
          <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-6">
            {/* ID Type Selection */}
            <FormField
              control={form2.control}
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
              control={form2.control}
              name="idNumber"
              render={({ field }) => (
                <FormItem className="space-y-1.5 text-left">
                  <FormLabel className="text-gray-700 text-sm">
                    {form2.watch("idType") === "cni" ? "CNI Number" : "Passport Number"}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={
                          form2.watch("idType") === "cni"
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
                  Upload {form2.watch("idType") === "cni" ? "CNI" : "Passport"} Images
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* ID Front */}
                <FormField
                  control={form2.control}
                  name="idFrontImage"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormControl>
                        <Card className="border-2 border-dashed border-gray-200 hover:border-primary transition-colors overflow-hidden">
                          <CardContent className="p-0">
                            {idFrontPreview ? (
                              <div className="relative aspect-[3/2] group">
                                <Image
                                  src={idFrontPreview}
                                  alt="ID Front"
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeImage(setIdFrontPreview, onChange)}
                                    className="gap-1"
                                  >
                                    <X className="w-4 h-4" />
                                    Remove
                                  </Button>
                                </div>
                                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                  <CheckCircle className="w-4 h-4" weight="fill" />
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center aspect-[3/2] cursor-pointer hover:bg-gray-50 transition-colors">
                                <UploadSimple className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-xs text-gray-500 font-medium">Front Side</span>
                                <span className="text-xs text-gray-400 mt-1">Click to upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    handleImageUpload(file, setIdFrontPreview, onChange);
                                  }}
                                  {...field}
                                />
                              </label>
                            )}
                          </CardContent>
                        </Card>
                      </FormControl>
                      <FormMessage className="text-xs text-danger" />
                    </FormItem>
                  )}
                />

                {/* ID Back */}
                <FormField
                  control={form2.control}
                  name="idBackImage"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormControl>
                        <Card className="border-2 border-dashed border-gray-200 hover:border-primary transition-colors overflow-hidden">
                          <CardContent className="p-0">
                            {idBackPreview ? (
                              <div className="relative aspect-[3/2] group">
                                <Image
                                  src={idBackPreview}
                                  alt="ID Back"
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeImage(setIdBackPreview, onChange)}
                                    className="gap-1"
                                  >
                                    <X className="w-4 h-4" />
                                    Remove
                                  </Button>
                                </div>
                                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                  <CheckCircle className="w-4 h-4" weight="fill" />
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center aspect-[3/2] cursor-pointer hover:bg-gray-50 transition-colors">
                                <UploadSimple className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-xs text-gray-500 font-medium">Back Side</span>
                                <span className="text-xs text-gray-400 mt-1">Click to upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    handleImageUpload(file, setIdBackPreview, onChange);
                                  }}
                                  {...field}
                                />
                              </label>
                            )}
                          </CardContent>
                        </Card>
                      </FormControl>
                      <FormMessage className="text-xs text-danger" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Driver's License Section */}
            <FormField
              control={form2.control}
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
                <h3 className="text-sm font-semibold text-gray-900">Upload Driver&apos;s License Images</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* License Front */}
                <FormField
                  control={form2.control}
                  name="licenseFrontImage"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormControl>
                        <Card className="border-2 border-dashed border-gray-200 hover:border-primary transition-colors overflow-hidden">
                          <CardContent className="p-0">
                            {licenseFrontPreview ? (
                              <div className="relative aspect-[3/2] group">
                                <Image
                                  src={licenseFrontPreview}
                                  alt="License Front"
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeImage(setLicenseFrontPreview, onChange)}
                                    className="gap-1"
                                  >
                                    <X className="w-4 h-4" />
                                    Remove
                                  </Button>
                                </div>
                                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                  <CheckCircle className="w-4 h-4" weight="fill" />
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center aspect-[3/2] cursor-pointer hover:bg-gray-50 transition-colors">
                                <UploadSimple className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-xs text-gray-500 font-medium">Front Side</span>
                                <span className="text-xs text-gray-400 mt-1">Click to upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    handleImageUpload(file, setLicenseFrontPreview, onChange);
                                  }}
                                  {...field}
                                />
                              </label>
                            )}
                          </CardContent>
                        </Card>
                      </FormControl>
                      <FormMessage className="text-xs text-danger" />
                    </FormItem>
                  )}
                />

                {/* License Back */}
                <FormField
                  control={form2.control}
                  name="licenseBackImage"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormControl>
                        <Card className="border-2 border-dashed border-gray-200 hover:border-primary transition-colors overflow-hidden">
                          <CardContent className="p-0">
                            {licenseBackPreview ? (
                              <div className="relative aspect-[3/2] group">
                                <Image
                                  src={licenseBackPreview}
                                  alt="License Back"
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeImage(setLicenseBackPreview, onChange)}
                                    className="gap-1"
                                  >
                                    <X className="w-4 h-4" />
                                    Remove
                                  </Button>
                                </div>
                                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                  <CheckCircle className="w-4 h-4" weight="fill" />
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center aspect-[3/2] cursor-pointer hover:bg-gray-50 transition-colors">
                                <UploadSimple className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-xs text-gray-500 font-medium">Back Side</span>
                                <span className="text-xs text-gray-400 mt-1">Click to upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    handleImageUpload(file, setLicenseBackPreview, onChange);
                                  }}
                                  {...field}
                                />
                              </label>
                            )}
                          </CardContent>
                        </Card>
                      </FormControl>
                      <FormMessage className="text-xs text-danger" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form2.control}
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
              control={form2.control}
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
              control={form2.control}
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
                onClick={() => setStep(1)}
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
      )}
    </div>
  );
}
