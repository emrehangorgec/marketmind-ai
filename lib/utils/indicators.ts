import { HistoricalPriceBar } from "@/lib/types/analysis";

const toCloseSeries = (prices: HistoricalPriceBar[]) =>
  prices.map((bar) => bar.close);

export function calculateSMA(prices: HistoricalPriceBar[], period: number) {
  if (prices.length < period) return null;
  const series = toCloseSeries(prices).slice(0, period);
  const sum = series.reduce((acc, value) => acc + value, 0);
  return +(sum / period).toFixed(2);
}

export function calculateRSI(prices: HistoricalPriceBar[], period = 14) {
  if (prices.length <= period) return null;
  const closes = toCloseSeries(prices);
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i += 1) {
    const change = closes[i - 1] - closes[i];
    if (change > 0) gains += change;
    else losses -= change;
  }

  gains /= period;
  losses /= period || 1;
  if (losses === 0) return 100;

  const rs = gains / losses;
  return +(100 - 100 / (1 + rs)).toFixed(2);
}

export function calculateMACD(prices: HistoricalPriceBar[]) {
  const closes = toCloseSeries(prices);
  if (closes.length < 35) return null;

  const ema = (period: number) => {
    const k = 2 / (period + 1);
    return closes.reduce((acc: number[], price, index) => {
      if (index === 0) return [price];
      const prev = acc[index - 1];
      acc.push(price * k + prev * (1 - k));
      return acc;
    }, []);
  };

  const ema12 = ema(12);
  const ema26 = ema(26);
  const macdLine = ema12.map((value, index) => value - (ema26[index] ?? value));
  const signalLine = ema(macdLine.length >= 9 ? 9 : macdLine.length);
  const histogram = macdLine[macdLine.length - 1] - signalLine[signalLine.length - 1];

  return {
    macd: +macdLine[macdLine.length - 1].toFixed(2),
    signal: +signalLine[signalLine.length - 1].toFixed(2),
    histogram: +histogram.toFixed(2),
  };
}

export function calculateBollingerBands(
  prices: HistoricalPriceBar[],
  period = 20,
  multiplier = 2
) {
  if (prices.length < period) return null;
  const closes = toCloseSeries(prices).slice(0, period);
  const mean = closes.reduce((acc, value) => acc + value, 0) / period;
  const variance =
    closes.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    middle: +mean.toFixed(2),
    upper: +(mean + multiplier * stdDev).toFixed(2),
    lower: +(mean - multiplier * stdDev).toFixed(2),
  };
}

export function calculateVolatility(prices: HistoricalPriceBar[]) {
  if (prices.length < 2) return 0;
  const returns = [] as number[];
  for (let i = 1; i < prices.length; i += 1) {
    returns.push(Math.log(prices[i - 1].close / prices[i].close));
  }
  const mean = returns.reduce((acc, value) => acc + value, 0) / returns.length;
  const variance =
    returns.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) /
    (returns.length - 1);
  return Math.sqrt(variance) * Math.sqrt(252);
}

export function calculateMaxDrawdown(prices: HistoricalPriceBar[]) {
  // Ensure chronological order (Oldest to Newest) for correct drawdown calculation
  const sortedPrices = [...prices].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let peak = -Infinity;
  let maxDrawdown = 0;
  sortedPrices.forEach((bar) => {
    if (bar.close > peak) peak = bar.close;
    const drawdown = (bar.close - peak) / peak;
    if (drawdown < maxDrawdown) maxDrawdown = drawdown;
  });
  return +(Math.abs(maxDrawdown) * 100).toFixed(2);
}
