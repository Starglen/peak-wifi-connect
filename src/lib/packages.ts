import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const packagesQuery = queryOptions({
  queryKey: ["packages"],
  queryFn: async () => {
    const { data, error } = await supabase.from("packages").select("*").order("sort");
    if (error) throw error;
    return data;
  },
  staleTime: 5 * 60_000,
});

const PORTAL_KEY = "peakwifi.portal";
/** Captive portals (e.g. MikroTik) pass mac/ip/link-login params on redirect. Keep them for hand-off. */
export function capturePortalParams() {
  const p = new URLSearchParams(window.location.search);
  const keys = ["mac", "ip", "link-login", "link-login-only", "link-orig", "chap-id", "chap-challenge"];
  const found = Object.fromEntries(keys.filter((k) => p.get(k)).map((k) => [k, p.get(k)!]));
  if (Object.keys(found).length) localStorage.setItem(PORTAL_KEY, JSON.stringify(found));
}
export function getPortalParams(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(PORTAL_KEY) || "{}"); } catch { return {}; }
}
