interface ScoreCardProps {
  label: string;
  score?: number;
}

export function ScoreCard({ label, score }: ScoreCardProps) {
  if (score === undefined) return null;
  const variant = score >= 7 ? "text-emerald-400" : score >= 4 ? "text-amber-300" : "text-rose-400";
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-white">
      <p className="text-sm text-white/60">{label}</p>
      <p className={`text-3xl font-bold ${variant}`}>{score.toFixed(1)}</p>
    </div>
  );
}
