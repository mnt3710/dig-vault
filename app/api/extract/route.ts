import { getBase64PayloadSize } from "@/lib/base64";
import { extractItemDetails } from "@/lib/gemini";
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGES } from "@/lib/constants";
import { NextResponse } from "next/server";
import type { Language } from "@/lib/i18n";

interface ExtractRequest {
  imageDataUrls?: string[];
  lang?: Language;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExtractRequest;
    const urls = body.imageDataUrls ?? [];

    if (urls.length === 0) {
      return NextResponse.json({ error: "At least one imageDataUrl is required" }, { status: 400 });
    }

    if (urls.length > MAX_IMAGES) {
      return NextResponse.json({ error: `Maximum ${MAX_IMAGES} images allowed` }, { status: 400 });
    }

    for (const url of urls) {
      if (!url.startsWith("data:image/")) {
        return NextResponse.json({ error: "All imageDataUrls must be valid base64 data URLs" }, { status: 400 });
      }
      const [, base64Data = ""] = url.split(",", 2);
      if (!base64Data || getBase64PayloadSize(base64Data) > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json({ error: "Each image must be 5MB or smaller" }, { status: 400 });
      }
    }

    const result = await extractItemDetails(urls, body.lang ?? "en");
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
