import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, LogOut, X } from "lucide-react";
import { Logo } from "@/components/peak/brand";
import { SectionNavigation } from "@/components/peak/website-sections";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function SiteHeader({ signedIn = false, checking = false, name = "", onSignOut }: {
  signedIn?: boolean; checking?: boolean; name?: string; onSignOut?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const target = useRef<string | null>(null);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const accountAction = signedIn
    ? <Button variant="ghost" size="icon" onClick={onSignOut} aria-label="Sign out" title="Sign out"><LogOut /></Button>
    : <Button asChild variant="outline" size="sm"><Link to="/auth">{checking ? "My account" : "Sign in"}<ArrowRight /></Link></Button>;

  return <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
    <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 lg:flex lg:gap-7 lg:px-8 lg:py-4">
      <div className="min-w-0 shrink-0"><Logo /></div>
      <div className="ml-auto hidden items-center justify-end gap-7 lg:flex"><SectionNavigation />{signedIn && <span className="text-xs text-muted-foreground">{name ? `Hi, ${name}` : "My account"}</span>}{accountAction}</div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild><Button variant="ghost" size="icon" className="size-11 shrink-0 lg:hidden" aria-label="Open menu" aria-expanded={open} title="Open menu"><span className="flex w-6 flex-col items-end gap-1.5" aria-hidden="true"><span className="h-0.5 w-6 bg-foreground" /><span className="h-0.5 w-4 bg-accent" /></span></Button></SheetTrigger>
        <SheetContent side="right" showCloseButton={false} aria-describedby={undefined} className="mobile-navigation flex h-dvh w-full flex-col gap-0 overflow-y-auto border-0 px-5 pb-7 pt-3 sm:max-w-md" onCloseAutoFocus={event => {
          if (!target.current) return;
          event.preventDefault();
          const id = target.current;
          target.current = null;
          requestAnimationFrame(() => {
            const section = document.getElementById(id);
            section?.scrollIntoView({ block: "start" });
            section?.setAttribute("tabindex", "-1");
            section?.focus({ preventScroll: true });
          });
        }}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b pb-3"><Logo /><SheetClose asChild><Button variant="ghost" size="icon" className="size-11" aria-label="Close menu" title="Close menu"><X className="size-6" /></Button></SheetClose></div>
          <SheetTitle className="mb-5 mt-8 text-xs font-medium text-muted-foreground">{signedIn ? (name ? `Hi, ${name}` : "My PeakWiFi") : "Explore PeakWiFi"}</SheetTitle>
          <nav aria-label="Mobile navigation" className="flex flex-col">
            {["Packages", "Coverage", "Support", "Contact", "Sales"].map((label, index) => <Button key={label} asChild variant="ghost" className="menu-link group h-auto justify-between rounded-none border-b px-0 py-4 text-left text-3xl font-semibold hover:bg-transparent hover:text-accent"><a href={`#${label.toLowerCase()}`} onClick={event => { event.preventDefault(); target.current = label.toLowerCase(); setOpen(false); }}><span className="flex items-center gap-4"><span className="text-[10px] font-medium text-accent">0{index + 1}</span>{label}</span><ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></a></Button>)}
          </nav>
          <div className="mt-auto pt-8">
            {signedIn ? <Button variant="outline" className="h-12 w-full justify-between" onClick={() => { setOpen(false); onSignOut?.(); }}>Sign out<LogOut /></Button> : <SheetClose asChild><Button asChild variant="hero" className="h-12 w-full justify-between"><Link to="/auth">Get connected<ArrowRight /></Link></Button></SheetClose>}
            <a href="tel:+254798091838" className="mt-5 flex items-center justify-between text-xs text-muted-foreground"><span>Talk to PeakWiFi</span><span>+254 798 091 838</span></a>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </header>;
}