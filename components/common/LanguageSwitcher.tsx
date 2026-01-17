"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

type LanguageSwitcherProps = {
  variant?: "light" | "dark";
};

export function LanguageSwitcher({ variant = "dark" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const isLight = variant === "light";

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "tr" : "en")}
      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition ${
        isLight
          ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
      }`}
      title={language === "en" ? "Switch to Turkish" : "İngilizceye geç"}
    >
      {language === "en" ? "TR" : "EN"}
    </button>
  );
}
