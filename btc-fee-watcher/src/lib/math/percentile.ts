export function quantile(values: number[], p: number): number {
  if (!values.length) return NaN;
  const arr = [...values].sort((a, b) => a - b);
  const idx = (arr.length - 1) * Math.min(1, Math.max(0, p));
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return arr[lo];
  const t = idx - lo;
  return arr[lo] * (1 - t) + arr[hi] * t;
}

export function percentileRank(values: number[], x: number): number {
  if (!values.length) return 0;
  const k = values.filter((v) => v <= x).length;
  return (k / values.length) * 100;
}

export function percentHigher(values: number[], x: number): number {
  if (!values.length) return 0;
  const k = values.filter((v) => v > x).length;
  return (k / values.length) * 100;
}

export function winsorize(
  values: number[],
  lowP = 0.01,
  highP = 0.99,
): { data: number[]; qLow: number; qHigh: number } {
  if (!values.length) return { data: [], qLow: NaN, qHigh: NaN };
  const qLow = quantile(values, lowP);
  const qHigh = quantile(values, highP);
  const data = values.map((v) => Math.min(qHigh, Math.max(qLow, v)));
  return { data, qLow, qHigh };
}

export type Category =
  | "extremely low"
  | "very low"
  | "low"
  | "moderately low"
  | "slightly below average"
  | "slightly above average"
  | "moderately high"
  | "high"
  | "very high"
  | "extremely high";

// Two-bucket percentile labels based on multiple R
export function categorizeByTwoBucketPercentile(
  R: number,
  sample: number[],
): Category {
  if (!sample.length || !Number.isFinite(R)) return "slightly below average";
  const lows = sample.filter((v) => v <= 1);
  const highs = sample.filter((v) => v > 1);

  if (R <= 1 && lows.length >= 10) {
    const p = percentileRank(lows, R);
    if (p < 20) return "extremely low";
    if (p < 40) return "very low";
    if (p < 60) return "low";
    if (p < 80) return "moderately low";
    return "slightly below average";
  }
  if (R > 1 && highs.length >= 10) {
    const p = percentileRank(highs, R);
    if (p < 20) return "slightly above average";
    if (p < 40) return "moderately high";
    if (p < 60) return "high";
    if (p < 80) return "very high";
    return "extremely high";
  }
  return R <= 1 ? "slightly below average" : "slightly above average";
}


