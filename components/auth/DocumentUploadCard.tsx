"use client";

import Image from "next/image";
import { UploadSimple, X, CheckCircle } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DocumentUploadCardProps {
  preview: string | null;
  onUpload: (file: File | null) => void;
  onRemove: () => void;
  label: string;
  altText: string;
}

export function DocumentUploadCard({
  preview,
  onUpload,
  onRemove,
  label,
  altText,
}: DocumentUploadCardProps) {
  return (
    <Card className="border-2 border-dashed border-gray-200 hover:border-primary transition-colors overflow-hidden">
      <CardContent className="p-0">
        {preview ? (
          <div className="relative aspect-[3/2] group">
            <Image
              src={preview}
              alt={altText}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={onRemove}
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
            <span className="text-xs text-gray-500 font-medium">{label}</span>
            <span className="text-xs text-gray-400 mt-1">Click to upload</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                onUpload(file);
              }}
            />
          </label>
        )}
      </CardContent>
    </Card>
  );
}
