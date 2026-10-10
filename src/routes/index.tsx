import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Zap, ShieldCheck, Smartphone, Infinity as InfinityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo, PackageCard } from "@/components/peak/brand";
import { packagesQuery, capturePortalParams } from "@/lib/packages";
import { supabase } from "@/integrations/supabase/client";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PeakWiFi — Fast hotspot internet, paid with M-Pesa" },
      { name: "description", content: "Pick a package, pay with M-Pesa, and you're online instantly. No vouchers, no codes." },
      { property: "og:title", content: "PeakWiFi — Fast hotspot internet" },
      { property: "og:description", content: "Pay with M-Pesa and connect instantly. No vouchers, no codes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { data: packages, isLoading } = useQuery(packagesQuery);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    capturePortalParams();
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);
  const cta = signedIn ? "/connect" : "/auth";

  return (
    <div className="mx-auto max-w-md px-5 pb-16 md:max-w-5xl">
      <header className="flex items-center justify-between py-5">
        <Logo />
        <Button asChild variant="glass" size="sm" className="rounded-full px-4">
          <Link to={cta}>{signedIn ? "My WiFi" : "Sign in"}</Link>
        </Button>
      </header>

      <section className="grid items-center gap-8 pt-4 md:grid-cols-2 md:pt-12">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-success" /> Hotspot online
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Internet at your <span className="text-brand">peak.</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Pick a package, approve the M-Pesa prompt, and you're online. No vouchers. No codes. Sign in once per device.
          </p>
          <Button asChild variant="hero" size="xl" className="mt-6 w-full md:w-auto">
            <Link to={cta}>Get connected — from KES 10</Link>
          </Button>
        </div>
        <img src={hero} width={1280} height={896} alt="" className="hidden rounded-3xl md:block" />
      </section>

      <section className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { i: Zap, t: "Instant connect", d: "Online seconds after payment" },
          { i: ShieldCheck, t: "Secure M-Pesa", d: "STK push to your phone" },
          { i: Smartphone, t: "One login", d: "Remembered on this device" },
          { i: InfinityIcon, t: "Unlimited data", d: "Time-based packages" },
        ].map(({ i: I, t, d }) => (
          <div key={t} className="glass rounded-2xl p-4">
            <I className="size-5 text-accent" />
            <div className="mt-3 text-sm font-semibold">{t}</div>
            <div className="text-xs text-muted-foreground">{d}</div>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">Packages</h2>
        <p className="text-sm text-muted-foreground">Unused time carries over when you top up.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[72px] rounded-2xl" />)
            : packages?.map((p) => (
                <Link key={p.id} to={cta} search={{ pkg: p.id } as never}>
                  <PackageCard pkg={p} />
                </Link>
              ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">How it works</h2>
        <ol className="mt-4 space-y-3">
          {["Create your account — takes 10 seconds", "Choose a package & approve the M-Pesa prompt", "You're connected automatically"].map((s, i) => (
            <li key={s} className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-primary-foreground">{i + 1}</span>
              <span className="text-sm">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-16 text-center text-xs text-muted-foreground">
        Need help? Call or WhatsApp +254 798 091 838 · © {new Date().getFullYear()} Broadlink PeakWiFi
      </footer>
    </div>
  );
}
