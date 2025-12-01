"use client";

import { useState, useEffect } from "react";
import { X, Key, ShieldCheck, AlertCircle } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useSettingsModal } from "./SettingsContext";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function SettingsModal() {
  const { isOpen, closeSettings } = useSettingsModal();
  const { settings, saveSettings } = useSettings();
  const [formData, setFormData] = useState(settings);
  const { t } = useLanguage();

  // Sync form data when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(settings);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    saveSettings(formData);
    closeSettings();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0B10] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">
              {t.settings.title}
            </h2>
          </div>
          <button
            onClick={closeSettings}
            className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
            title={t.common.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-blue-400" />
            <p className="text-xs text-blue-200">
              {t.settings.description}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white">
              <Key className="h-4 w-4 text-emerald-400" />
              {t.settings.openaiKey}
            </label>
            <input
              type="password"
              value={formData.openaiApiKey || ""}
              onChange={(e) =>
                setFormData({ ...formData, openaiApiKey: e.target.value })
              }
              placeholder="sk-..."
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-sm text-white placeholder-white/20 focus:border-emerald-500 focus:outline-none"
            />
            <p className="text-xs text-white/40">
              {t.settings.openaiKeyDesc}
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={closeSettings}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white/60 hover:text-white"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
          >
            {t.common.save}
          </button>
        </div>
      </div>
    </div>
  );
}
