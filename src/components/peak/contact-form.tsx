import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema } from "@/lib/contact";
import { sendContactMessage } from "@/lib/contact.functions";

export function ContactForm() {
  const send = useServerFn(sendContactMessage);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const validated = contactSchema.safeParse(form);
    if (!validated.success) { setError(validated.error.issues[0]?.message ?? "Please check your message."); return; }
    setBusy(true); setError("");
    try { await send({ data: validated.data }); setSent(true); setForm({ name: "", email: "", message: "", website: "" }); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to send. Please try again."); }
    finally { setBusy(false); }
  }

  if (sent) return <div className="border-t py-8" role="status"><CheckCircle2 className="size-8 text-accent" /><h3 className="mt-4 text-xl font-bold">Message received.</h3><p className="mt-2 text-sm text-muted-foreground">Thank you for reaching out to PeakWiFi.</p><Button variant="link" className="mt-4 px-0 text-accent" onClick={() => setSent(false)}>Send another message<ArrowUpRight /></Button></div>;

  return <form onSubmit={submit} className="space-y-4" aria-label="Contact PeakWiFi">
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-2 text-xs text-muted-foreground"><span>Your name</span><Input required autoComplete="name" maxLength={100} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-12 text-foreground" /></label>
      <label className="space-y-2 text-xs text-muted-foreground"><span>Email</span><Input required type="email" autoComplete="email" maxLength={255} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="h-12 text-foreground" /></label>
    </div>
    <label className="block space-y-2 text-xs text-muted-foreground"><span>Your message or feedback</span><Textarea required maxLength={1000} rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="What's on your mind?" className="resize-y text-foreground" /></label>
    <label className="hidden" aria-hidden="true">Website<Input tabIndex={-1} autoComplete="off" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></label>
    {error && <p role="alert" className="text-xs text-warning">{error}</p>}
    <div className="flex items-center justify-between gap-3"><p className="text-[11px] text-muted-foreground">Please don't share your M-Pesa PIN.</p><Button variant="hero" disabled={busy} type="submit">{busy ? <Loader2 className="animate-spin" /> : <ArrowUpRight />}{busy ? "Sending…" : "Send message"}</Button></div>
  </form>;
}