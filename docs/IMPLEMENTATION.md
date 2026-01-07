# Implementation Overview

This document describes the current site implementation: UI structure, routes, database schema, storage, inference integration, and auth. It complements `docs/BACKEND_NOTES.md` with broader, end‑to‑end details.

## App Structure (App Router)

- `app/`
  - `page.tsx` — home composition (NavBar + Landing/Hero)
  - `events/` — listing and details
    - `page.tsx` — competitions grid and filters
    - `[id]/page.tsx` — event detail (cover, date range, type, links)
  - `models/` — model/LoRA library and details
    - `page.tsx` — consolidated grid (dynamic LoRAs + static demo cards)
    - `[id]/page.tsx` — LoRA detail server component
    - `[id]/Actions.tsx` — client component for Favorite, Rate, Download
  - `lora/upload/page.tsx` — upload & register LoRA (file + optional dataset + cover)
  - `profile/page.tsx` — user’s LoRAs (requires auth)
  - `api/` — REST endpoints (see Backend Notes)

## Components & UI Notes

- `components/NavBar.tsx` — desktop/mobile nav, GitHub sign‑in, user dropdown; “LoRAs” link removed in favor of unified `models` + details.
- `components/Landing/Hero.tsx` — generator UI:
  - Tabs (`txt2img`, `img2img`), prompt & negative prompt text areas
  - Settings: steps, CFG, seed, width, height
  - Base model select + LoRA select (populated from `/api/lora/list`)
  - Submit posts to `/api/jobs/submit` and polls `/api/jobs/[id]/status`
- `components/Footer.tsx` — CTA updated to `/api/auth/signin` (NextAuth v5).

### Models Grid (app/models/page.tsx)

- Renders a mixed grid:
  - Dynamic LoRAs from `/api/lora/list`: image/cover + real stats (ratingAvg/downloads), “View” opens `/models/[id]`
  - Static demo items from `public/images`: keep placeholder stats
- UI tweaks:
  - Eye icon for “View details” (replaces download symbol for navigation)
  - Removed non‑interactive 3‑dots

### LoRA Detail (app/models/[id]/page.tsx)

- Server component fetches LoRA via Prisma and computes `ratingAvg` and `coverUrl`.
- Client `Actions` for:
  - Favorite (POST `/api/lora/[id]/favorite`)
  - Rate 1..5 (POST `/api/lora/[id]/rate`)
  - Download LoRA & Dataset (GET `/api/lora/[id]/download|dataset` → signed URL)

## Database (Prisma)

- `User` — `email` unique, relations to `favorites`, `ratings`, `jobs`, `loras`, `events`.
- `Lora` — core metadata + storage keys + aggregates:
  - `downloads` (incremented via download endpoint)
  - `ratingSum`/`ratingCount` (updated via rating endpoint)
- `Favorite` — unique per `(userId, loraId)`
- `Rating` — unique per `(userId, loraId)` with `value` 1..5
- `Event` — competition metadata (type, date range, cover)
- `Job` — inference requests and results (status, imageUrl, providerJobId)

## Storage (Cloudflare R2)

- Presign via `lib/r2.ts` `getSignedPutUrl`/`getSignedGetUrl`.
- Direct browser PUT requires R2 CORS:
  - Origins: your Vercel domain and `http://localhost:3000`
  - Methods: `PUT, GET, HEAD` (and `POST` if needed)
  - AllowedHeaders: `*` (SDK uses `x-amz-*`)
  - ExposeHeaders: `ETag, x-amz-checksum-crc32`
- For CORS‑sensitive flows, use server upload: `POST /api/storage/upload` (multipart form to R2).

## Inference Providers

- Selected in `lib/inference/provider.ts` based on `env.INFERENCE_PROVIDER`.
- Runware (`lib/inference/runware.ts`):
  - Sends one `imageInference` task to `RUNWARE_GENERATE_URL` with `parameters`
  - Adds `parameters.lora_url` when a LoRA is selected (customize to your route’s “adapters” param if needed)
  - Polls `RUNWARE_STATUS_URL_TEMPLATE` for `taskUUID`/status
- FAL (`lib/inference/fal.ts`):
  - `POST {FAL_BASE}/{FAL_ROUTE}/requests` with `input` payload
  - Includes `lora_urls: [url]` when present
  - Tries common status endpoints (GET/POST variants) for compatibility
- Mock (`lib/inference/mock.ts`):
  - Returns a random site image after ~2s; no external calls

## Auth (NextAuth v5)

- `auth.ts` exports `{ handlers, auth, signIn, signOut }`
- GitHub provider; session callback attaches `user.id` from token subject
- v5 typing shim in code avoids v4‑only types; use `/api/auth/signin` to initiate login

## Events

- `/events` shows list with filters (All/Active/Upcoming/Archived)
- `/events/[id]` renders details (cover, date range, type, links)
- API supports GET/PATCH/DELETE; admin checks via `ADMIN_EMAIL`

## Known Constraints / TODOs

- Provider‑specific LoRA parameter names may differ (e.g., “adapters” for Runware). Adjust request payloads accordingly.
- /models grid shows placeholders for static demo items; you can remove or replace static assets as the DB grows.
- Optimistic UI for favorites/ratings not yet implemented; current Actions post and rely on page refresh/state re‑fetch.
- Consider SSR caching policies or `revalidatePath` once list/detail SLAs are clear.

## Environment & Build

- Next.js 16, React 19, TypeScript strict
- ESLint core‑web‑vitals + TypeScript rules (no `any` in source)
- Prisma client on `postinstall`; ensure migrations run before deploy
- Next/Image configured for R2 patterns in `next.config.ts`

