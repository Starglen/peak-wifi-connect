<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Purchases are written only by server functions (service role); clients can only read their own rows — prevents users granting themselves time.
- Session countdown derives from the cached `expires_at` in localStorage and re-syncs online — works offline in captive-portal contexts.
- New package time stacks on the latest active expiry (`computeExpiry` in src/lib/wifi.ts) — single source of truth, covered by tests.
- Payment confirmation is currently simulated (`confirmPayment`); the real M-Pesa Daraja callback must replace it via a `/api/public/` route that verifies the provider.
- Captive-portal params (mac, ip, link-login) are captured on landing and used to hand off to the router after payment.
