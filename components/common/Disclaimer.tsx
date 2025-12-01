"use client";

import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function Disclaimer() {
  const { t } = useLanguage();

  return (
    <div className="mb-6 rounded-lg border-l-4 border-amber-500 bg-amber-900/20 p-4 backdrop-blur-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-200">{t.disclaimer.title}</h3>
          <div className="mt-2 text-sm text-amber-200/80">
            <p className="mb-2">{t.disclaimer.text}</p>
            <ul className="list-disc space-y-1 pl-5">
              {t.disclaimer.points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
            <p className="mt-2 font-medium">{t.disclaimer.footer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
