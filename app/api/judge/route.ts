import { judgeImageWithGemini } from "@/lib/gemini";
import { NextResponse } from "next/server";

interface JudgeRequest {
  imageDataUrl?: string;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function getBase64PayloadSize(base64Data: string): number {
  const sanitized = base64Data.replace(/\s/g, "");
  const paddingLength = sanitized.endsWith("==") ? 2 : sanitized.endsWith("=") ? 1 : 0;
  return Math.floor((sanitized.length * 3) / 4) - paddingLength;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as JudgeRequest;

    if (!body.imageDataUrl || !body.imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "imageDataUrl must be a valid base64 data URL" },
        { status: 400 },
      );
    }

    const [, base64Data = ""] = body.imageDataUrl.split(",", 2);
    if (!base64Data || getBase64PayloadSize(base64Data) > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image must be provided and be 5MB or smaller" },
        { status: 400 },
      );
    }

    const result = await judgeImageWithGemini(body.imageDataUrl);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
