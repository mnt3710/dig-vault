"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { t, type TranslationKey } from "@/lib/i18n";

// pathname → 表示ラベルの翻訳キーマッピング
const SEGMENT_KEYS: Record<string, TranslationKey> = {
  dig: "navDigMode",
  closet: "navClosetMode",
  login: "navLogin",
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  // ホームは表示しない
  if (pathname === "/") return null;

  // パスを分解して裂け目を作る
  // 例: /closet → ["closet"]
  // 例: /dig    → ["dig"]
  const rawSegments = pathname.split("/").filter(Boolean);

  // (auth) などルートグループを除外
  const segments = rawSegments.filter((s) => !s.startsWith("("));

  type Crumb = { label: string; href: string };

  const crumbs: Crumb[] = [
    { label: t(lang, "breadcrumbHome"), href: "/" },
    ...segments.map((seg, i) => {
      const href = "/" + segments.slice(0, i + 1).join("/");
      const key = SEGMENT_KEYS[seg];
      const label = key ? t(lang, key) : seg.charAt(0).toUpperCase() + seg.slice(1);
      return { label, href };
    }),
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className="w-full border-b border-zinc-100 bg-white/60 backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-950/60"
    >
      <ol className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-1">
              {i > 0 && (
                <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
                  /
                </span>
              )}
              {isLast ? (
                <span className="font-medium text-zinc-800 dark:text-zinc-100" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-zinc-800 hover:underline transition-colors dark:hover:text-zinc-100"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
