"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { signUp } from "@/lib/actions/auth";
import { 
  PersonalInfoStep, 
  type PersonalInfoFormValues 
} from "./PersonalInfoStep";
import { 
  DocumentVerificationStep, 
  type DocumentVerificationFormValues 
} from "./DocumentVerificationStep";

// Validation schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  phone: z.string().min(7, "Phone number is required"),
});

const documentVerificationSchema = z.object({
  idType: z.enum(["cni", "passport"]).refine((v) => !!v, {
    message: "Please select an ID type",
  }),
  idNumber: z.string().min(5, "ID number is required"),
  idFrontImage: z.any().optional(),
  idBackImage: z.any().optional(),
  licenseNumber: z.string().min(5, "Driver's license number is required"),
  licenseFrontImage: z.any().optional(),
  licenseBackImage: z.any().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  agreeTerms: z.literal(true, {
    message: "You must agree to the terms",
  }),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function RegisterForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isPending, setIsPending] = useState(false);
  const [personalInfoData, setPersonalInfoData] = useState<PersonalInfoFormValues | null>(null);

  const personalInfoForm = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "" },
  });

  const documentVerificationForm = useForm<DocumentVerificationFormValues>({
    resolver: zodResolver(documentVerificationSchema),
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

  const handlePersonalInfoSubmit = (values: PersonalInfoFormValues) => {
    setPersonalInfoData(values);
    setStep(2);
  };

  const handleDocumentVerificationSubmit = async (values: DocumentVerificationFormValues) => {
    if (!personalInfoData) return;
    
    setIsPending(true);
    const { error, needsVerification } = await signUp({
      email: personalInfoData.email,
      password: values.password,
      firstName: personalInfoData.firstName,
      lastName: personalInfoData.lastName,
      phone: personalInfoData.phone,
      licenseNumber: values.licenseNumber,
    });
    setIsPending(false);
    
    if (error) {
      toast.error("Registration failed", { description: error.message });
      return;
    }
    
    // Account is ready - login immediately!
    toast.success("Account created successfully!", { 
      description: "You can now login to your account." 
    });
    window.location.href = "/login";
  };

  const handleBack = () => {
    setStep(1);
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
        <PersonalInfoStep 
          form={personalInfoForm} 
          onSubmit={handlePersonalInfoSubmit}
        />
      ) : (
        <DocumentVerificationStep 
          form={documentVerificationForm} 
          onSubmit={handleDocumentVerificationSubmit}
          onBack={handleBack}
          isPending={isPending}
        />
      )}
    </div>
  );
}
