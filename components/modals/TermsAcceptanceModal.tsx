"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function TermsAcceptanceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const accepted = localStorage.getItem("marketmind.termsAccepted");
    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("marketmind.termsAccepted", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-[#0A0B10] p-6 shadow-2xl shadow-amber-900/20">
        <div className="mb-6 flex items-center gap-3 text-amber-500">
          <AlertTriangle className="h-8 w-8" />
          <h2 className="text-2xl font-bold">{t.disclaimer.title}</h2>
        </div>

        <div className="mb-8 space-y-4 text-white/90">
          <p className="text-base leading-relaxed">{t.disclaimer.text}</p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-white/70">
            {t.disclaimer.points.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
          <p className="text-sm font-medium text-amber-200/80 border-t border-white/10 pt-4">
            {t.disclaimer.footer}
          </p>
        </div>

        <button
          onClick={handleAccept}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 text-lg font-bold text-white transition hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20"
        >
          <Check className="h-5 w-5" />
          {t.disclaimer.accept}
        </button>
      </div>
    </div>
  );
}
