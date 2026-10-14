import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, MapPin, Phone, Mail, ArrowRight, Wifi, CreditCard, Headphones } from "lucide-react";
import { Logo } from "@/components/peak/brand";
import { Button } from "@/components/ui/button";
import { websitePlans, SUPPORT_WHATSAPP } from "@/lib/website-plans";

export function SectionNavigation() {
  return <nav aria-label="Explore PeakWiFi" className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground lg:justify-end">
    {["Packages", "Coverage", "Support", "Contact", "Sales"].map(label => <Button key={label} variant="link" size="sm" asChild className="section-nav-link h-8 px-0 text-muted-foreground hover:text-accent hover:no-underline"><a href={`#${label.toLowerCase()}`}>{label}</a></Button>)}
  </nav>;
}

export function WebsiteSections({ signedIn = false }: { signedIn?: boolean }) {
  return <div>
    <section id="packages" className="scroll-mt-24 border-t py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="section-kicker">01 / YOUR NEXT CONNECTION</p><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Small prices. Big possibilities.</h2></div><span className="flex items-center gap-2 text-xs text-accent"><CreditCard className="size-4" />Pay with M-Pesa</span></div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{websitePlans.map(plan => <div key={plan.id} className={`relative flex flex-col rounded-lg border p-6 ${plan.id === "24h" ? "border-accent/50 bg-accent/5" : "bg-card"}`}>
        <div className="flex items-center justify-between gap-3"><Wifi className="size-5 text-accent" />{plan.id === "24h" && <span className="text-[11px] font-semibold text-accent">EVERYDAY FAVOURITE</span>}</div>
        <h3 className="mt-5 text-base font-bold">{plan.name}</h3><p className="mt-2 text-xs text-muted-foreground">{plan.detail}</p>
        <p className="mb-6 mt-6 flex items-baseline gap-2"><span className="text-xs text-muted-foreground">KES</span><span className="text-4xl font-extrabold tabular-nums">{plan.price.toLocaleString()}</span></p>
        <Button asChild variant={plan.id === "24h" ? "hero" : "outline"} className="mt-auto w-full">{plan.id === "home-monthly" ? <a href={`${SUPPORT_WHATSAPP}?text=I'd%20like%20the%20Home%20Monthly%20Unlimited%20plan`} target="_blank" rel="noreferrer">Check home coverage<ArrowUpRight /></a> : <Link to={signedIn ? "/connect" : "/auth"} {...(signedIn ? { search: { pkg: plan.id } } : {})}>Choose plan<ArrowRight /></Link>}</Button>
      </div>)}</div>
    </section>
    <section id="coverage" className="scroll-mt-24 border-t py-16 sm:py-20">
      <p className="section-kicker">02 / CLOSE TO HOME</p><div className="mt-3 grid gap-8 lg:grid-cols-2"><div><h2 className="text-3xl font-extrabold sm:text-4xl">Your neighbourhood.<br />Our network.</h2><p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">From a quick connection in town to internet for your home, we're bringing fast, affordable access closer to you.</p><Button asChild variant="link" className="mt-5 px-0 text-accent"><a href={`${SUPPORT_WHATSAPP}?text=Please%20confirm%20coverage%20in%20my%20area`} target="_blank" rel="noreferrer">Check your exact location<ArrowUpRight /></a></Button></div>
      <ul className="divide-y border-y">{["Kwa Vonza", "Kitui Town", "Machakos", "Makueni"].map((place, i) => <li key={place} className="flex items-center justify-between gap-4 py-5"><span className="flex items-center gap-4"><span className="text-[11px] tabular-nums text-muted-foreground">0{i + 1}</span><span className="text-lg font-semibold">{place}</span></span><MapPin className="size-4 text-accent" /></li>)}</ul></div>
    </section>
    <section id="support" className="scroll-mt-24 border-t py-16 sm:py-20">
      <p className="section-kicker">03 / PEOPLE, NOT ROBOTS</p><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">A little help goes a long way.</h2><p className="mt-4 text-sm text-muted-foreground">Local support for connection problems, payments and coverage questions.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">{[{ icon: Wifi, title: "Connection help", detail: "Let's get you back online.", text: "I need help connecting" }, { icon: CreditCard, title: "Billing & payments", detail: "Questions about a payment or renewal?", text: "I need help with a payment" }, { icon: Headphones, title: "Coverage & setup", detail: "Find out what's available where you live.", text: "I need help with coverage" }].map(({ icon: Icon, title, detail, text }) => <div key={title} className="border-t pt-5"><Icon className="size-5 text-primary" /><h3 className="mt-4 font-bold">{title}</h3><p className="mt-2 text-xs text-muted-foreground">{detail}</p><Button asChild variant="link" className="mt-3 px-0 text-accent"><a href={`${SUPPORT_WHATSAPP}?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">Talk to us<ArrowUpRight /></a></Button></div>)}</div>
    </section>
    <section id="sales" className="scroll-mt-24 border-t py-16 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-2"><div><p className="section-kicker">04 / MAKE YOURSELF AT HOME</p><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Home internet.<br />Without the extra hassle.</h2><p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">Work, stream, chat and game with fast speeds. Equipment included and no extra monthly fees.</p><Button asChild variant="hero" className="mt-6"><a href={`${SUPPORT_WHATSAPP}?text=I'd%20like%20a%20quote%20for%20home%20internet`} target="_blank" rel="noreferrer">Request a quote<ArrowUpRight /></a></Button></div>
      <ol className="space-y-5">{["Confirm coverage with our team", "Choose your plan and pay via M-Pesa", "Installation and setup within 24–48 hours", "Enjoy unlimited home internet"].map((text, i) => <li key={text} className="flex items-center gap-4 border-b pb-5"><span className="grid size-9 shrink-0 place-items-center rounded-full border text-xs text-accent">0{i + 1}</span><span className="text-sm font-medium">{text}</span></li>)}</ol></div>
    </section>
    <section id="contact" className="scroll-mt-24 border-t py-16">
      <p className="section-kicker">05 / LET'S TALK</p><div className="mt-3 flex flex-wrap justify-between gap-8"><h2 className="text-3xl font-extrabold sm:text-4xl">Connecting you, always.</h2><div className="space-y-3 text-sm">
        <a className="flex items-center gap-3 hover:text-accent" href="tel:+254798091838"><Phone className="size-4 text-accent" />+254 798 091 838</a><a className="flex items-center gap-3 hover:text-accent" href="tel:+254758412300"><Phone className="size-4 text-accent" />+254 758 412 300</a><a className="flex items-center gap-3 break-all hover:text-accent" href="mailto:info@broadlinkpeakwifi.co.ke"><Mail className="size-4 shrink-0 text-accent" />info@broadlinkpeakwifi.co.ke</a><p className="flex items-center gap-3"><MapPin className="size-4 text-accent" />Kwa Vonza, Kitui</p>
      </div></div>
    </section>
    <footer className="border-t py-8"><div className="flex flex-wrap items-center justify-between gap-5"><Logo /><SectionNavigation /></div><div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t pt-5 text-[11px] text-muted-foreground"><span>© {new Date().getFullYear()} Broadlink PeakWiFi</span><span className="flex items-center gap-2"><Check className="size-3 text-accent" />Reliable. Affordable. Always connected.</span></div></footer>
  </div>;
}