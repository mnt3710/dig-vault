import { JUDGMENT_VALUES, type JudgeResult } from "@/types";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
// Keep this allowlist in sync with client/server upload validation to avoid unsupported formats.
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

type JsonObject = Record<string, unknown>;

function normalizeJudgment(value: string): JudgeResult["judgment"] {
  const upper = value.trim().toUpperCase();
  return JUDGMENT_VALUES.find((judgment) => judgment === upper) ?? "HOLD";
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

function parseJsonObject(text: string): JsonObject | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    return isJsonObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function extractFirstJsonObject(text: string): string | null {
  let startIndex = -1;
  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (char === "\\") {
        isEscaped = true;
        continue;
      }

      if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        startIndex = index;
      }
      depth += 1;
      continue;
    }

    if (char === "}" && depth > 0) {
      depth -= 1;

      if (depth === 0 && startIndex >= 0) {
        return text.slice(startIndex, index + 1);
      }
    }
  }

  return null;
}

function getParsedJudgePayload(text: string): JsonObject | null {
  const trimmed = text.trim();
  const codeFenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidates = [
    trimmed,
    codeFenceMatch?.[1]?.trim() ?? null,
    extractFirstJsonObject(trimmed),
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const parsed = parseJsonObject(candidate);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function parseGeminiText(text: string): JudgeResult {
  const parsed = getParsedJudgePayload(text);
  const judgmentValue = parsed?.judgment;
  const reasonValue = parsed?.reason;

  if (typeof judgmentValue === "string" && typeof reasonValue === "string" && reasonValue.trim()) {
    return {
      judgment: normalizeJudgment(judgmentValue),
      reason: reasonValue.trim(),
    };
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
