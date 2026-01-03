"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Logo } from "@/components/common/Logo";

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#05060b] py-8 text-center text-sm text-white/40">
      <div className="mx-auto max-w-5xl px-6 flex flex-col items-center">
        <div className="mb-6">
          <Logo className="w-6 h-6" />
        </div>
        <div className="mb-4 flex justify-center gap-6">
          <Link href="/terms" className="hover:text-white transition">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-white transition">
            Privacy Policy
          </Link>
        </div>
        <p className="mb-4 max-w-2xl mx-auto leading-relaxed">
          {t.disclaimer.text} {t.disclaimer.footer}
        </p>
        <p>
          &copy; {currentYear} MarketMind AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
