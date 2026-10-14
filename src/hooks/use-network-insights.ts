import { useEffect, useRef, useState } from "react";
import { downloadMbps, SPEED_TEST_MAX_BYTES } from "@/lib/network";

type Result = { mbps: number; latency: number; testedAt: number };
const TEST_ORIGIN = "https://speed.cloudflare.com";

export function useNetworkInsights() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("Ready");
  const [samples, setSamples] = useState<number[]>([]);
  const [liveMbps, setLiveMbps] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; controller.current?.abort(); };
  }, []);

  async function runTest() {
    if (controller.current) return;
    const abort = new AbortController();
    controller.current = abort;
    setRunning(true); setError(null); setResult(null); setSamples([]); setLiveMbps(0);
    const timeout = window.setTimeout(() => abort.abort(), 15_000);
    try {
      setPhase("Measuring latency");
      const timings: number[] = [];
      for (let i = 0; i < 3; i++) {
        const start = performance.now();
        const response = await fetch(`${TEST_ORIGIN}/__down?bytes=0&nonce=${Date.now()}-${i}`, { cache: "no-store", signal: abort.signal });
        if (!response.ok) throw new Error("Test service unavailable");
        await response.arrayBuffer();
        timings.push(performance.now() - start);
      }
      const latency = Math.round(Math.min(...timings));
      setPhase("Measuring download");
      const start = performance.now();
      const response = await fetch(`${TEST_ORIGIN}/__down?bytes=${SPEED_TEST_MAX_BYTES}&nonce=${Date.now()}`, { cache: "no-store", signal: abort.signal });
      if (!response.ok || !response.body) throw new Error("Test service unavailable");
      const reader = response.body.getReader();
      let downloaded = 0;
      let lastSample = start;
      let lastBytes = 0;
      while (true) {
        abort.signal.throwIfAborted();
        const { done, value } = await reader.read();
        if (done) break;
        downloaded += value.byteLength;
        if (downloaded > SPEED_TEST_MAX_BYTES) { await reader.cancel(); throw new Error("Unexpected download size"); }
        if (!mounted.current) return;
        const now = performance.now();
        if (now - lastSample >= 50) {
          const speed = downloadMbps(downloaded - lastBytes, now - lastSample);
          setLiveMbps(speed); setSamples((current) => [...current.slice(-39), speed]);
          lastSample = now;
          lastBytes = downloaded;
        }
      }
      if (downloaded !== SPEED_TEST_MAX_BYTES) throw new Error("Incomplete measurement");
      if (!mounted.current) return;
      const mbps = downloadMbps(downloaded, performance.now() - start);
      setLiveMbps(mbps); setSamples((current) => [...current, mbps]);
      setResult({ mbps, latency, testedAt: Date.now() });
      setPhase("Test complete");
    } catch {
      if (!mounted.current) return;
      setError(abort.signal.aborted ? "Test stopped. Try again when your connection is stable." : "Cannot reach the test service. Connect to the internet and try again.");
      setPhase("Ready");
    } finally {
      window.clearTimeout(timeout); controller.current = null; if (mounted.current) setRunning(false);
    }
  }

  return { running, phase, samples, liveMbps, result, error, runTest, cancel: () => controller.current?.abort() };
}