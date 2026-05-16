import { JUDGMENT_VALUES, type JudgeResult } from "@/types";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

interface GeminiCandidate {
  content?: {
    parts?: Array<{
      text?: string;
    }>;
  };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

function normalizeJudgment(value: string): JudgeResult["judgment"] {
  const upper = value.trim().toUpperCase();
  return JUDGMENT_VALUES.find((judgment) => judgment === upper) ?? "HOLD";
}

function parseGeminiText(text: string): JudgeResult {
  try {
    const parsed = JSON.parse(text) as Partial<JudgeResult>;
    if (parsed.judgment && parsed.reason) {
      return {
        judgment: normalizeJudgment(parsed.judgment),
        reason: parsed.reason,
      };
    }
  } catch {
    // Fallback below
  }

  return {
    judgment: "HOLD",
    reason: text.trim() || "Gemini did not provide a detailed reason.",
  };
}

export async function judgeImageWithGemini(imageDataUrl: string): Promise<JudgeResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const [prefix, data = ""] = imageDataUrl.split(",", 2);
  const mimeType = prefix.match(/^data:(image\/[^;]+);base64$/)?.[1];

  if (!data || !mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error("Invalid image data URL format");
  }

  const prompt = [
    "You are Dig Vault, a thrift store item evaluator.",
    "Return strict JSON with keys: judgment, reason.",
    "judgment must be one of: GRAB, BUY, HOLD, PASS, TRY.",
    "reason should be concise and actionable.",
  ].join(" ");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
              {
                inlineData: {
                  mimeType,
                  data,
                },
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const payload = (await response.json()) as GeminiResponse;
  const firstCandidate = payload.candidates?.[0];
  const parts = firstCandidate?.content?.parts ?? [];
  const textPart = parts.find((part) => part.text);
  const text = textPart?.text;

  if (!text) {
    throw new Error("Gemini response did not contain text output");
  }

  return parseGeminiText(text);
}
