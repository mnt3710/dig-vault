"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "ja";

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem("dv-lang") as Language | null;
    if (stored === "en" || stored === "ja") {
      setLangState(stored);
    }
  }, []);

  function setLang(l: Language) {
    setLangState(l);
    localStorage.setItem("dv-lang", l);
  }

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}
