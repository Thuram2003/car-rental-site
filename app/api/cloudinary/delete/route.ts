import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * POST /api/cloudinary/delete
 * Body: { public_id: string }
 *
 * Signs the deletion request server-side so the API secret never reaches the browser.
 */
export async function POST(req: NextRequest) {
  const { public_id } = (await req.json()) as { public_id: string };

  if (!public_id) {
    return NextResponse.json({ error: "public_id is required" }, { status: 400 });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const timestamp = Math.floor(Date.now() / 1000);

  // Build the signature string — must be sorted alphabetically
  const signaturePayload = `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto
    .createHash("sha256")
    .update(signaturePayload)
    .digest("hex");

  const formData = new URLSearchParams({
    public_id,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
  });

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.ok ? 200 : 500 });
}
