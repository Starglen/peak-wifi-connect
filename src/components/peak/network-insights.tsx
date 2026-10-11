import { Activity, ArrowDown, ArrowUp, Gauge, Loader2, Play, Radio, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNetworkInsights } from "@/hooks/use-network-insights";
import { formatBytes } from "@/lib/network";

export function NetworkInsights({ online }: { online: boolean }) {
  const network = useNetworkInsights();
  const speed = network.result?.mbps ?? network.liveMbps;
  const max = Math.max(10, ...network.samples);
  const points = network.samples.map((v, i) => `${(i / Math.max(1, network.samples.length - 1)) * 400},${88 - (v / max) * 72}`).join(" ");

  return (
    <div className="mt-7 border-t pt-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Activity className="size-4 text-primary" /> Data activity</h2>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className={`size-1.5 rounded-full ${online ? "bg-success" : "bg-warning"}`} />{online ? "Live page activity" : "Offline"}</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-5">
        <div><p className="text-[11px] text-muted-foreground">This page · since opened</p><p className="mt-1 text-3xl font-bold tabular-nums" aria-live="off">{formatBytes(network.bytes)}</p><p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><ArrowDown className="size-3 text-primary" /> Received · includes speed tests</p></div>
        <div className="border-l pl-5"><p className="text-[11px] text-muted-foreground">Total device usage</p><p className="mt-1 text-3xl font-bold text-muted-foreground">—</p><p className="mt-2 text-xs text-muted-foreground">Router not linked</p></div>
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">Page counter covers browser-reported transfers only, not other apps or all device traffic. Full usage awaits router accounting.</p>

      <div className="mt-6 border-t pt-6">
        <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-sm font-semibold"><Gauge className="size-4 text-accent" /> Connection speed</h2><span className="text-[11px] text-muted-foreground">{network.phase}</span></div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <div><p className="flex items-baseline gap-2"><span className="text-4xl font-bold tabular-nums">{network.running || network.result ? speed.toFixed(1) : "—"}</span><span className="text-xs text-muted-foreground">Mbps</span></p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><ArrowDown className="size-3" />Download</p></div>
          <dl className="space-y-3 text-xs"><div className="flex items-center justify-between gap-6"><dt className="flex items-center gap-1.5 text-muted-foreground"><Radio className="size-3" />Latency</dt><dd className="font-semibold tabular-nums">{network.result ? `${network.result.latency} ms` : "—"}</dd></div><div className="flex items-center justify-between gap-6"><dt className="flex items-center gap-1.5 text-muted-foreground"><ArrowUp className="size-3" />Upload</dt><dd className="text-muted-foreground">Not measured</dd></div></dl>
        </div>
        <div className="relative mt-5 h-24 overflow-hidden border-b" aria-label="Download speed chart">
          <svg viewBox="0 0 400 96" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
            {[24, 48, 72].map(y => <line key={y} x1="0" x2="400" y1={y} y2={y} className="stroke-border" strokeDasharray="3 5" />)}
            {points && <polyline points={points} fill="none" className="stroke-accent" strokeWidth="2" vectorEffect="non-scaling-stroke" />}
          </svg>
          {!network.samples.length && <p className="absolute inset-0 grid place-items-center text-[11px] text-muted-foreground">{network.running ? "Connecting to test server…" : "No measurement yet"}</p>}
        </div>
        {network.error && <p className="mt-3 text-xs text-warning" role="alert">{network.error}</p>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">{network.result ? `Tested ${new Date(network.result.testedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Cloudflare` : "Cloudflare · uses up to 8 MB"}</p>
          <Button variant={network.running ? "secondary" : "outline"} size="sm" disabled={!online} onClick={network.running ? network.cancel : network.runTest}>
            {network.running ? <><Square /> Stop test</> : <><Play />{network.result ? "Test again" : "Test speed"}</>}
          </Button>
        </div>
        {network.running && <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground" role="status"><Loader2 className="size-3 animate-spin" />{network.phase}…</p>}
      </div>
    </div>
  );
}