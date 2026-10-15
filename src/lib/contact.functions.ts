import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { contactSchema } from "./contact";

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!url || !key) throw new Error("Messages are unavailable right now. Please contact us on WhatsApp.");
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      } },
    });
    const { error } = await client.rpc("submit_contact_message", { p_name: data.name, p_email: data.email, p_message: data.message });
    if (error) throw new Error(error.message.includes("wait one minute") ? "Please wait one minute before sending another message." : "Your message wasn't sent. Please try again or contact us on WhatsApp.");
    return { sent: true };
  });