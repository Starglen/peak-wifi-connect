export const MPESA_PAYBILL_DISPLAY = "+254 798 091 838";

/** Accepts 07xx, 01xx, 2547xx, +2547xx. Returns 2547XXXXXXXX or null. */
export function normalizeKePhone(input: string): string | null {
  const d = input.replace(/\D/g, "");
  let n = d;
  if (n.startsWith("0") && n.length === 10) n = "254" + n.slice(1);
  else if ((n.startsWith("7") || n.startsWith("1")) && n.length === 9) n = "254" + n;
  return /^254[17]\d{8}$/.test(n) ? n : null;
}

/** New time stacks on top of any remaining time. */
export function computeExpiry(now: Date, currentExpiry: Date | null, minutes: number) {
  const startsAt = currentExpiry && currentExpiry > now ? currentExpiry : now;
  return { startsAt, expiresAt: new Date(startsAt.getTime() + minutes * 60_000) };
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${minutes / 60} hr${minutes > 60 ? "s" : ""}`;
  const days = minutes / 1440;
  return `${days} day${days > 1 ? "s" : ""}`;
}

export function splitRemaining(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}
