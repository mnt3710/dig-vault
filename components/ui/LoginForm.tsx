"use client";

import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { t } from "@/lib/i18n";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const { lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus("");

    try {
      if (!auth) {
        throw new Error(t(lang, "loginErrorFirebase"));
      }
      await signInWithEmailAndPassword(auth, email, password);
      setStatus(t(lang, "loginSuccess"));
    } catch (error) {
      const message = error instanceof Error ? error.message : t(lang, "loginErrorGeneric");
      setStatus(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      onSubmit={onSubmit}
    >
      <h1 className="text-xl font-semibold dark:text-white">{t(lang, "loginHeading")}</h1>
      <input
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        onChange={(event) => setEmail(event.target.value)}
        placeholder={t(lang, "loginEmailPlaceholder")}
        required
        type="email"
        value={email}
      />
      <input
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        onChange={(event) => setPassword(event.target.value)}
        placeholder={t(lang, "loginPasswordPlaceholder")}
        required
        type="password"
        value={password}
      />
      <button
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:disabled:bg-zinc-700"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? t(lang, "loginSubmitLoading") : t(lang, "loginSubmit")}
      </button>
      {status ? <p className="text-sm text-zinc-600 dark:text-zinc-400">{status}</p> : null}
    </form>
  );
}
