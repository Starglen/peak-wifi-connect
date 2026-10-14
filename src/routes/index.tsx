import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowDown, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/peak/site-header";
import { capturePortalParams } from "@/lib/packages";
import { supabase } from "@/integrations/supabase/client";
import { WaveBackground } from "@/components/peak/wave-background";
import { WebsiteSections } from "@/components/peak/website-sections";

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
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    capturePortalParams();
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (data.user) navigate({ to: "/connect", replace: true });
      else setChecking(false);
    }).catch(() => { if (mounted) setChecking(false); });
    return () => { mounted = false; };
  }, [navigate]);

  return (
    <main>
      <SiteHeader checking={checking} />
      <section className="relative isolate overflow-hidden" aria-label="Broadlink PeakWiFi">
        <WaveBackground />
        <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-16 lg:px-8 lg:pb-20 lg:pt-24">
          <p className="section-kicker flex items-center gap-2"><span className="size-1.5 rounded-full bg-accent" />STAY CLOSE. GO FURTHER.</p>
          <h1 className="mt-6 max-w-3xl text-5xl font-extrabold leading-[1.08] sm:text-6xl lg:text-7xl">Broadlink<br /><span className="text-brand">PeakWiFi.</span></h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">Your plans. Your people. Your connection.<br />Fast, affordable internet for the everyday and everything beyond it.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button asChild variant="hero" size="xl"><Link to="/auth">Get connected<ArrowRight /></Link></Button><Button asChild variant="outline" size="xl"><a href="#packages">Explore plans<ArrowDown /></a></Button></div>
          <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-xs text-muted-foreground"><span className="flex items-center gap-2"><Zap className="size-4 text-accent" />From KES 20</span><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" />M-Pesa payments</span><span>One account. No voucher codes.</span></div>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-5 lg:px-8"><WebsiteSections /></div>
    </main>
  );
}
