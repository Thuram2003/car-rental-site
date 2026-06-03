"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserPlus,
  Users,
  Trash,
  Phone,
  CircleNotch,
  UserGear,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import {
  getAllStaffMembers,
  getAllCustomers,
  updateCustomerRole,
} from "@/lib/actions/customers";
import { toast } from "sonner";

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Promotion form states
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedRole, setSelectedRole] = useState<"staff" | "admin">("staff");
  const [submittingPromotion, setSubmittingPromotion] = useState(false);

  // Load roster and promotion dropdown choices
  const loadRosterData = async () => {
    setLoading(true);
    const [staffData, customerData] = await Promise.all([
      getAllStaffMembers(),
      getAllCustomers(),
    ]);
    setStaff(staffData);
    setCustomers(customerData);
    setLoading(false);
  };

  useEffect(() => {
    loadRosterData();
  }, []);

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error("Please select a customer to promote");
      return;
    }

    setSubmittingPromotion(true);
    const { success, error } = await updateCustomerRole(selectedCustomerId, selectedRole);
    setSubmittingPromotion(false);

    if (success) {
      toast.success("User promoted successfully", {
        description: `Role updated to ${selectedRole} in database.`
      });
      setSelectedCustomerId("");
      loadRosterData(); // refresh list
    } else {
      toast.error(error || "Failed to promote user");
    }
  };

  const handleDemote = async (id: string, name: string) => {
    const confirm = window.confirm(`Are you sure you want to demote ${name} back to a regular customer?`);
    if (!confirm) return;

    toast.loading("Demoting staff member...");
    const { success, error } = await updateCustomerRole(id, "customer");
    toast.dismiss();

    if (success) {
      toast.success("Member demoted successfully");
      loadRosterData(); // refresh list
    } else {
      toast.error(error || "Failed to demote member");
    }
  };

  const handleToggleRole = async (id: string, currentRole: string) => {
    const nextRole = currentRole === "admin" ? "staff" : "admin";
    
    const { success, error } = await updateCustomerRole(id, nextRole);

    if (success) {
      toast.success(`Role toggled to ${nextRole}`);
      loadRosterData(); // refresh list
    } else {
      toast.error(error || "Failed to update role");
    }
  };

  const numAdmins = staff.filter((s) => s.role === "admin").length;
  const numStaff = staff.filter((s) => s.role === "staff").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Staff Team Management</h1>
        <p className="text-sm text-gray-500 font-light mt-0.5">
          View team rosters and assign administrative privileges
        </p>
      </div>

      {/* Roster stats row */}
      <div className="grid sm:grid-cols-3 gap-4">
        
        <Card className="border-gray-100 shadow-xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0 border border-orange-100/50 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-tight">{staff.length}</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Total Members</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shrink-0 border border-rose-100/50 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-tight">{numAdmins}</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Admins</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0 border border-blue-100/50 shadow-inner">
              <UserGear className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-tight">{numStaff}</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Staff Officers</p>
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Staff roster list */}
        <div className="lg:col-span-8">
          <Card className="border-gray-100 shadow-sm rounded-3xl bg-white overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <CircleNotch className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
              ) : staff.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-semibold">Empty Staff Roster</p>
                  <p className="text-xs text-gray-400 font-light mt-1">Promote registered customer accounts to populate roster.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-900 text-white text-[10px] uppercase font-bold tracking-wider border-b border-gray-800">
                        <th className="py-4 px-5">Staff Member</th>
                        <th className="py-4 px-4">Contact Phone</th>
                        <th className="py-4 px-4 text-center">Privileges</th>
                        <th className="py-4 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map((member) => (
                        <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-orange-500/10 border border-orange-500/20 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                                {member.full_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-extrabold text-gray-950 leading-tight">{member.full_name}</p>
                                <p className="text-[10px] text-gray-400 font-mono tracking-wider mt-0.5 uppercase">ID: {member.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          
                          <td className="py-4 px-4">
                            {member.phone ? (
                              <a href={`tel:${member.phone}`} className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition-colors">
                                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="font-medium text-xs">{member.phone}</span>
                              </a>
                            ) : (
                              <span className="text-gray-400 italic text-xs">No Phone</span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleToggleRole(member.id, member.role)}
                              title="Click to toggle role"
                              className="focus:outline-none"
                            >
                              <Badge variant={member.role === "admin" ? "danger" : "info"} className="scale-95 cursor-pointer uppercase hover:opacity-90">
                                {member.role}
                              </Badge>
                            </button>
                          </td>

                          <td className="py-4 px-5 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDemote(member.id, member.full_name)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl h-8 text-xs font-semibold px-2.5"
                            >
                              <Trash className="w-3.5 h-3.5" />
                              Demote
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Promotion console form */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <Card className="border-gray-100 shadow-md rounded-3xl bg-white overflow-hidden">
            <div className="bg-gray-950 text-white p-5">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="w-4.5 h-4.5 text-orange-500 shrink-0" />
                Assign Role Panel
              </h3>
            </div>
            
            <CardContent className="p-6">
              <form onSubmit={handlePromote} className="space-y-5">
                
                <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-2xl flex gap-2.5 text-xs text-blue-650 leading-relaxed font-light">
                  <UserGear className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p>
                    Select any registered customer and assign them a staff or administrator role. They will instantly gain backend access privileges.
                  </p>
                </div>

                {/* Customer dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Customer</label>
                  {customers.length === 0 ? (
                    <div className="p-3 bg-gray-50 border border-gray-150 text-gray-400 text-xs rounded-xl font-light">
                      No customer accounts available
                    </div>
                  ) : (
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700 font-semibold"
                    >
                      <option value="">-- Choose Account --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.full_name} {c.phone ? `(${c.phone})` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Role select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assign System Privilege</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("staff")}
                      className={`p-3 border rounded-xl font-bold text-xs uppercase tracking-wider text-center transition-all ${
                        selectedRole === "staff"
                          ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                          : "bg-white border-gray-150 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Staff Role
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("admin")}
                      className={`p-3 border rounded-xl font-bold text-xs uppercase tracking-wider text-center transition-all ${
                        selectedRole === "admin"
                          ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                          : "bg-white border-gray-150 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Admin Role
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={submittingPromotion || !selectedCustomerId}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-10 text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/15 flex items-center justify-center gap-1.5"
                >
                  {submittingPromotion ? (
                    <>
                      <CircleNotch className="w-4 h-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4.5 h-4.5" />
                      Grant Privileges
                    </>
                  )}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
