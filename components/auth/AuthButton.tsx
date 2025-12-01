"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Settings, HelpCircle } from "lucide-react";
import { useSettingsModal } from "@/components/settings/SettingsContext";
import { useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export function AuthButton() {
  const { data: session } = useSession();
  const { openSettings } = useSettingsModal();
  const { t } = useLanguage();
  const [showInfo, setShowInfo] = useState(false);

  if (session) {
    return (
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="h-8 w-8 rounded-full"
            />
          )}
          <span className="hidden text-sm text-white/80 sm:inline">
            {session.user?.name || session.user?.email}
          </span>
        </div>
        <LanguageSwitcher />
        <button
          onClick={openSettings}
          className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          title={t.common.settings}
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          onClick={() => signOut()}
          className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20"
        >
          {t.common.signOut}
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      <LanguageSwitcher />
      <button
        onClick={openSettings}
        className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
        title={t.common.settings}
      >
        <Settings className="h-5 w-5" />
      </button>
      
      <button
        onClick={() => signIn("google")}
        className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
      >
        {t.common.signIn}
      </button>

      <button
        onClick={() => setShowInfo(!showInfo)}
        className="text-white/40 hover:text-white/80"
        title={t.auth.whySignIn}
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {showInfo && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-white/10 bg-[#0A0B10] p-3 shadow-xl z-50">
          <p className="text-xs text-white/80 leading-relaxed">
            {t.auth.infoText}
          </p>
        </div>
      )}
    </div>
  );
}