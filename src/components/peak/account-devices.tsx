import { useState } from "react";
import { Laptop, LogOut, Router, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/network";
import type { AccountNetworkSnapshot } from "@/lib/router-accounting";

export function AccountDevices({ snapshot = null, disconnect }: {
  snapshot?: AccountNetworkSnapshot | null;
  disconnect?: (deviceId: string) => Promise<void>;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function remove(id: string, name: string) {
    if (!disconnect || pending || !window.confirm(`Disconnect ${name} from WiFi?`)) return;
    setPending(id); setError(null);
    try { await disconnect(id); }
    catch { setError("Device could not be disconnected. Please try again."); }
    finally { setPending(null); }
  }
  return <section className="mt-7 border-t pt-6" aria-label="Connected devices">
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold"><Laptop className="size-4 text-primary" />Connected devices</h2>
      <span className="text-sm font-bold tabular-nums">{snapshot ? snapshot.devices.length : "—"}</span>
    </div>
    {!snapshot ? <div className="mt-4 flex items-start gap-3 bg-secondary/40 p-4">
      <Router className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      <div><p className="text-sm font-medium">Awaiting hotspot connection</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Live device counts and remote sign-out will be available when your router is linked.</p></div>
    </div> : snapshot.devices.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No devices connected.</p> :
      <ul className="mt-3 divide-y">{snapshot.devices.map(device => <li key={device.id} className="flex items-center justify-between gap-3 py-4">
        <div className="min-w-0"><p className="break-words text-sm font-semibold">{device.name}{device.current && <span className="ml-2 text-xs font-normal text-accent">This device</span>}</p><p className="mt-1 break-words text-xs text-muted-foreground">{device.address} · {formatBytes(device.receivedBytes + device.sentBytes)}</p></div>
        <Button size="icon" variant="ghost" disabled={!disconnect || pending !== null} onClick={() => remove(device.id, device.name)} aria-label={`Disconnect ${device.name}`} title={`Disconnect ${device.name}`}>{pending === device.id ? <Loader2 className="animate-spin" /> : <LogOut />}</Button>
      </li>)}</ul>}
    {snapshot && <p className="mt-2 text-[11px] text-muted-foreground">Updated {new Date(snapshot.updatedAt).toLocaleString("en-KE")}</p>}
    {error && <p role="alert" className="mt-3 text-xs text-warning">{error}</p>}
  </section>;
}