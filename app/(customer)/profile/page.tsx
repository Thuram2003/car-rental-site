"use client";

import { useState, useEffect, useRef } from "react";
import { 
  User, 
  IdentificationCard, 
  Lock, 
  Spinner, 
  Phone, 
  Envelope, 
  MapPin, 
  Calendar,
  Globe,
  Camera,
  Check,
  IdentificationBadge
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { getCurrentProfile, updateProfile, updatePassword } from "@/lib/actions/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Profile } from "@/lib/supabase/types";

type TabType = "personal" | "license" | "security";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [profile, setProfile] = useState<(Profile & { email?: string; id_type?: string; id_number?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Avatar Uploader States
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Profile Form States (Split names to match registration!)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState("");
  
  // Identity & License Form States
  const [idType, setIdType] = useState<"cni" | "passport">("cni");
  const [idNumber, setIdNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Cameroon");

  // Password Form States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getCurrentProfile();
        if (data) {
          setProfile(data);
          
          // Split full_name into firstName and lastName to match registration flow
          const nameParts = (data.full_name || "").split(" ");
          setFirstName(nameParts[0] || "");
          setLastName(nameParts.slice(1).join(" ") || "");
          
          setPhone(data.phone || "");
          setAvatarUrl(data.avatar_url || null);
          setDateOfBirth(data.date_of_birth || "");
          
          // Load CNI/Passport metadata
          setIdType((data.id_type as "cni" | "passport") || "cni");
          setIdNumber(data.id_number || "");
          
          setLicenseNumber(data.license_number || "");
          setLicenseExpiryDate(data.license_expiry_date || "");
          setAddress(data.address || "");
          setCity(data.city || "");
          setCountry(data.country || "Cameroon");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const uploadResult = await uploadToCloudinary(file, "car-rental/profile");
      
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await updateProfile({
        full_name: fullName,
        phone: phone || undefined,
        avatar_url: uploadResult.secure_url,
        date_of_birth: dateOfBirth ? dateOfBirth : null,
        id_type: idType,
        id_number: idNumber || undefined,
        license_number: licenseNumber || undefined,
        license_expiry_date: licenseExpiryDate ? licenseExpiryDate : null,
        address: address || undefined,
        city: city || undefined,
        country: country || undefined,
      });

      if (res.error) {
        toast.error("Failed to save avatar", { description: res.error.message });
      } else if (res.profile) {
        setAvatarUrl(uploadResult.secure_url);
        setProfile(res.profile);
        toast.success("Profile photo updated successfully!");

        // Update local storage and trigger global sync event for the Navbar
        if (typeof window !== "undefined") {
          localStorage.setItem("drivego_user_profile", JSON.stringify(res.profile));
          window.dispatchEvent(new Event("profile_updated"));
        }
      }
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Photo upload failed";
      toast.error("Avatar upload failed", { 
        description: errMsg.includes("preset") || errMsg.includes("Preset")
          ? "Unsigned upload preset 'car_rental_vehicles' not found in Cloudinary. Please check your dashboard settings or add it in your .env.local file."
          : errMsg,
        duration: 8000
      });
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error("First name is required");
      return;
    }
    if (!lastName.trim()) {
      toast.error("Last name is required");
      return;
    }

    setSaving(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await updateProfile({
        full_name: fullName,
        phone: phone || undefined,
        avatar_url: avatarUrl,
        date_of_birth: dateOfBirth ? dateOfBirth : null,
        id_type: idType,
        id_number: idNumber || undefined,
        license_number: licenseNumber || undefined,
        license_expiry_date: licenseExpiryDate ? licenseExpiryDate : null,
        address: address || undefined,
        city: city || undefined,
        country: country || undefined,
      });

      if (res.error) {
        toast.error("Failed to update profile", { description: res.error.message });
      } else if (res.profile) {
        setProfile(res.profile);
        toast.success("Account details updated successfully!");

        // Update local storage and trigger global sync event for the Navbar
        if (typeof window !== "undefined") {
          localStorage.setItem("drivego_user_profile", JSON.stringify(res.profile));
          window.dispatchEvent(new Event("profile_updated"));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error("Password cannot be empty");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await updatePassword(newPassword);
      if (res.error) {
        toast.error("Password update failed", { description: res.error.message });
      } else {
        toast.success("Password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-gray-500 font-sans">Loading account settings...</p>
      </div>
    );
  }

  const initials = profile?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) || "U";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 font-sans">
      {/* Header */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-gray-500 text-sm mt-1.5 font-normal">
          Manage your personal info, verification documents, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Summary Panel */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center">
          {/* Active Click-to-Upload Circular Avatar */}
          <div 
            onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
            className="relative group w-32 h-32 mb-5 cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
            title="Click to change profile picture"
          >
            <div className="w-full h-full rounded-full border-4 border-orange-50 overflow-hidden bg-orange-50 flex items-center justify-center relative shadow-inner">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={profile?.full_name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-3xl font-bold text-primary font-sans tracking-wide">{initials}</span>
              )}
            </div>
            {/* Camera Overlay Icon on Hover */}
            <div className="absolute inset-0 bg-black/45 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-200">
              <Camera className="w-6 h-6 text-white" />
            </div>
            {/* Uploading Spinner */}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                <Spinner className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Hidden Avatar File Input */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
            disabled={uploadingAvatar}
          />

          <h2 className="text-lg font-bold text-gray-900 font-sans tracking-tight">{profile?.full_name}</h2>
          
          <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold px-3 py-1 rounded-full bg-primary-lighter text-primary tracking-wider uppercase">
            {profile?.role === "customer" ? "Verified Customer" : profile?.role}
          </span>

          <div className="w-full border-t border-gray-50 mt-6 pt-6 space-y-4 text-left">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Envelope className="w-4.5 h-4.5 text-gray-400 shrink-0" />
              <span className="truncate font-medium">{profile?.email || "No email linked"}</span>
            </div>
            {profile?.phone && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                <span className="font-medium">{profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar className="w-4.5 h-4.5 text-gray-400 shrink-0" />
              <span className="font-medium">Joined {new Date(profile?.created_at || "").toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Main Detail Tabs */}
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button
              onClick={() => setActiveTab("personal")}
              className={`flex-1 py-4 px-6 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "personal"
                  ? "border-primary text-primary bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <User className="w-4 h-4" />
              Personal Info
            </button>
            <button
              onClick={() => setActiveTab("license")}
              className={`flex-1 py-4 px-6 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "license"
                  ? "border-primary text-primary bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <IdentificationCard className="w-4 h-4" />
              Identity & Licensing
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex-1 py-4 px-6 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "security"
                  ? "border-primary text-primary bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Lock className="w-4 h-4" />
              Security
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* PERSONAL DETAILS FORM */}
            {activeTab === "personal" && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Personal Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* First Name (Matches registration input style!) */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                      <Input 
                        placeholder="John" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        icon={<User size={18} />}
                      />
                    </div>

                    {/* Last Name (Matches registration input style!) */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                      <Input 
                        placeholder="Doe" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        icon={<User size={18} />}
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                      <div className="h-11">
                        <PhoneInput 
                          placeholder="Enter phone number" 
                          value={phone}
                          onChange={(val: any) => setPhone(val || "")}
                          defaultCountry="CM"
                          className="w-full h-full"
                        />
                      </div>
                    </div>

                    {/* Email (Disabled) */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                      <Input 
                        type="email"
                        value={profile?.email || ""} 
                        disabled
                        icon={<Envelope size={18} />}
                        className="bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed select-none"
                      />
                      <span className="text-[10px] text-gray-400 font-medium block">Contact support if you need to update your email.</span>
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date of Birth</label>
                      <Input 
                        type="date"
                        value={dateOfBirth} 
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        icon={<Calendar size={18} />}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <Button type="submit" disabled={saving} className="min-w-[140px] h-11">
                    {saving ? (
                      <>
                        <Spinner className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* IDENTITY & DRIVER LICENSE DETAILS */}
            {activeTab === "license" && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <IdentificationCard className="w-5 h-5 text-primary" />
                    Identity & Licensing Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* ID Type (CNI or Passport) */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Identity ID Type</label>
                      <div className="relative">
                        <select
                          value={idType}
                          onChange={(e) => setIdType(e.target.value as "cni" | "passport")}
                          className="h-11 w-full rounded-sm border border-gray-200 bg-white px-10 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-gray-900"
                        >
                          <option value="cni">National ID Card (CNI)</option>
                          <option value="passport">Passport</option>
                        </select>
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <IdentificationBadge size={18} />
                        </span>
                      </div>
                    </div>

                    {/* ID Card / Passport Number */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{idType === "cni" ? "CNI Card" : "Passport"} Number</label>
                      <Input 
                        placeholder={idType === "cni" ? "e.g., 123456789" : "e.g., CM123456"} 
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        icon={<IdentificationBadge size={18} />}
                      />
                    </div>

                    {/* License Number */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Driver's License Number</label>
                      <Input 
                        placeholder="e.g., CM-DL-2026-XXXX" 
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        icon={<IdentificationCard size={18} />}
                      />
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">License Expiry Date</label>
                      <Input 
                        type="date"
                        value={licenseExpiryDate}
                        onChange={(e) => setLicenseExpiryDate(e.target.value)}
                        icon={<Calendar size={18} />}
                      />
                    </div>

                    {/* Street Address */}
                    <div className="space-y-2 text-left md:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Street Address</label>
                      <Input 
                        placeholder="123 Rue de Bastos" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        icon={<MapPin size={18} />}
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">City</label>
                      <Input 
                        placeholder="Yaounde" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        icon={<MapPin size={18} />}
                      />
                    </div>

                    {/* Country */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Country</label>
                      <Input 
                        placeholder="Cameroon" 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        icon={<Globe size={18} />}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <Button type="submit" disabled={saving} className="min-w-[140px] h-11">
                    {saving ? (
                      <>
                        <Spinner className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save Identity Info
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* SECURITY & PASSWORD RESET */}
            {activeTab === "security" && (
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Security Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* New Password */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                      <Input 
                        type="password" 
                        placeholder="Min. 6 characters" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        icon={<Lock size={18} />}
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                      <Input 
                        type="password" 
                        placeholder="Repeat new password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        icon={<Lock size={18} />}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <Button type="submit" disabled={passwordLoading} className="min-w-[140px] h-11">
                    {passwordLoading ? (
                      <>
                        <Spinner className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
