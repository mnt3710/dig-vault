"use client";

import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGES } from "@/lib/constants";
import { JUDGMENT_VALUES, type JudgeResult } from "@/types";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { t } from "@/lib/i18n";
import Image from "next/image";
import type { ItemDetails, JudgeMode } from "@/types";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";

const badgeColorMap: Record<JudgeResult["judgment"], string> = {
  GRAB: "bg-emerald-600",
  BUY: "bg-sky-600",
  HOLD: "bg-amber-600",
  PASS: "bg-zinc-700",
  TRY: "bg-violet-600",
};

        <span className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
          <span className="mb-1 block font-bold">{def.label}</span>
          {def.desc}
        </span>
      )}
    </span>
  );
}
export function DigJudgePanel() {
  const { lang } = useLanguage();
  const [mode, setMode] = useState<JudgeMode>("simple");
  const [imageDataUrls, setImageDataUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<JudgeResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detail mode state
  const [detailStep, setDetailStep] = useState<"upload" | "review" | "result">("upload");
  const [itemDetails, setItemDetails] = useState<ItemDetails | null>(null);

  const canSubmit = useMemo(() => imageDataUrls.length > 0 && !isLoading, [imageDataUrls, isLoading]);
  const canAddMore = imageDataUrls.length < MAX_IMAGES;

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_IMAGES - imageDataUrls.length;
    const toProcess = Array.from(files).slice(0, remaining);
    for (const file of toProcess) {
      if (file.size > MAX_IMAGE_SIZE_BYTES) { setError(t(lang, "digErrorImageSize")); continue; }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImageDataUrls((prev: string[]) => prev.length >= MAX_IMAGES ? prev : [...prev, reader.result as string]);
          setResult(null);
          setError("");
        }
      };
      reader.onerror = () => setError(t(lang, "digErrorImageRead"));
      reader.readAsDataURL(file);
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    setImageDataUrls((prev: string[]) => prev.filter((_: string, i: number) => i !== index));
    setResult(null);
  };

  // Simple mode: judge directly
  const onSimpleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrls, lang }),
      });
      const payload = (await response.json()) as JudgeResult | { error?: string };
      if (!response.ok) throw new Error("error" in payload ? payload.error : t(lang, "digErrorJudge"));
      setResult(payload as JudgeResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(lang, "digErrorGeneric"));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Detail mode step 1: extract item details from images
  const onExtract = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrls, lang }),
      });
      const payload = (await response.json()) as ItemDetails | { error?: string };
      if (!response.ok) throw new Error("error" in payload ? payload.error : t(lang, "digErrorGeneric"));
      setItemDetails(payload as ItemDetails);
      setDetailStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : t(lang, "digErrorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  // Detail mode step 2: judge with user-confirmed item details
  const onDetailJudge = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrls, lang, itemDetails }),
      });
      const payload = (await response.json()) as JudgeResult | { error?: string };
      if (!response.ok) throw new Error("error" in payload ? payload.error : t(lang, "digErrorJudge"));
      setResult(payload as JudgeResult);
      setDetailStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : t(lang, "digErrorGeneric"));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (m: JudgeMode) => {
    setMode(m);
    setDetailStep("upload");
    setItemDetails(null);
    setResult(null);
    setError("");
  };

  // Shared image upload UI (used by both modes)
  const imageUploadArea = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t(lang, "digImageLabel")}
        </span>
        {imageDataUrls.length > 0 && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">{t(lang, "digImageHint")}</span>
        )}
      </div>
      {imageDataUrls.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {imageDataUrls.map((url: string, i: number) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
              <Image alt={`Photo ${i + 1}`} src={url} fill unoptimized className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={t(lang, "digImageRemove")}
              >×</button>
            </div>
          ))}
        </div>
      )}
      {canAddMore && (
        <>
          <input ref={fileInputRef} id="item-image" accept="image/*" multiple className="sr-only" onChange={onFileChange} type="file" />
          <label
            htmlFor="item-image"
            className="inline-block cursor-pointer rounded-lg border border-dashed border-zinc-400 px-4 py-2 text-sm text-zinc-600 hover:border-zinc-600 hover:text-zinc-800 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-400 dark:hover:text-zinc-200"
          >
            {imageDataUrls.length === 0 ? t(lang, "digImageLabel") : t(lang, "digImageAddAnother")}
          </label>
        </>
      )}
    </div>
  );

  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-xl font-semibold dark:text-white">{t(lang, "digSectionHeading")}</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {t(lang, "digDescription")}{" "}
        <span className="inline-flex flex-wrap gap-1">
          {JUDGMENT_VALUES.map((v) => (
            <span key={v} className="inline-flex items-center">
              <span className="font-semibold">{v}</span>
            </span>
          ))}
        </span>
      </p>

      {/* Mode toggle */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {(["simple", "detail"] as JudgeMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === m
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "border border-zinc-300 text-zinc-600 hover:border-zinc-500 dark:border-zinc-600 dark:text-zinc-400"
            }`}
          >
            {t(lang, m === "simple" ? "digModeSimple" : "digModeDetail")}
          </button>
        ))}
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          — {t(lang, mode === "simple" ? "digModeSimpleDesc" : "digModeDetailDesc")}
        </span>
      </div>

      {/* ── Simple mode ── */}
      {mode === "simple" && (
        <form className="mt-5 space-y-4" onSubmit={onSimpleSubmit}>
          {imageUploadArea}
          <button
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
            disabled={!canSubmit}
            type="submit"
          >
            {isLoading ? t(lang, "digSubmitLoading") : t(lang, "digSubmitIdle")}
          </button>
        </form>
      )}

      {/* ── Detail mode ── */}
      {mode === "detail" && (
        <div className="mt-5 space-y-5">
          {/* Step 1: upload photos */}
          <div className="space-y-3">
            {imageUploadArea}
            {detailStep === "upload" && (
              <button
                type="button"
                onClick={onExtract}
                disabled={!canSubmit}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
              >
                {isLoading ? t(lang, "digExtractLoading") : t(lang, "digExtractButton")}
              </button>
            )}
          </div>

          {/* Step 2: review & edit extracted info */}
          {(detailStep === "review" || detailStep === "result") && itemDetails && (
            <form onSubmit={onDetailJudge} className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t(lang, "digReviewHeading")}</p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{t(lang, "digReviewSubtext")}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(
                  [
                    ["digDetailBrand", "brand"],
                    ["digDetailItemType", "itemType"],
                    ["digDetailColor", "color"],
                    ["digDetailEra", "era"],
                    ["digDetailStorePrice", "storePrice"],
                    ["digDetailEstimatedPrice", "estimatedPrice"],
                    ["digDetailCondition", "condition"],
                  ] as const
                ).map(([labelKey, field]) => (
                  <label key={field} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, labelKey)}</span>
                    <input
                      type="text"
                      value={(itemDetails[field] as string) ?? ""}
                      onChange={(e) => setItemDetails((prev: ItemDetails | null) => prev ? { ...prev, [field]: e.target.value } : prev)}
                      className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                  </label>
                ))}
              </div>

              {/* Discount rate */}
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t(lang, "digDetailDiscountRate")}
                  {(itemDetails.discountRate ?? 0) > 0 && (
                    <span className="ml-2 font-semibold text-emerald-600 dark:text-emerald-400">
                      -{itemDetails.discountRate}%
                      {itemDetails.storePrice && (
                        <span className="ml-1 text-zinc-500 dark:text-zinc-400">
                          ({itemDetails.storePrice} →{" "}
                          ¥{Math.round(
                            parseFloat(itemDetails.storePrice.replace(/[^\d.]/g, "")) *
                            (1 - (itemDetails.discountRate ?? 0) / 100)
                          ).toLocaleString()})
                        </span>
                      )}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={90}
                    step={5}
                    value={itemDetails.discountRate ?? 0}
                    onChange={(e) => setItemDetails((prev: ItemDetails | null) => prev ? { ...prev, discountRate: Number(e.target.value) } : prev)}
                    className="w-full accent-zinc-900 dark:accent-zinc-100"
                  />
                  <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-zinc-700 dark:text-zinc-200">
                    {itemDetails.discountRate ?? 0}%
                  </span>
                </div>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "digDetailSearchKeywords")}</span>
                <input
                  type="text"
                  value={itemDetails.searchKeywords}
                  onChange={(e) => setItemDetails((prev: ItemDetails | null) => prev ? { ...prev, searchKeywords: e.target.value } : prev)}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </label>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
              >
                {isLoading ? t(lang, "digSubmitLoading") : t(lang, "digDetailJudgeButton")}
              </button>
            </form>
          )}
        </div>
      )}

      {error ? <p className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">{error}</p> : null}

      {result ? (
        <article className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "digResultLabel")}</p>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              <tr>
                <td className="w-36 py-2 pr-4 font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "digResultVerdict")}</td>
                <td className="py-2">
                  <span className="inline-flex items-center gap-0.5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold text-white ${badgeColorMap[result.judgment]}`}>
                      {result.judgment}
                    </span>
                  </span>
                </td>
              </tr>
              {result.confidence !== undefined ? (
                <tr>
                  <td className="py-2 pr-4 align-top font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "digResultConfidence")}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <div
                          className={`h-2 rounded-full transition-all ${result.confidence >= 0.7 ? "bg-emerald-500" : result.confidence >= 0.4 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${Math.round(result.confidence * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-600 dark:text-zinc-300">{Math.round(result.confidence * 100)}%</span>
                    </div>
                    {result.confidenceNote ? <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{result.confidenceNote}</p> : null}
                  </td>
                </tr>
              ) : null}
              <tr>
                <td className="py-2 pr-4 align-top font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "digResultReason")}</td>
                <td className="py-2 text-zinc-700 dark:text-zinc-200">{result.reason}</td>
              </tr>
              {result.condition ? (
                <tr>
                  <td className="py-2 pr-4 font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "digResultCondition")}</td>
                  <td className="py-2 text-zinc-700 dark:text-zinc-200">{result.condition}</td>
                </tr>
              ) : null}
              {result.marketPrice ? (
                <tr>
                  <td className="py-2 pr-4 font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "digResultMarketPrice")}</td>
                  <td className="py-2 font-semibold text-zinc-800 dark:text-zinc-100">{result.marketPrice}</td>
                </tr>
              ) : null}
              {result.soldTrend ? (
                <tr>
                  <td className="py-2 pr-4 align-top font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "digResultSoldTrend")}</td>
                  <td className="py-2 text-zinc-700 dark:text-zinc-200">{result.soldTrend}</td>
                </tr>
              ) : null}
              {result.tags && result.tags.length > 0 ? (
                <tr>
                  <td className="py-2 pr-4 align-top font-medium text-zinc-500 dark:text-zinc-400">{t(lang, "digResultTags")}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {result.tags.map((tag: string) => (
                        <span key={tag} className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">{tag}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>

          {/* Search links (detail mode only) */}
          {result.searchLinks && result.searchLinks.length > 0 ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">🔗 {t(lang, "digResultSearchLinks")}</p>
              <div className="flex flex-wrap gap-2">
                {result.searchLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-700 hover:border-zinc-500 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-400 dark:hover:bg-zinc-800"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {/* Photo tips */}
          {result.photoTips && result.photoTips.length > 0 ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
              <p className="mb-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                📷 {t(lang, "digResultPhotoTips")}
              </p>
              <ul className="space-y-1">
                {result.photoTips.map((tip: string) => (
                  <li key={tip} className="flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-300">
                    <span className="mt-0.5 shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      ) : null}
    </section>
  );
}
