import { getBase64PayloadSize } from "@/lib/base64";
import { judgeImageWithGemini } from "@/lib/gemini";
import { MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";
import { NextResponse } from "next/server";

interface JudgeRequest {
  imageDataUrl?: string;
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
