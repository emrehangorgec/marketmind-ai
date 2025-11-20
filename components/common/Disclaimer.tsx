import { DISCLAIMER_TEXT } from "@/lib/constants";

export function Disclaimer() {
  return (
    <p className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
      {DISCLAIMER_TEXT}
    </p>
  );
}
