import { judgeImageWithGemini } from "@/lib/gemini";
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

    const result = await judgeImageWithGemini(body.imageDataUrl);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
