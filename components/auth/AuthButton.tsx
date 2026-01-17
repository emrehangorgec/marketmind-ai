"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Settings, HelpCircle } from "lucide-react";
import { useSettingsModal } from "@/components/settings/SettingsContext";
import { useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

type AuthButtonProps = {
  variant?: "light" | "dark";
};

export function AuthButton({ variant = "dark" }: AuthButtonProps) {
  const { data: session } = useSession();
  const { openSettings } = useSettingsModal();
  const { t } = useLanguage();
  const [showInfo, setShowInfo] = useState(false);
  const isLight = variant === "light";

  if (session) {
    return (
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full"
              unoptimized
            />
          )}
          <span
            className={`hidden text-sm sm:inline ${
              isLight ? "text-slate-600" : "text-white/80"
            }`}
          >
            {session.user?.name || session.user?.email}
          </span>
        </div>
        <LanguageSwitcher variant={variant} />
        <button
          onClick={openSettings}
          className={`rounded-full p-2 transition ${
            isLight
              ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
          title={t.common.settings}
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          onClick={() => signOut()}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            isLight
              ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          {t.common.signOut}
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      <LanguageSwitcher variant={variant} />
      <button
        onClick={openSettings}
        className={`rounded-full p-2 transition ${
          isLight
            ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
        title={t.common.settings}
      >
        <Settings className="h-5 w-5" />
      </button>

      <button
        onClick={() => signIn("google")}
        className={`rounded-md px-4 py-2 text-sm font-medium transition ${
          isLight
            ? "bg-slate-900 text-white hover:bg-slate-800"
            : "bg-emerald-500 text-white hover:bg-emerald-600"
        }`}
      >
        {t.common.signIn}
      </button>

      <button
        onClick={() => setShowInfo(!showInfo)}
        className={`${isLight ? "text-slate-400 hover:text-slate-700" : "text-white/40 hover:text-white/80"}`}
        title={t.auth.whySignIn}
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {showInfo && (
        <div
          className={`absolute right-0 top-full mt-2 w-64 rounded-lg border p-3 shadow-xl z-50 ${
            isLight
              ? "border-slate-200 bg-white text-slate-600"
              : "border-white/10 bg-[#0A0B10]"
          }`}
        >
          <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-white/80"}`}>
            {t.auth.infoText}
          </p>
        </div>
      )}
    </div>
  );
}