"use client";

import {
  Area,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HistoricalPriceBar, TechnicalIndicators } from "@/lib/types/analysis";

interface TechnicalChartProps {
  data: HistoricalPriceBar[];
  indicators?: TechnicalIndicators;
}

export function TechnicalChart({ data, indicators }: TechnicalChartProps) {
  if (!data.length) return null;
  const reversed = [...data].reverse();

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={reversed} margin={{ left: 16, right: 16, top: 16 }}>
          <CartesianGrid stroke="#ffffff10" />
          <XAxis dataKey="date" stroke="#ffffff80" minTickGap={32} />
          <YAxis stroke="#ffffff80" domain={["auto", "auto"]} />
          <YAxis orientation="right" yAxisId="volume" stroke="#ffffff30" hide />
          <Tooltip cursor={{ stroke: "#ffffff20" }} />
          <Legend />
          <Line type="monotone" dataKey="close" stroke="#34d399" name="Close" dot={false} strokeWidth={2} />
          {indicators?.sma20 && (
            <Line type="monotone" dataKey={() => indicators.sma20} stroke="#60a5fa" name="SMA20" dot={false} strokeDasharray="5 5" />
          )}
          {indicators?.sma50 && (
            <Line type="monotone" dataKey={() => indicators.sma50} stroke="#fbbf24" name="SMA50" dot={false} strokeDasharray="4 4" />
          )}
          {indicators?.bollingerBands && (
            <Line type="monotone" dataKey={() => indicators.bollingerBands?.upper} stroke="#f472b6" name="BB Upper" dot={false} strokeDasharray="3 3" />
          )}
          {indicators?.bollingerBands && (
            <Line type="monotone" dataKey={() => indicators.bollingerBands?.lower} stroke="#f472b6" name="BB Lower" dot={false} strokeDasharray="3 3" />
          )}
          <Area
            type="monotone"
            dataKey="volume"
            name="Volume"
            stroke="#a855f7"
            fill="#a855f730"
            yAxisId="volume"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
