"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "tr" : "en")}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
      title={language === "en" ? "Switch to Turkish" : "İngilizceye geç"}
    >
      {language === "en" ? "TR" : "EN"}
    </button>
  );
}
