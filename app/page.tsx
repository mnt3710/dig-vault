"use client";

import Link from "next/link";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { t } from "@/lib/i18n";

export default function Home() {
  const { lang } = useLanguage();

  const modes = [
    {
      href: "/dig",
      title: t(lang, "navDigMode"),
      description: t(lang, "homeDigDesc"),
    },
    {
      href: "/closet",
      title: t(lang, "navClosetMode"),
      description: t(lang, "homeClosetDesc"),
    },
    {
      href: "/login",
      title: t(lang, "navLogin"),
      description: t(lang, "homeLoginDesc"),
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-widest text-zinc-500">{t(lang, "homeTagline")}</p>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          {t(lang, "homeHeading")}
        </h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {modes.map((mode) => (
          <Link
            key={mode.href}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            href={mode.href}
          >
            <h2 className="text-lg font-semibold dark:text-white">{mode.title}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{mode.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
