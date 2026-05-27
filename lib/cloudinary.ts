/**
 * Cloudinary utilities
 *
 * Upload preset "car_rental_vehicles" must be created in your Cloudinary dashboard:
 *   Dashboard → Settings → Upload → Upload presets → Add upload preset
 *   - Preset name: car_rental_vehicles
 *   - Signing mode: Unsigned  (for direct browser uploads)
 *   - Folder structure:
 *     • car-rental/vehicles - Vehicle images
 *     • car-rental/profile - User profile/avatar images
 *   - Transformations: quality=auto, format=auto
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "car_rental_vehicles";

export type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

/**
 * Upload a file directly from the browser using an unsigned upload preset.
 * Returns the Cloudinary result or throws on failure.
 */
export async function uploadToCloudinary(
  file: File,
  folder = "car-rental/vehicles"
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ??
        "Cloudinary upload failed"
    );
  }

  return res.json() as Promise<CloudinaryUploadResult>;
}

/**
 * Delete an image via our server-side API route (requires API secret).
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public_id: publicId }),
  });
}

// ─── URL helpers ─────────────────────────────────────────────────────────────

/**
 * Build an optimised Cloudinary URL from a public_id.
 * Falls back to the raw URL if it's already a full URL.
 */
export function cloudinaryUrl(
  publicIdOrUrl: string,
  options: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale" | "thumb";
    quality?: "auto" | number;
    format?: "auto" | "webp" | "jpg";
  } = {}
): string {
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;

  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto",
  } = options;

  const transforms = [
    width ? `w_${width}` : null,
    height ? `h_${height}` : null,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`,
  ]
    .filter(Boolean)
    .join(",");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicIdOrUrl}`;
}

/** Thumbnail — 400×300 */
export const thumbnailUrl = (id: string) =>
  cloudinaryUrl(id, { width: 400, height: 300, crop: "fill" });

/** Card image — 800×500 */
export const cardUrl = (id: string) =>
  cloudinaryUrl(id, { width: 800, height: 500, crop: "fill" });

/** Full-size — 1200×800 */
export const fullUrl = (id: string) =>
  cloudinaryUrl(id, { width: 1200, height: 800, crop: "fill" });
