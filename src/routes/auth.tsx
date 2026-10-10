import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/peak/brand";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { normalizeKePhone } from "@/lib/wifi";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — PeakWiFi" },
      { name: "description", content: "Create your PeakWiFi account or sign in to get online." },
      { property: "og:title", content: "Sign in — PeakWiFi" },
      { property: "og:description", content: "Create your account and connect in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => data.session && navigate({ to: "/connect", replace: true }));
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const phone = normalizeKePhone(form.phone);
        if (!phone) throw new Error("Enter a valid M-Pesa number, e.g. 0712 345 678");
        const { error } = await supabase.auth.signUp({
          email: form.email, password: form.password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: form.name, phone } },
        });
        if (error) throw error;
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          const r = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
          if (r.error) throw r.error;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
      }
      navigate({ to: "/connect", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("Google sign-in failed");
    else if (!r.redirected) navigate({ to: "/connect", replace: true });
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col px-5 py-6">
      <Logo />
      <div className="mt-10">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {mode === "signup" ? "Get online in seconds" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signup" ? "One-time setup. We'll remember this device." : "Sign in to buy a package."}
        </p>
      </div>

      <Button variant="glass" size="xl" className="mt-8 w-full" onClick={google} type="button">
        Continue with Google
      </Button>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <>
            <Input className="h-12 rounded-xl" placeholder="Your name" autoComplete="name" value={form.name} onChange={set("name")} required />
            <Input className="h-12 rounded-xl" placeholder="M-Pesa number (07…)" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} required />
          </>
        )}
        <Input className="h-12 rounded-xl" type="email" placeholder="Email" autoComplete="email" value={form.email} onChange={set("email")} required />
        <Input className="h-12 rounded-xl" type="password" placeholder="Password (min 6)" minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"} value={form.password} onChange={set("password")} required />
        <Button variant="hero" size="xl" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          {mode === "signup" ? "Create account" : "Sign in"}
        </Button>
      </form>

      <button type="button" className="mt-6 text-center text-sm text-muted-foreground"
        onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
        {mode === "signup" ? "Already have an account? " : "New here? "}
        <span className="font-semibold text-primary">{mode === "signup" ? "Sign in" : "Create account"}</span>
      </button>
    </div>
  );
}
