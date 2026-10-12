import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, LogOut, Smartphone, WifiOff, RefreshCw, Wifi, Clock3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo, PackageCard } from "@/components/peak/brand";
import { NetworkInsights } from "@/components/peak/network-insights";
import { packagesQuery, getPortalParams } from "@/lib/packages";
import { useWifiSession } from "@/hooks/use-wifi-session";
import { initiatePayment, confirmPayment } from "@/lib/wifi.functions";
import { splitRemaining, normalizeKePhone, MPESA_PAYBILL_DISPLAY } from "@/lib/wifi";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/connect")({
  validateSearch: (s: Record<string, unknown>): { pkg?: string } => (typeof s['pkg'] === "string" ? { pkg: s['pkg'] as string } : {}),
  head: () => ({
    meta: [
      { title: "My WiFi — PeakWiFi" },
      { name: "description", content: "View your PeakWiFi connection, remaining time, page data activity and download speed, and add a package." },
      { property: "og:title", content: "My WiFi — PeakWiFi" },
      { property: "og:description", content: "Your PeakWiFi connection details, speed measurements and M-Pesa packages in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Connect,
});

type Stage = "idle" | "sending" | "waiting" | "success";

function Connect() {
  const { pkg: preselect } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const session = useWifiSession();
  const { data: packages, isLoading } = useQuery(packagesQuery);
  const [selected, setSelected] = useState<string | undefined>(preselect ?? undefined);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const start = useServerFn(initiatePayment);
  const confirm = useServerFn(confirmPayment);

  useEffect(() => {
    supabase.from("profiles").select("full_name, phone").maybeSingle().then(({ data }) => {
      if (data?.phone) setPhone("0" + data.phone.slice(3));
      if (data?.full_name) setName(data.full_name.split(" ")[0] ?? "");
    });
  }, []);

  const pkg = packages?.find((p) => p.id === selected);

  async function pay() {
    if (!pkg) return;
    if (!normalizeKePhone(phone)) { toast.error("Enter a valid M-Pesa number"); return; }
    setStage("sending");
    try {
      const { purchaseId } = await start({ data: { packageId: pkg.id, phone } });
      setStage("waiting");
      // DEMO: simulate the customer approving the STK prompt.
      await new Promise((r) => setTimeout(r, 3500));
      const { expiresAt } = await confirm({ data: { purchaseId } });
      if (!expiresAt) throw new Error("No connection expiry received. Please refresh your session.");
      session.applyExpiry(expiresAt, pkg.name);
      setStage("success");
      const portal = getPortalParams();
      const loginUrl = portal["link-login-only"] || portal["link-login"];
      setTimeout(() => {
        if (loginUrl) window.location.href = loginUrl;
        else { setStage("idle"); setSelected(undefined); }
      }, 2200);
    } catch (e) {
      setStage("idle");
      toast.error(e instanceof Error ? e.message : "Payment failed. Try again.");
    }
  }

  async function signOut() {
    await qc.cancelQueries(); qc.clear(); session.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const t = splitRemaining(session.remainingMs);
  const synced = session.syncedAt ? new Date(session.syncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;
  const expiry = session.expiresAt ? new Date(session.expiresAt) : null;
  const expiryDate = expiry?.toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const expiryTime = expiry?.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

  return (
    <div className="mx-auto max-w-md px-5 pb-40 lg:max-w-6xl lg:px-8">
      <header className="flex items-center justify-between border-b py-5">
        <Logo />
        <div className="flex items-center gap-4"><span className="hidden text-xs text-muted-foreground sm:block">{name ? `Hi, ${name}` : "My account"}</span><Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut /></Button></div>
      </header>

      <div className="mb-6 mt-8 flex items-end justify-between gap-3"><div><p className="text-xs font-medium text-accent">YOUR CONNECTION</p><h1 className="mt-2 text-2xl font-extrabold lg:text-3xl">My PeakWiFi</h1></div><span className="flex items-center gap-1.5 pb-1 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-accent" />{session.online ? "Online" : "Offline"}</span></div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      {/* Status */}
      <section className="glass relative min-w-0 overflow-hidden rounded-lg p-5 sm:p-7" aria-label="Connection details">
        <div className="mb-5 flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-semibold"><Wifi className="size-4 text-primary" />Current package</h2>{session.online && <Button variant="ghost" size="icon" onClick={() => session.sync()} aria-label="Refresh connection" title="Refresh connection"><RefreshCw className="size-3.5" /></Button>}</div>
        {!session.loaded ? (
          <Skeleton className="mx-auto h-24 w-48" />
        ) : session.active ? (
          <>
            <div className="flex w-fit max-w-full items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-success animate-pulse-ring" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              Package active
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 border-y py-4">
              <div><p className="text-[11px] text-muted-foreground">Active plan</p><p className="mt-1 truncate font-bold">{session.packageName ?? "WiFi package"}</p></div>
              <div className="border-l pl-4"><p className="text-[11px] text-muted-foreground">Status</p><p className="mt-1 font-bold text-success">Connected</p></div>
            </div>
            <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" />Time remaining</p>
            <div className="mt-2 flex flex-wrap items-end gap-1 font-extrabold">
              {t.d > 0 && <Unit v={t.d} l="d" />}
              <Unit v={t.h} l="h" /><Unit v={t.m} l="m" /><Unit v={t.s} l="s" />
            </div>
            <div className="mt-4 border-l-2 border-accent pl-3"><p className="text-[11px] text-muted-foreground">Plan expires</p><p className="mt-1 text-sm font-semibold">{expiryDate ?? "—"}</p><p className="mt-0.5 text-xs text-muted-foreground">{expiryTime ?? ""}</p></div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{name ? `Hi, ${name}` : "Welcome back"}</p>
            <h2 className="mt-1 text-2xl font-extrabold">No active package</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose a package to get online.</p>
          </>
        )}
        {!session.online && synced && (
          <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
            <WifiOff className="size-3" /> Offline · last synced {synced}
          </p>
        )}
        <NetworkInsights online={session.online} />
      </section>

      {/* Packages */}
      <section className="min-w-0" aria-label="WiFi packages">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{session.active ? "Add more time" : "Choose a package"}</h2><span className="text-[11px] text-muted-foreground">M-PESA</span></div>
        {session.active && <p className="text-xs text-muted-foreground">New time is added on top of what's left.</p>}
        <div className="mt-3 space-y-3">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[72px] rounded-2xl" />)
            : packages?.map((p) => (
                <PackageCard key={p.id} pkg={p} selected={selected === p.id} onSelect={() => setSelected(p.id)} />
              ))}
        </div>
        <div className="mt-5 flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground"><ShieldCheck className="size-4 shrink-0 text-accent" />No voucher codes. Your time starts after payment.</div>
      </section>
      </div>

      {/* Pay sheet */}
      {pkg && stage === "idle" && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/90 p-4 backdrop-blur-xl">
          <div className="mx-auto max-w-md space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="size-4 text-muted-foreground" />
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel"
                className="h-11 rounded-xl" placeholder="M-Pesa number" />
            </div>
            <Button variant="hero" size="xl" className="w-full" onClick={pay}>
              Pay KES {pkg.price_kes} with M-Pesa
            </Button>
          </div>
        </div>
      )}

      {stage !== "idle" && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-background/85 p-6 backdrop-blur-xl">
          <div className="glass w-full max-w-sm rounded-3xl p-8 text-center">
            {stage === "success" ? (
              <>
                <CheckCircle2 className="mx-auto size-14 text-success" />
                <h3 className="mt-4 text-xl font-bold">You're connected</h3>
                <p className="mt-1 text-sm text-muted-foreground">{pkg?.name} is active. Enjoy!</p>
              </>
            ) : (
              <>
                <div className="relative mx-auto grid size-16 place-items-center">
                  <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
                  <Smartphone className="size-8 text-primary" />
                </div>
                <h3 className="mt-5 text-xl font-bold">{stage === "sending" ? "Sending prompt…" : "Check your phone"}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your M-Pesa PIN to pay KES {pkg?.price_kes} to PeakWiFi ({MPESA_PAYBILL_DISPLAY}).
                </p>
                <Loader2 className="mx-auto mt-5 size-5 animate-spin text-muted-foreground" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Unit({ v, l }: { v: number; l: string }) {
  return (
    <span className="flex items-baseline">
      <span className="text-4xl tabular-nums sm:text-5xl">{String(v).padStart(2, "0")}</span>
      <span className="mr-1 text-sm text-muted-foreground sm:mr-2 sm:text-lg">{l}</span>
    </span>
  );
}
