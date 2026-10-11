import { useEffect, useRef, useState } from "react";
import { downloadMbps, SPEED_TEST_MAX_BYTES } from "@/lib/network";

type Result = { mbps: number; latency: number; testedAt: number };
const TEST_ORIGIN = "https://speed.cloudflare.com";

export function useNetworkInsights() {
  const [bytes, setBytes] = useState(0);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("Ready");
  const [samples, setSamples] = useState<number[]>([]);
  const [liveMbps, setLiveMbps] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") return;
    const observer = new PerformanceObserver((list) => {
      let transferred = 0;
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        if (!resource.name.startsWith(TEST_ORIGIN)) transferred += resource.transferSize || 0;
      }
      setBytes((current) => current + transferred);
    });
    observer.observe({ type: "resource", buffered: true });
    return () => { observer.disconnect(); controller.current?.abort(); };
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
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        downloaded += value.byteLength;
        setBytes((current) => current + value.byteLength);
        const now = performance.now();
        if (now - lastSample >= 100) {
          const speed = downloadMbps(downloaded, now - start);
          setLiveMbps(speed); setSamples((current) => [...current.slice(-39), speed]);
          lastSample = now;
        }
      }
      if (!downloaded) throw new Error("No data received");
      const mbps = downloadMbps(downloaded, performance.now() - start);
      setLiveMbps(mbps); setSamples((current) => [...current, mbps]);
      setResult({ mbps, latency, testedAt: Date.now() });
      setPhase("Test complete");
    } catch {
      setError(abort.signal.aborted ? "Test stopped. Try again when your connection is stable." : "Cannot reach the test service. Connect to the internet and try again.");
      setPhase("Ready");
    } finally {
      window.clearTimeout(timeout); controller.current = null; setRunning(false);
    }
  }

  return { bytes, running, phase, samples, liveMbps, result, error, runTest, cancel: () => controller.current?.abort() };
}