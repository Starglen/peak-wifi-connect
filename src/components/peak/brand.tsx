import { Link } from "@tanstack/react-router";
import { Wifi } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { formatDuration } from "@/lib/wifi";
import { cn } from "@/lib/utils";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
      <span className="grid size-8 place-items-center rounded-xl bg-brand shadow-glow">
        <Wifi className="size-4 text-primary-foreground" />
      </span>
      <span>Peak<span className="text-brand">WiFi</span></span>
    </Link>
  );
}

export function PackageCard({
  pkg, selected, onSelect,
}: { pkg: Tables<"packages">; selected?: boolean; onSelect?: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "glass relative flex w-full items-center justify-between rounded-2xl p-4 text-left transition-all active:scale-[0.99]",
        selected ? "ring-2 ring-primary" : "hover:bg-secondary",
      )}
    >
      {pkg.popular && (
        <span className="absolute -top-2 right-4 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-foreground">
          Popular
        </span>
      )}
      <div>
        <div className="font-semibold">{pkg.name}</div>
        <div className="text-xs text-muted-foreground">
          {formatDuration(pkg.duration_minutes)} · {pkg.devices} device{pkg.devices > 1 ? "s" : ""} · {pkg.tagline}
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold">KES {pkg.price_kes}</div>
      </div>
    </button>
  );
}
