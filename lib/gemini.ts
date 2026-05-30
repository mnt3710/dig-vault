import { JUDGMENT_VALUES, type ItemDetails, type JudgeResult, type SearchLink } from "@/types";
import type { Language } from "@/lib/i18n";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
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

function parseGeminiText(text: string): JudgeResult {
  // Strip markdown code fences that Gemini 2.x wraps around JSON
  const stripped = text.trim().replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "").trim();

  try {
    const parsed = JSON.parse(stripped) as Partial<JudgeResult>;
    if (parsed.judgment && parsed.reason) {
      return {
        judgment: normalizeJudgment(parsed.judgment),
        reason: parsed.reason,
        condition: parsed.condition,
        tags: parsed.tags,
        confidence: typeof parsed.confidence === "number" ? Math.min(1, Math.max(0, parsed.confidence)) : undefined,
        confidenceNote: parsed.confidenceNote,
        marketPrice: parsed.marketPrice,
        soldTrend: parsed.soldTrend,
        photoTips: parsed.photoTips,
        searchLinks: Array.isArray(parsed.searchLinks) ? parsed.searchLinks as SearchLink[] : undefined,
      };
    }
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
    reason: stripped || "Gemini did not provide a detailed reason.",
    confidence: 0,
    confidenceNote: "Could not parse structured response from Gemini.",
  };
}

function parseItemDetails(text: string): ItemDetails {
  const stripped = text.trim().replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "").trim();
  try {
    const parsed = JSON.parse(stripped) as Partial<ItemDetails>;
    return {
      brand: parsed.brand ?? "不明",
      itemType: parsed.itemType ?? "",
      color: parsed.color ?? "",
      era: parsed.era,
      storePrice: parsed.storePrice,
      estimatedPrice: parsed.estimatedPrice ?? "",
      condition: parsed.condition ?? "Fair",
      searchKeywords: parsed.searchKeywords ?? "",
    };
  } catch {
    return { brand: "不明", itemType: "", color: "", estimatedPrice: "", condition: "Fair", searchKeywords: "" };
  }
}

function computeActualPrice(storePrice?: string, discountRate?: number): string {
  if (!storePrice || !discountRate) return "";
  const num = parseFloat(storePrice.replace(/[^\d.]/g, ""));
  if (isNaN(num)) return storePrice;
  const actual = Math.round(num * (1 - discountRate / 100));
  return `¥${actual.toLocaleString()}`;
}

function buildExtractPrompt(lang: Language): string {
  const replyLang = lang === "ja"
    ? "Reply in Japanese. All text fields must be written in Japanese except brand names."
    : "Reply in English.";

  return `
You are a fashion expert. Analyze the provided thrift store item image(s) and extract structured information.
${replyLang}

Return ONLY a valid JSON object (no markdown, no code fences) with these keys:
- brand: brand name if visible on tags/logo, otherwise "不明" (ja) or "Unknown" (en)
- itemType: type of clothing (e.g. "デニムジャケット", "ニットセーター", "Denim Jacket")
- color: main color(s) of the item
- era: estimated decade/era if identifiable (e.g. "90年代", "2000s"), omit if unclear
- storePrice: the price shown on the store's price tag if clearly visible in any photo (e.g. "¥1,980"). Omit this field entirely if no price tag is visible.
- estimatedPrice: estimated resale price range on Mercari (e.g. "¥2,000〜¥4,000")
- condition: one of "Good", "Fair", "Poor" based on visible wear
- searchKeywords: best search query string for finding this item on Mercari/Rakuma (e.g. "Levi's 501 デニム ヴィンテージ")
`.trim();
}

function buildPrompt(lang: Language, imageCount: number = 1, itemDetails?: ItemDetails): string {
  const replyLang = lang === "ja"
    ? "Reply in Japanese. All text fields (reason, condition, confidenceNote, soldTrend, photoTips) must be written in Japanese."
    : "Reply in English.";

  const detailsSection = itemDetails
    ? `
The user has confirmed the following item details — use these as ground truth for your search and judgment:
- Brand: ${itemDetails.brand}
- Item type: ${itemDetails.itemType}
- Color: ${itemDetails.color}${itemDetails.era ? `\n- Era: ${itemDetails.era}` : ""}
- Condition: ${itemDetails.condition}${itemDetails.storePrice ? `\n- Store price tag: ${itemDetails.storePrice}` : ""}${(itemDetails.discountRate ?? 0) > 0 ? `\n- Discount: ${itemDetails.discountRate}% off (actual purchase price: ${computeActualPrice(itemDetails.storePrice, itemDetails.discountRate)})` : ""}
- Search keywords: ${itemDetails.searchKeywords}
`
    : "";

  const linksInstruction = itemDetails
    ? `- searchLinks: array of up to 5 relevant links found via Google Search. Each item: { "label": string, "url": string }.
  Include: sold/active Mercari listings, Rakuma listings, ZOZOUSED listings, and if available the official brand product page or a new retail listing.
  Use the confirmed item details above to construct precise search queries.`
    : `- searchLinks: omit this field`;

  return `
You are Dig Vault, an expert thrift store item evaluator.
Analyze the provided image(s) and use Google Search to find current market prices for this item on Japanese resale platforms (especially Mercari).
${replyLang}
${detailsSection}
Return ONLY a valid JSON object with the following keys (no markdown, no code fences):

- judgment: one of GRAB / BUY / HOLD / PASS / TRY
  - GRAB = rare find, buy immediately
  - BUY  = good value, worth buying
  - HOLD = uncertain, depends on price
  - PASS = not worth it
  - TRY  = try on first
- reason: concise explanation of judgment (1-2 sentences)
- condition: item condition — "Good", "Fair", or "Poor"
- tags: array of 2-5 descriptive tags (e.g. ["vintage", "denim", "90s"])
- confidence: float 0.0-1.0 — how confident you are that you have correctly identified the SPECIFIC product (brand, model, era, etc.)
  - 1.0 = brand tag clearly visible, distinctive design, can pinpoint exact product
  - 0.7-0.9 = likely identifiable but missing some details (e.g. no tag but distinctive branding)
  - 0.4-0.6 = generic-looking item with many similar products, brand unknown
  - 0.0-0.3 = could be any brand, very common silhouette, impossible to distinguish from competitors
  - Important: image sharpness alone does NOT raise confidence. A clear photo of an unbranded basic tee should still score low.
  - Multiple angles help: with ${imageCount} image(s) provided, the maximum achievable confidence is ${imageCount === 1 ? '0.6' : imageCount === 2 ? '0.75' : imageCount <= 4 ? '0.9' : '1.0'} unless the brand/model is definitively visible. Ideal set: front, back, brand tag, material tag, care label, price tag. Up to 8 images accepted for additional details.
- confidenceNote: if confidence < 0.7, explain specifically what information is missing that prevented confident identification (e.g. "Brand tag not visible and this silhouette is shared by hundreds of brands"). Otherwise omit or set to null.
- marketPrice: price range found on Mercari/resale search (e.g. "¥2,500〜¥5,000"). Include both sold listings and active listings if available.
- soldTrend: brief note on how quickly similar items sell (e.g. "Sells within a few days at this price range")
- photoTips: array of 1-3 specific tips to improve photo quality for better judgment accuracy (e.g. ["Show the brand tag clearly", "Use natural lighting", "Include a close-up of the material texture"])
${linksInstruction}
`.trim();
}

export async function extractItemDetails(imageDataUrls: string[], lang: Language = "en"): Promise<ItemDetails> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const imageParts = buildImageParts(imageDataUrls);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildExtractPrompt(lang) }, ...imageParts] }],
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini extract failed: ${response.status} ${errorText}`);
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = payload.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
  if (!text) throw new Error("Gemini response did not contain text output");
  return parseItemDetails(text);
}

function buildImageParts(urls: string[]): Array<{ inlineData: { mimeType: string; data: string } }> {
  return urls.map((imageDataUrl) => {
    const [prefix, data = ""] = imageDataUrl.split(",", 2);
    const mimeType = prefix.match(/^data:(image\/[^;]+);base64$/)?.[1];
    if (!data || !mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new Error("Invalid image data URL format");
    }
    return { inlineData: { mimeType, data } };
  });
}

export async function judgeImageWithGemini(imageDataUrls: string | string[], lang: Language = "en", itemDetails?: ItemDetails): Promise<JudgeResult> {
  const urls = Array.isArray(imageDataUrls) ? imageDataUrls : [imageDataUrls];
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const imageParts = buildImageParts(urls);

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
              { text: buildPrompt(lang, urls.length, itemDetails) },
              ...imageParts,
            ],
          },
        ],
        tools: [{ googleSearch: {} }],
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
