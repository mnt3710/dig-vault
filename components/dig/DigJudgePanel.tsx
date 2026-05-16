"use client";

import { JUDGMENT_VALUES, type JudgeResult } from "@/types";
import Image from "next/image";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

const badgeColorMap: Record<JudgeResult["judgment"], string> = {
  GRAB: "bg-emerald-600",
  BUY: "bg-sky-600",
  HOLD: "bg-amber-600",
  PASS: "bg-zinc-700",
  TRY: "bg-violet-600",
};
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function DigJudgePanel() {
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<JudgeResult | null>(null);

  const canSubmit = useMemo(() => imageDataUrl.length > 0 && !isLoading, [imageDataUrl, isLoading]);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageDataUrl("");
      setResult(null);
      setError("Please upload an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageDataUrl(reader.result);
        setResult(null);
        setError("");
      }
    };

    reader.onerror = () => {
      setError("Failed to read the selected image.");
    };

    reader.readAsDataURL(file);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/judge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageDataUrl }),
      });

      const payload = (await response.json()) as JudgeResult | { error?: string };

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Judgment request failed");
      }

      setResult(payload as JudgeResult);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Request failed";
      setError(message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Dig Judgment</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Upload a thrift item photo to get one of: {JUDGMENT_VALUES.join(" / ")}.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm font-medium text-zinc-700" htmlFor="item-image">
          Item image
        </label>
        <input
          id="item-image"
          accept="image/*"
          className="block w-full cursor-pointer rounded-lg border border-zinc-300 p-3 text-sm"
          onChange={onFileChange}
          type="file"
        />

        {imageDataUrl ? (
          <Image
            alt="Item preview"
            className="max-h-72 w-full rounded-lg border border-zinc-200 object-contain"
            src={imageDataUrl}
            unoptimized
            width={1200}
            height={800}
          />
        ) : null}

        <button
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
          disabled={!canSubmit}
          type="submit"
        >
          {isLoading ? "Judging..." : "Judge this item"}
        </button>
      </form>

      {error ? <p className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">{error}</p> : null}

      {result ? (
        <article className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm text-zinc-500">Gemini verdict</p>
          <p className="mt-2 inline-flex text-sm font-semibold text-white">
            <span className={`rounded-full px-3 py-1 ${badgeColorMap[result.judgment]}`}>{result.judgment}</span>
          </p>
          <p className="mt-3 text-sm text-zinc-700">{result.reason}</p>
        </article>
      ) : null}
    </section>
  );
}
