"use client";

import { Warning, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { Branch } from "@/lib/actions/branches";

interface DeleteBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch | null;
  onConfirm: () => void;
}

export function DeleteBranchDialog({ open, onOpenChange, branch, onConfirm }: DeleteBranchDialogProps) {
  if (!open || !branch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <Warning className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Delete Branch</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{branch.name}</span>?
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              This will deactivate the branch. It won't be available for new bookings, but existing booking records will be preserved.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onConfirm}
          >
            Delete Branch
          </Button>
        </div>
      </div>
    </div>
  );
}
