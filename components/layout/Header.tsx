"use client";

import Link from "next/link";
import TimoLogo from "@/components/ui/TimoLogo";
import { useLanguage, type Language } from "@/components/layout/LanguageProvider";
import { useTheme } from "@/components/layout/ThemeProvider";
import { t } from "@/lib/i18n";

export default function Header() {
  const { theme, toggle } = useTheme();
  const { lang, setLang } = useLanguage();

  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4">

        {/* Left — logo (tall) + text column */}
        <div className="flex items-center gap-2">
          <TimoLogo size={60} className="text-zinc-700 dark:text-zinc-200 shrink-0" />
          <div className="flex flex-col justify-center leading-tight">
            <span className="text-[10px] font-light tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
              {t(lang, "presentedBy")}
            </span>
            <span className="text-sm font-semibold tracking-wide text-zinc-700 dark:text-zinc-200">
              TiMo
            </span>
          </div>
        </div>

        {/* Center — DIG VAULT title (links to home) */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-xl font-black tracking-[0.25em] text-zinc-900 uppercase dark:text-white select-none hover:opacity-70 transition-opacity"
        >
          DIG VAULT
        </Link>

        {/* Right — theme toggle + language selector */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            aria-label={isDark ? t(lang, "lightMode") : t(lang, "darkMode")}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
            style={{ backgroundColor: isDark ? "#6366f1" : "#d4d4d8" }}
          >
            <span
              className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200"
              style={{ transform: isDark ? "translateX(1.375rem)" : "translateX(0.25rem)" }}
            />
            <span className="sr-only">{isDark ? t(lang, "lightMode") : t(lang, "darkMode")}</span>
          </button>
          <span className="text-xs select-none text-zinc-400 dark:text-zinc-500" aria-hidden>
            {isDark ? "🌙" : "☀️"}
          </span>

          {/* Language selector */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Language)}
            aria-label="Select language"
            className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-500"
          >
            <option value="en">EN</option>
            <option value="ja">JP</option>
          </select>
        </div>
      </div>
    </header>
  );
}
