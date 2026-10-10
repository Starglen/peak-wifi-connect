import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "peakwifi.session";
type Cached = { expiresAt: string | null; packageName: string | null; syncedAt: number };

/**
 * Countdown runs from the last known expiry timestamp, online or offline.
 * Re-syncs with the server on mount, on reconnect, and every 60s while online.
 */
export function useWifiSession() {
  const [cached, setCached] = useState<Cached | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [online, setOnline] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const sync = useCallback(async () => {
    const { data, error } = await supabase
      .from("purchases")
      .select("expires_at, packages(name)")
      .eq("status", "active")
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return false;
    const next: Cached = {
      expiresAt: data?.expires_at ?? null,
      packageName: (data?.packages as { name: string } | null)?.name ?? null,
      syncedAt: Date.now(),
    };
    localStorage.setItem(KEY, JSON.stringify(next));
    setCached(next);
    return true;
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setCached(JSON.parse(raw));
    } catch { /* ignore */ }
    setOnline(navigator.onLine);
    sync().finally(() => setLoaded(true));
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const poll = setInterval(() => navigator.onLine && sync(), 60_000);
    const on = () => { setOnline(true); sync(); };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      clearInterval(tick); clearInterval(poll);
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [sync]);

  const expiresMs = cached?.expiresAt ? new Date(cached.expiresAt).getTime() : 0;
  const remainingMs = Math.max(0, expiresMs - now);
  return {
    loaded: loaded || !!cached,
    online,
    remainingMs,
    active: remainingMs > 0,
    expiresAt: cached?.expiresAt ?? null,
    packageName: cached?.packageName ?? null,
    syncedAt: cached?.syncedAt ?? null,
    sync,
    applyExpiry: (expiresAt: string, packageName: string) => {
      const next = { expiresAt, packageName, syncedAt: Date.now() };
      localStorage.setItem(KEY, JSON.stringify(next));
      setCached(next);
    },
    clear: () => localStorage.removeItem(KEY),
  };
}
