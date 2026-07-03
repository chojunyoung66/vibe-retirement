export const toSafe = (v: string, min = 0, max = Number.MAX_SAFE_INTEGER): number => {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
};
