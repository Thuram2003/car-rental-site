"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Buildings,
  Pencil,
  Trash,
  MapPin,
  Phone,
  Envelope,
  Gear,
  Info,
  CircleNotch,
  FloppyDisk,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getAllBranches, deleteBranch, type Branch } from "@/lib/actions/branches";
import { BranchFormDialog } from "@/components/admin/BranchFormDialog";
import { DeleteBranchDialog } from "@/components/admin/DeleteBranchDialog";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"branches" | "constants" | "company">("branches");

  // Branches roster states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // System Constants configurations
  const [taxRate, setTaxRate] = useState("19.25");
  const [serviceFee, setServiceFee] = useState("5000");
  const [currency, setCurrency] = useState("FCFA");
  const [cancelHours, setCancelHours] = useState("24");

  // Company Profile states
  const [companyName, setCompanyName] = useState("DriveGo Rent-A-Car Ltd");
  const [companyPhone, setCompanyPhone] = useState("+237 233 42 56 78");
  const [companyEmail, setCompanyEmail] = useState("support@drivego.cm");
  const [companyAddress, setCompanyAddress] = useState("Bastos, Avenue Kennedy, Yaoundé");

  useEffect(() => {
    loadBranches();
    
    // Load local storage constants if present
    const savedTax = localStorage.getItem("dg_settings_tax");
    if (savedTax) setTaxRate(savedTax);
    const savedFee = localStorage.getItem("dg_settings_fee");
    if (savedFee) setServiceFee(savedFee);
    const savedCurrency = localStorage.getItem("dg_settings_currency");
    if (savedCurrency) setCurrency(savedCurrency);
    const savedCancel = localStorage.getItem("dg_settings_cancel");
    if (savedCancel) setCancelHours(savedCancel);

    const savedName = localStorage.getItem("dg_company_name");
    if (savedName) setCompanyName(savedName);
    const savedPhone = localStorage.getItem("dg_company_phone");
    if (savedPhone) setCompanyPhone(savedPhone);
    const savedEmail = localStorage.getItem("dg_company_email");
    if (savedEmail) setCompanyEmail(savedEmail);
    const savedAddress = localStorage.getItem("dg_company_address");
    if (savedAddress) setCompanyAddress(savedAddress);
  }, []);

  async function loadBranches() {
    setLoadingBranches(true);
    const data = await getAllBranches();
    setBranches(data);
    setLoadingBranches(false);
  }

  function handleEdit(branch: Branch) {
    setSelectedBranch(branch);
    setFormOpen(true);
  }

  function handleDelete(branch: Branch) {
    setSelectedBranch(branch);
    setDeleteOpen(true);
  }

  function handleAdd() {
    setSelectedBranch(null);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!selectedBranch) return;

    const { success, error } = await deleteBranch(selectedBranch.id);

    if (success) {
      toast.success("Branch deleted successfully");
      loadBranches();
      setDeleteOpen(false);
    } else {
      toast.error(error || "Failed to delete branch");
    }
  }

  const handleSaveConstants = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("dg_settings_tax", taxRate);
    localStorage.setItem("dg_settings_fee", serviceFee);
    localStorage.setItem("dg_settings_currency", currency);
    localStorage.setItem("dg_settings_cancel", cancelHours);
    toast.success("System constants saved successfully", {
      description: "Rental pricing equations updated locally."
    });
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("dg_company_name", companyName);
    localStorage.setItem("dg_company_phone", companyPhone);
    localStorage.setItem("dg_company_email", companyEmail);
    localStorage.setItem("dg_company_address", companyAddress);
    toast.success("Company profile saved successfully", {
      description: "Support desk contacts updated locally."
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">System Settings</h1>
        <p className="text-sm text-gray-500 font-light mt-0.5">
          Manage system rules, branch offices, and business metadata
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-gray-200 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab("branches")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
            activeTab === "branches"
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
        >
          Branch Locations
        </button>
        <button
          onClick={() => setActiveTab("constants")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
            activeTab === "constants"
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
        >
          System Constants
        </button>
        <button
          onClick={() => setActiveTab("company")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
            activeTab === "company"
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
        >
          Company Profile
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      
      {/* 1. Branches tab */}
      {activeTab === "branches" && (
        <Card className="border-gray-100 shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100/50">
                  <Buildings className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Branch Locations</h2>
                  <p className="text-xs text-gray-500 font-light">Manage physical offices for vehicle handoffs</p>
                </div>
              </div>
              <Button onClick={handleAdd} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-9 text-xs uppercase tracking-wider rounded-xl">
                <Plus className="w-4 h-4" />
                Add Branch
              </Button>
            </div>

            {loadingBranches ? (
              <div className="flex items-center justify-center py-20">
                <CircleNotch className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : branches.length === 0 ? (
              <div className="text-center py-12">
                <Buildings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No branches yet</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Add your first branch location to get started
                </p>
                <Button onClick={handleAdd} className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-4 h-4" />
                  Add First Branch
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {branches.map((branch) => (
                  <Card
                    key={branch.id}
                    className={`border border-gray-100 rounded-2xl shadow-xs overflow-hidden ${
                      branch.is_active ? "bg-white" : "bg-gray-50/50"
                    } hover:shadow-md hover:border-gray-200 transition-all`}
                  >
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="font-extrabold text-gray-900 text-sm leading-snug">{branch.name}</h3>
                          <Badge variant={branch.is_active ? "success" : "ghost"} className="text-[9px] uppercase tracking-wider font-bold">
                            {branch.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleEdit(branch)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(branch)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-xs border-t border-gray-50 pt-3 text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-850">{branch.address}</p>
                            <p className="text-gray-400 text-[10px] uppercase font-bold mt-0.5">{branch.city}</p>
                          </div>
                        </div>

                        {branch.phone && (
                          <a href={`tel:${branch.phone}`} className="flex items-center gap-2 hover:text-orange-500 transition-colors">
                            <Phone className="w-4 h-4 shrink-0 text-gray-400" />
                            <span className="font-medium">{branch.phone}</span>
                          </a>
                        )}

                        {branch.email && (
                          <a href={`mailto:${branch.email}`} className="flex items-center gap-2 hover:text-orange-500 transition-colors">
                            <Envelope className="w-4 h-4 shrink-0 text-gray-400" />
                            <span className="truncate font-medium">{branch.email}</span>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 2. Constants tab */}
      {activeTab === "constants" && (
        <Card className="border-gray-100 shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100/50">
                <Gear className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Pricing & Constants Rules</h2>
                <p className="text-xs text-gray-500 font-light">Configure system constants variables for invoice calculations</p>
              </div>
            </div>

            <form onSubmit={handleSaveConstants} className="space-y-6 max-w-xl">
              
              <div className="grid sm:grid-cols-2 gap-6">
                {/* VAT Tax */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">VAT Sales Tax Rate (%)</label>
                  <Input
                    placeholder="19.25"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="h-10 border-gray-200 font-semibold"
                  />
                  <p className="text-[10px] text-gray-450 font-light">Applied as percentage to base rental total</p>
                </div>

                {/* Service Fee */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Service Fee</label>
                  <Input
                    placeholder="5000"
                    value={serviceFee}
                    onChange={(e) => setServiceFee(e.target.value)}
                    className="h-10 border-gray-200 font-semibold"
                  />
                  <p className="text-[10px] text-gray-450 font-light">Fixed processing fee charged on checkouts</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Currency */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Default Currency Symbol</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700 font-semibold h-10"
                  >
                    <option value="FCFA">FCFA (Central African CFA)</option>
                    <option value="$">USD ($ Dollar)</option>
                    <option value="€">EUR (€ Euro)</option>
                    <option value="£">GBP (£ Pound)</option>
                  </select>
                </div>

                {/* Cancellation hours */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Free Cancel Limit (Hours)</label>
                  <Input
                    placeholder="24"
                    value={cancelHours}
                    onChange={(e) => setCancelHours(e.target.value)}
                    className="h-10 border-gray-200 font-semibold"
                  />
                  <p className="text-[10px] text-gray-450 font-light">Minimum hours prior to pickup for full refund eligibility</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-10 text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 px-5">
                  <FloppyDisk className="w-4 h-4" />
                  Save Constants
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 3. Company profile tab */}
      {activeTab === "company" && (
        <Card className="border-gray-100 shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100/50">
                <Info className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Company & Registration Profile</h2>
                <p className="text-xs text-gray-500 font-light">Configure public metadata displayed on customer checkout receipts and footer links</p>
              </div>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-6 max-w-xl">
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Legal Entity Name</label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-10 border-gray-200 font-semibold"
                  />
                </div>

                {/* Support Hotline */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Official Support Phone</label>
                  <Input
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="h-10 border-gray-200 font-semibold"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Official email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Official Contact Email</label>
                  <Input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="h-10 border-gray-200 font-semibold"
                  />
                </div>

                {/* HQ Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Headquarters Address</label>
                  <Input
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="h-10 border-gray-200 font-semibold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-10 text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 px-5">
                  <FloppyDisk className="w-4 h-4" />
                  Save Company Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Dialogs (Branches) */}
      <BranchFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        branch={selectedBranch}
        onSuccess={loadBranches}
      />

      <DeleteBranchDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        branch={selectedBranch}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
