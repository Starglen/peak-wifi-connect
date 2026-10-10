import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, LogOut, Smartphone, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo, PackageCard } from "@/components/peak/brand";
import { packagesQuery, getPortalParams } from "@/lib/packages";
import { useWifiSession } from "@/hooks/use-wifi-session";
import { initiatePayment, confirmPayment } from "@/lib/wifi.functions";
import { splitRemaining, normalizeKePhone, MPESA_PAYBILL_DISPLAY } from "@/lib/wifi";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/connect")({
  validateSearch: (s: Record<string, unknown>) => ({ pkg: typeof s.pkg === "string" ? s.pkg : undefined }),
  head: () => ({
    meta: [
      { title: "My WiFi — PeakWiFi" },
      { name: "description", content: "Your time remaining and packages." },
      { property: "og:title", content: "My WiFi — PeakWiFi" },
      { property: "og:description", content: "Check time remaining and top up with M-Pesa." },
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
  const [selected, setSelected] = useState<string | undefined>(preselect);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const start = useServerFn(initiatePayment);
  const confirm = useServerFn(confirmPayment);

  useEffect(() => {
    supabase.from("profiles").select("full_name, phone").maybeSingle().then(({ data }) => {
      if (data?.phone) setPhone("0" + data.phone.slice(3));
      if (data?.full_name) setName(data.full_name.split(" ")[0]);
    });
  }, []);

  const pkg = packages?.find((p) => p.id === selected);

  async function pay() {
    if (!pkg) return;
    if (!normalizeKePhone(phone)) return toast.error("Enter a valid M-Pesa number");
    setStage("sending");
    try {
      const { purchaseId } = await start({ data: { packageId: pkg.id, phone } });
      setStage("waiting");
      // DEMO: simulate the customer approving the STK prompt.
      await new Promise((r) => setTimeout(r, 3500));
      const { expiresAt } = await confirm({ data: { purchaseId } });
      session.applyExpiry(expiresAt!, pkg.name);
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

  return (
    <div className="mx-auto max-w-md px-5 pb-40">
      <header className="flex items-center justify-between py-5">
        <Logo />
        <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out"><LogOut /></Button>
      </header>

      {/* Status */}
      <section className="glass relative overflow-hidden rounded-3xl p-6 text-center">
        {!session.loaded ? (
          <Skeleton className="mx-auto h-24 w-48" />
        ) : session.active ? (
          <>
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-success animate-pulse-ring" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              Connected · {session.packageName}
            </div>
            <div className="mt-5 flex items-end justify-center gap-1 font-extrabold tracking-tight">
              {t.d > 0 && <Unit v={t.d} l="d" />}
              <Unit v={t.h} l="h" /><Unit v={t.m} l="m" /><Unit v={t.s} l="s" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Expires {new Date(session.expiresAt!).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{name ? `Hi ${name} 👋` : "Hi there 👋"}</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">No active package</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pick one below to get online.</p>
          </>
        )}
        {!session.online && synced && (
          <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
            <WifiOff className="size-3" /> Offline · last synced {synced}
          </p>
        )}
        {session.online && (
          <button onClick={() => session.sync()} className="absolute right-3 top-3 text-muted-foreground" aria-label="Refresh">
            <RefreshCw className="size-3.5" />
          </button>
        )}
      </section>

      {/* Packages */}
      <section className="mt-8">
        <h2 className="font-bold">{session.active ? "Add more time" : "Choose a package"}</h2>
        {session.active && <p className="text-xs text-muted-foreground">New time is added on top of what's left.</p>}
        <div className="mt-3 space-y-3">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[72px] rounded-2xl" />)
            : packages?.map((p) => (
                <PackageCard key={p.id} pkg={p} selected={selected === p.id} onSelect={() => setSelected(p.id)} />
              ))}
        </div>
      </section>

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
      <span className="text-5xl tabular-nums">{String(v).padStart(2, "0")}</span>
      <span className="mr-2 text-lg text-muted-foreground">{l}</span>
    </span>
  );
}
