import { Link } from "@tanstack/react-router";
import logo from "@/assets/peakwifi-logo.png.asset.json";
import type { Tables } from "@/integrations/supabase/types";
import { formatDuration } from "@/lib/wifi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
      <img src={logo.url} alt="" width={44} height={44} className="size-11 shrink-0 object-contain" />
      <span className="leading-tight"><span className="block text-[9px] font-medium uppercase text-muted-foreground">Broadlink</span>Peak<span className="text-accent">WiFi</span></span>
    </Link>
  );
}

export function PackageCard({
  pkg, selected, onSelect,
}: { pkg: Tables<"packages">; selected?: boolean; onSelect?: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onSelect}
      aria-pressed={selected ?? false}
      className={cn(
        "glass relative flex h-auto min-h-20 w-full items-center justify-between gap-3 whitespace-normal rounded-lg p-4 text-left transition-all active:scale-[0.99]",
        selected ? "ring-2 ring-primary" : "hover:bg-secondary",
      )}
    >
      {pkg.popular && (
        <span className="absolute -top-2 right-4 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-foreground">
          Popular
        </span>
      )}
      <div className="min-w-0">
        <div className="font-semibold">{pkg.name}</div>
        <div className="text-xs text-muted-foreground">
          {formatDuration(pkg.duration_minutes)} · {pkg.tagline}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-base font-bold">KES {pkg.price_kes}</div>
      </div>
    </Button>
  );
}
