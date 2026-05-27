"use client";

import { useState, useEffect, useRef } from "react";
import { X, ArrowLeft, ArrowRight, Spinner, Check, Car, Info, CurrencyCircleDollar } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { createVehicle, getActiveBranches } from "@/lib/actions/vehicles";
import { cn } from "@/lib/utils";

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const addVehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce
    .number()
    .min(1990, "Year must be 1990 or later")
    .max(new Date().getFullYear() + 2, "Invalid year"),
  color: z.string().min(1, "Color is required"),
  license_plate: z.string().min(2, "License plate is required"),
  category: z.enum(["Economy", "SUV", "Luxury", "Sports", "Van"]),
  fuel_type: z.enum(["Petrol", "Diesel", "Electric", "Hybrid"]),
  transmission: z.enum(["Automatic", "Manual"]),
  seats: z.coerce.number().min(2, "Minimum 2 seats").max(15, "Maximum 15 seats"),
  daily_rate: z.coerce.number().min(1, "Daily rate must be greater than 0"),
  description: z.string().optional(),
  branch_id: z.string().min(1, "Please select a branch"),
  image_url: z.string().min(1, "Vehicle image is required"),
  cloudinary_public_id: z.string().min(1, "Cloudinary ID is required"),
});

type AddVehicleValues = z.infer<typeof addVehicleSchema>;

// ─── Custom Zod Resolver ──────────────────────────────────────────────────────
// Prevents runtime ZodError incompatibilities by using safeParse and mapping flat paths.
const customZodResolver = (schema: z.ZodSchema) => {
  return async (values: any) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors: Record<string, any> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path[0] as string;
      errors[path] = {
        type: issue.code,
        message: issue.message,
      };
    });

    return {
      values: {},
      errors,
    };
  };
};

interface AddVehicleDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddVehicleDrawer({ open, onClose, onSuccess }: AddVehicleDrawerProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<{ id: string; name: string; city: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const form = useForm<AddVehicleValues>({
    resolver: customZodResolver(addVehicleSchema) as any,
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      license_plate: "",
      category: "Economy",
      fuel_type: "Petrol",
      transmission: "Automatic",
      seats: 5,
      daily_rate: 0,
      description: "",
      branch_id: "",
      image_url: "",
      cloudinary_public_id: "",
    },
    mode: "onTouched",
  });

  // Reset state when modal opens or closes
  useEffect(() => {
    if (open) {
      setStep(1);
      form.reset();
      // Load branches
      getActiveBranches().then((data) => {
        setBranches(data);
      });
    }
  }, [open, form]);

  const handleNext = async () => {
    let fieldsToValidate: (keyof AddVehicleValues)[] = [];

    if (step === 1) {
      fieldsToValidate = ["make", "model", "year", "color", "license_plate", "category"];
    } else if (step === 2) {
      fieldsToValidate = ["fuel_type", "transmission", "seats", "branch_id", "description"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => prev + 1);
    } else {
      toast.error("Please fill in all required fields correctly before moving to the next step.");
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const onSubmit = async (values: AddVehicleValues) => {
    setSaving(true);
    try {
      const result = await createVehicle({
        ...values,
        features: [],
      });

      if (!result) {
        toast.error("Failed to add vehicle to database. Please try again.");
        return;
      }

      toast.success(`${values.make} ${values.model} successfully added to fleet!`);
      form.reset();
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white rounded-lg border border-gray-100 shadow-xl">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <div>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              Add New Vehicle
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1">
              Fill in the step-by-step form to add a vehicle to the active fleet.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Step Progress Bar */}
        <div className="px-6 pt-5 pb-3 border-b border-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Step {step} of 3
            </span>
            <span className="text-xs font-medium text-gray-500 font-mono">
              {step === 1 && "Identity & Category"}
              {step === 2 && "Technical Details & Location"}
              {step === 3 && "Pricing & Vehicle Photo"}
            </span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden flex gap-1">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                step >= 1 ? "bg-primary flex-1" : "bg-gray-200 flex-1"
              )}
            />
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                step >= 2 ? "bg-primary flex-1" : "bg-gray-200 flex-1"
              )}
            />
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                step >= 3 ? "bg-primary flex-1" : "bg-gray-200 flex-1"
              )}
            />
          </div>
        </div>

        {/* Form Container */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col overflow-hidden"
          >
            {/* Steps Slider viewport */}
            <div ref={containerRef} className="overflow-hidden relative h-[420px] w-full">
              <div
                className="flex w-[300%] h-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${(step - 1) * 33.333}%)` }}
              >
                {/* STEP 1: Identity & Category */}
                <div className="w-1/3 h-full overflow-y-auto px-6 py-5 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                    <Info className="w-4 h-4 text-primary" />
                    1. Brand & Basic Details
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700">Make</FormLabel>
                          <FormControl>
                            <Input placeholder="Toyota, Mercedes, Hyundai" className="h-9 text-sm" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs text-danger" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700">Model</FormLabel>
                          <FormControl>
                            <Input placeholder="Corolla, C-Class, Elantra" className="h-9 text-sm" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs text-danger" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700">Year</FormLabel>
                          <FormControl>
                            <Input type="number" className="h-9 text-sm" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs text-danger" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700">Color</FormLabel>
                          <FormControl>
                            <Input placeholder="Black, Silver, Pearl White" className="h-9 text-sm" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs text-danger" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="license_plate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">License Plate</FormLabel>
                        <FormControl>
                          <Input placeholder="LT-123-AB" className="h-9 text-sm uppercase" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs text-danger" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9 text-sm bg-white">
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["Economy", "SUV", "Luxury", "Sports", "Van"].map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-danger" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* STEP 2: Technical Specifications & Branch */}
                <div className="w-1/3 h-full overflow-y-auto px-6 py-5 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                    <Info className="w-4 h-4 text-primary" />
                    2. Specifications & Branch
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fuel_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700">Fuel Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9 text-sm bg-white">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["Petrol", "Diesel", "Electric", "Hybrid"].map((fuel) => (
                                <SelectItem key={fuel} value={fuel}>
                                  {fuel}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs text-danger" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="transmission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700">Transmission</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9 text-sm bg-white">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Automatic">Automatic</SelectItem>
                              <SelectItem value="Manual">Manual</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs text-danger" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="seats"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700">Seats Capacity</FormLabel>
                          <FormControl>
                            <Input type="number" min={2} max={15} className="h-9 text-sm" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs text-danger" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="branch_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700">Assigned Branch</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9 text-sm bg-white">
                                <SelectValue placeholder="Select Branch" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {branches.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                  {b.name} ({b.city})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs text-danger" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          Description <span className="text-gray-400 font-normal">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <textarea
                            rows={3}
                            placeholder="Describe the vehicle's condition, features, or extras..."
                            className={cn(
                              "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none",
                              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            )}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-danger" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* STEP 3: Image & Pricing */}
                <div className="w-1/3 h-full overflow-y-auto px-6 py-5 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                    <CurrencyCircleDollar className="w-4 h-4 text-primary" />
                    3. Pricing & Image Upload
                  </h3>

                  <div className="grid grid-cols-2 gap-6 items-start">
                    {/* Left Column: Pricing & Preview */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="daily_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-gray-700">Daily Rate (FCFA)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input type="number" min={0} placeholder="35000" className="h-9 pl-8 text-sm font-medium text-gray-900" {...field} />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">
                                  ₣
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs text-danger" />
                          </FormItem>
                        )}
                      />

                      {/* Quick overview panel */}
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                          Vehicle Preview
                        </span>
                        <div className="flex gap-3 items-center">
                          <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center text-xs text-gray-400 relative">
                            {form.watch("image_url") ? (
                              <img
                                src={form.watch("image_url")}
                                alt="preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              "No photo"
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
                              {form.watch("make") || "Make"} {form.watch("model") || "Model"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {form.watch("category")} · {form.watch("year") || "Year"}
                            </p>
                            {form.watch("daily_rate") > 0 && (
                              <p className="text-xs text-primary font-semibold mt-0.5 font-mono">
                                {Number(form.watch("daily_rate")).toLocaleString()} FCFA / day
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Upload widget */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-gray-700 block">Vehicle Photo</span>
                      <FormField
                        control={form.control}
                        name="image_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="space-y-1">
                                <ImageUpload
                                  value={field.value || null}
                                  publicId={form.watch("cloudinary_public_id") || null}
                                  onChange={(result) => {
                                    if (result) {
                                      form.setValue("image_url", result.secure_url, { shouldValidate: true });
                                      form.setValue("cloudinary_public_id", result.public_id, { shouldValidate: true });
                                    } else {
                                      form.setValue("image_url", "", { shouldValidate: true });
                                      form.setValue("cloudinary_public_id", "", { shouldValidate: true });
                                    }
                                  }}
                                  aspectRatio="video"
                                  placeholder="Click to upload"
                                  folder="car-rental/vehicles"
                                />
                                {/* Hidden fields to track upload status */}
                                <input type="hidden" {...field} />
                                <input type="hidden" {...form.register("cloudinary_public_id")} />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs text-danger" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Controls */}
            <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
              <div>
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    disabled={saving}
                    className="flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {step < 3 ? (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleNext}
                    className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={saving || !form.watch("image_url")}
                    className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition-colors"
                  >
                    {saving ? (
                      <>
                        <Spinner className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Add Vehicle
                      </>
                    )}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
