# Peak WiFi Connect

Upgrade https://www.broadlinkpeakwifi.co.ke/       I want you to pull every info of this landing page and be creative with what you do . You are the engineer you know what to do and the screen to add on the same mostly when user logs in what they see and the logic  then

Build a premium, minimalist web app for PeakWiFi — a WiFi hotspot billing and 

connection platform.

BRAND

Blue + green theme, modern and refined (not flat/generic). Clean sans-serif 

font (Inter/Manrope). Minimalist, mobile-first, trustworthy, fast-loading.

CORE FLOW (simplify this)

1. User creates account 

2. User picks a package, pays via M-Pesa STK push they pay to +254 798 091 838 

3. On successful payment, auto-connect — no manual code entry, no second login

4. Returning users stay authenticated via session/token — only need to log in 

   once per device; after that they just buy new packages when expired



SESSION COUNTDOWN

Time/data remaining is time-based and runs continuously, online or offline. 

When offline, calculate it locally from the last known expiry timestamp; 

re-sync with the server once back online. Show a subtle "last synced" cue when 

not live — no separate offline screen needed.

UX PRINCIPLES

Minimal typing, obvious next action on every screen, clear loading/error 

states, mobile-first.

TECHNICAL

Use Supabase for auth and session/package data. Design for captive-portal 

redirect context.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b74e07d0-9a65-4aed-9f41-6c11710955f7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
