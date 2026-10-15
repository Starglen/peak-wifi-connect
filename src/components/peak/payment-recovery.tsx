import { useState } from "react";
import { ArrowUpRight, ChevronDown, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { receiptSchema } from "@/lib/contact";
import { SUPPORT_WHATSAPP } from "@/lib/website-plans";

export function PaymentRecovery() {
  const [open, setOpen] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [error, setError] = useState("");
  function requestCheck(event: React.FormEvent) {
    event.preventDefault();
    const parsed = receiptSchema.safeParse(receipt);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check your receipt code."); return; }
    setError("");
    window.open(`${SUPPORT_WHATSAPP}?text=${encodeURIComponent(`My M-Pesa payment hasn't reflected. Please verify transaction ${parsed.data} for my PeakWiFi package.`)}`, "_blank", "noopener,noreferrer");
  }
  return <div className="mt-5 border-t pt-2">
    <Button variant="ghost" className="h-11 w-full justify-between px-0 text-xs text-muted-foreground" aria-expanded={open} aria-controls="payment-recovery" onClick={() => setOpen(!open)}><span className="flex items-center gap-2"><ReceiptText className="size-4" />Paid, but not connected?</span><ChevronDown className={open ? "rotate-180 transition-transform" : "transition-transform"} /></Button>
    {open && <form id="payment-recovery" onSubmit={requestCheck} className="space-y-3 pb-2"><p className="text-xs leading-relaxed text-muted-foreground">Don't pay again. Send your M-Pesa transaction code to our team so we can check the payment.</p><label className="block space-y-2 text-xs"><span>M-Pesa transaction code</span><Input value={receipt} onChange={e => setReceipt(e.target.value)} maxLength={10} autoCapitalize="characters" placeholder="e.g. QJK12ABC34" required /></label>{error && <p role="alert" className="text-xs text-warning">{error}</p>}<Button type="submit" variant="outline" size="sm">Request payment check<ArrowUpRight /></Button><p className="text-[11px] text-muted-foreground">Our team must verify the payment before activating your package. Never share your PIN.</p></form>}
  </div>;
}