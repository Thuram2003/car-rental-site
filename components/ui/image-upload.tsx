"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadSimple, X, Spinner, ImageBroken } from "@phosphor-icons/react";
import { uploadToCloudinary, deleteFromCloudinary, type CloudinaryUploadResult } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | null;          // current image URL or public_id
  publicId?: string | null;       // cloudinary public_id for deletion
  onChange: (result: CloudinaryUploadResult | null) => void;
  className?: string;
  aspectRatio?: "video" | "square" | "auto";
  placeholder?: string;
  disabled?: boolean;
  folder?: string;                // target Cloudinary folder name
}

export function ImageUpload({
  value,
  publicId,
  onChange,
  className,
  aspectRatio = "video",
  placeholder = "Click or drag to upload an image",
  disabled = false,
  folder,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClass = {
    video: "aspect-video",
    square: "aspect-square",
    auto: "",
  }[aspectRatio];

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const result = await uploadToCloudinary(file, folder);
      onChange(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (publicId) {
      await deleteFromCloudinary(publicId).catch(() => {});
    }
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative w-full rounded-xl border-2 border-dashed transition-colors overflow-hidden",
          aspectClass,
          value
            ? "border-transparent"
            : "border-gray-200 hover:border-orange-400 bg-gray-50 cursor-pointer",
          disabled && "opacity-50 pointer-events-none"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !value && inputRef.current?.click()}
      >
        {/* Uploaded image */}
        {value && (
          <>
            <Image
              src={value}
              alt="Uploaded vehicle"
              fill
              className="object-cover"
              unoptimized
            />
            {/* Overlay controls */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-3 group">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-800 rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 hover:bg-gray-100"
              >
                <UploadSimple className="w-3.5 h-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 hover:bg-red-600"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </>
        )}

        {/* Upload state */}
        {!value && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
            {uploading ? (
              <>
                <Spinner className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-sm text-gray-500">Uploading...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <UploadSimple className="w-6 h-6 text-orange-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">{placeholder}</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10 MB</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Uploading overlay on existing image */}
        {value && uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Spinner className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <ImageBroken className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
