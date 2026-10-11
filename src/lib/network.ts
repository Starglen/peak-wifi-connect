export function formatBytes(bytes: number): string {
  const safe = Math.max(0, Number.isFinite(bytes) ? bytes : 0);
  if (safe < 1000) return `${Math.round(safe)} B`;
  if (safe < 1_000_000) return `${(safe / 1000).toFixed(1)} KB`;
  if (safe < 1_000_000_000) return `${(safe / 1_000_000).toFixed(2)} MB`;
  return `${(safe / 1_000_000_000).toFixed(2)} GB`;
}

export function downloadMbps(bytes: number, elapsedMs: number): number {
  if (elapsedMs <= 0 || bytes <= 0) return 0;
  return bytes * 8 / (elapsedMs * 1000);
}

export const SPEED_TEST_MAX_BYTES = 8_000_000;