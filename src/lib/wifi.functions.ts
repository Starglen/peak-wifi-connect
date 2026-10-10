import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeExpiry, normalizeKePhone } from "./wifi";

/**
 * Starts an M-Pesa STK push for a package. Creates a pending purchase.
 * DEMO MODE: no Daraja credentials yet, so the push is simulated and
 * confirmed via confirmPayment. Replace with a Daraja call + callback route.
 */
export const initiatePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ packageId: z.string(), phone: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const phone = normalizeKePhone(data.phone);
    if (!phone) throw new Error("Enter a valid Safaricom number");
    const { data: pkg } = await context.supabase
      .from("packages").select("*").eq("id", data.packageId).single();
    if (!pkg) throw new Error("Package not found");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("purchases")
      .insert({ user_id: context.userId, package_id: pkg.id, phone, amount_kes: pkg.price_kes })
      .select("id").single();
    if (error) throw new Error("Could not start payment");
    await context.supabase.from("profiles").update({ phone }).eq("id", context.userId);
    return { purchaseId: row.id };
  });

export const confirmPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ purchaseId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: p } = await supabaseAdmin
      .from("purchases").select("*, packages(duration_minutes)")
      .eq("id", data.purchaseId).eq("user_id", context.userId).single();
    if (!p) throw new Error("Payment not found");
    if (p.status === "active") return { expiresAt: p.expires_at };
    const { data: current } = await supabaseAdmin
      .from("purchases").select("expires_at")
      .eq("user_id", context.userId).eq("status", "active")
      .order("expires_at", { ascending: false }).limit(1).maybeSingle();
    const now = new Date();
    const { startsAt, expiresAt } = computeExpiry(
      now, current?.expires_at ? new Date(current.expires_at) : null,
      (p.packages as { duration_minutes: number }).duration_minutes,
    );
    const ref = "DEMO" + Math.random().toString(36).slice(2, 10).toUpperCase();
    await supabaseAdmin.from("purchases").update({
      status: "active", mpesa_ref: ref,
      starts_at: startsAt.toISOString(), expires_at: expiresAt.toISOString(),
    }).eq("id", p.id);
    return { expiresAt: expiresAt.toISOString() };
  });
