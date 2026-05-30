"use client";

import { ClosetOverview } from "@/components/closet/ClosetOverview";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { t } from "@/lib/i18n";

export default function ClosetPage() {
  const { lang } = useLanguage();

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold text-zinc-900 dark:text-white">{t(lang, "closetPageHeading")}</h1>
      <ClosetOverview />
    </main>
  );
}
