"use client";

import { StoreMap } from "@/components/ui/StoreMap";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { t } from "@/lib/i18n";

export function ClosetOverview() {
  const { lang } = useLanguage();

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-xl font-semibold dark:text-white">{t(lang, "closetSectionHeading")}</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {t(lang, "closetDescription")}
      </p>
      <StoreMap />
    </section>
  );
}
