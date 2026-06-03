"use client";

import { useState, useEffect } from "react";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createBranch, updateBranch, type Branch } from "@/lib/actions/branches";

interface BranchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch | null;
  onSuccess: () => void;
}

export function BranchFormDialog({ open, onOpenChange, branch, onSuccess }: BranchFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    is_active: true,
  });

  useEffect(() => {
    if (branch) {
      setForm({
        name: branch.name,
        address: branch.address,
        city: branch.city,
        phone: branch.phone || "",
        email: branch.email || "",
        is_active: branch.is_active,
      });
    } else {
      setForm({
        name: "",
        address: "",
        city: "",
        phone: "",
        email: "",
        is_active: true,
      });
    }
  }, [branch, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { success, error } = branch
      ? await updateBranch(branch.id, form)
      : await createBranch(form);

    setLoading(false);

    if (success) {
      toast.success(branch ? "Branch updated successfully" : "Branch created successfully");
      onSuccess();
      onOpenChange(false);
    } else {
      toast.error(error || "Failed to save branch");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {branch ? "Edit Branch" : "Add New Branch"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <Label htmlFor="name">Branch Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Douala Branch"
              required
            />
          </div>

          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g., Douala"
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="e.g., Akwa, Rue Joffre"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+237 233 42 56 78"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="branch@carrental.cm"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <Label htmlFor="is_active" className="font-medium">Active Status</Label>
              <p className="text-sm text-gray-500 mt-1">
                Inactive branches won't appear in booking options
              </p>
            </div>
            <Switch
              id="is_active"
              checked={form.is_active}
              onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : branch ? "Update Branch" : "Create Branch"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
