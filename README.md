# AniMind — Anime Character Generator (WIP)

<p align="center">
  <img src="public/images/animind_logo.png" alt="AniMind Logo" height="64" />
  
</p>

AniMind is an early‑stage, UI‑first Next.js project for anime character generation. The current focus is on getting the interface right for generating images with existing models, while leaving room to expand into user‑provided LoRAs and training workflows in the future.

Status: actively evolving, pre‑alpha. Expect breaking changes while the core UX and component structure solidify.

## Sponsor

If you find this project useful and want to support development, you can sponsor via Ko‑fi:

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/chrisppa)

## What’s Here Today

- Generation UI: tabs for txt2img, img2img, and inpainting with prompt fields, steps/CFG/seed inputs, and a model/LoRA selector.
- 3D Hero: a mecha GLB rendered in the background using @react-three/fiber and @react-three/drei.
- Sample Media: optional “gallery cloud” layout for showcasing generated images (disabled by default), plus a utility script to autogenerate image exports.

Note: This repo is currently front‑end focused. Hook the “Start Generate” button to your inference backend to perform actual generation. The UI is structured so you can wire up your API later without large refactors.

## Roadmap (High‑Level Intent)

These items are not implemented yet; they guide where the project is headed:

- User LoRAs: allow uploads, selection, and basic metadata management.
- LoRA Training: dataset prep, training jobs, and model versioning (likely via a background queue and storage).
- Job Control: status/progress, history, and reproducible settings.
- Auth & Quotas: user accounts, credits/limits, and moderation.
- Share & Showcase: curated gallery with prompts/settings.

## Tech Stack

- Next.js (App Router), React 19
- Tailwind CSS v4
- Three.js via @react-three/fiber and @react-three/drei
- class‑variance‑authority, tailwind‑merge, react‑rough‑notation, lucide‑react

## Project Structure (Highlights)

- `app/` — app router entry points and global styles
  - `app/page.tsx` — home page composition (NavBar + Hero)
  - `app/layout.tsx` — fonts, theme, and global CSS
- `components/`
  - `Hero.tsx` — main generation UI and 3D hero canvas
  - `NavBar.tsx` — simple header
  - `ui/` — shared UI (e.g., `button.tsx`, `MaxWidthWrapper.tsx`, optional `GalleryCloud.tsx`)
- `public/`
  - `3D/` — GLB model and generated React component (`Mecha.jsx`)
  - `images/` — sample images and `index.ts` for named imports
  - `fonts/` — local fonts and font loader
- `generateImageIndex.js` — regenerates `public/images/index.ts` for easy imports
- `next.config.ts` — includes `transpilePackages: ['three']` for R3F compatibility

## Getting Started

Requirements: Node.js 18+ recommended

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000

Build and start:

```bash
npm run build
npm start
```

## Using the UI (Current Flow)

1. Pick a tab: txt2img, img2img, or inpainting (UI placeholders are present for all three).
2. Fill prompts: positive and negative prompt text areas.
3. Tune settings: steps, CFG scale, and seed.
4. Choose a model: switch between base/LoRA options in the dropdown.
5. Click “Start Generate”: wire this to your backend API to kick off generation and return an image.

The UI is intentionally decoupled from any specific inference service. You can integrate a local server (e.g., ComfyUI workflow API), a hosted provider, or your own service.

## Optional: Sample Gallery Cloud

The `GalleryCloud` component displays scrolling columns of images.

- Add or replace images under `public/images/`.
- Run `node generateImageIndex.js` to regenerate `public/images/index.ts` (named exports for each image file).
- Import and render `GalleryCloud` inside `Hero.tsx` to enable it.

## 3D Model Notes

- The hero loads a GLB via `useGLTF`. Keep static file paths aligned with the `public/` directory structure.
- If you see an error like “Could not load /mecha-transformed.glb… 404 Not Found”, make sure the path includes the subfolder:
  - `useGLTF("/3D/mecha-transformed.glb")`
  - `useGLTF.preload("/3D/mecha-transformed.glb")`

## Development Tips

- Asset Imports: Static files in `public/` are served from the site root (`/`). Subfolders matter and paths are case‑sensitive.
- Three.js: Versions of `three`, `@react-three/fiber`, and `@react-three/drei` should remain compatible; the config transpiles `three` to avoid build issues.
- Styling: Tailwind CSS v4 is enabled via `app/globals.css` along with custom CSS variables.

## Backend MVP (Built‑in)

The repo includes a minimal backend using Next.js route handlers so you can run end‑to‑end generation without a separate service.

What’s included
- Prisma + Postgres schema: `prisma/schema.prisma`
- R2 (S3‑compatible) signed uploads/reads: `lib/r2.ts`
- Pluggable inference providers (Runware or fal.ai): `lib/inference/*`
- API routes:
  - `POST /api/lora/sign` → presigned PUT for LoRA upload
  - `POST /api/lora/register` → save LoRA metadata to DB
  - `POST /api/jobs/submit` → create job + submit to provider
  - `GET /api/jobs/:id/status` → poll provider once and persist

Setup (local)
1) Copy envs: `cp .env.example .env.local` and fill values
   - `DATABASE_URL` (Neon Postgres)
   - `INFERENCE_PROVIDER=runware` (or `fal`)
   - `RUNWARE_API_KEY` or `FAL_KEY`
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`
2) Install deps: `npm install`
3) Generate DB client: `npm run prisma:generate`
4) Create tables: `npm run prisma:migrate` (or `npm run prisma:push`)
5) Run dev: `npm run dev`

Basic flow
1) Upload LoRA: `POST /api/lora/sign` → PUT file to `uploadUrl` → `POST /api/lora/register`
2) Submit job: `POST /api/jobs/submit { prompt, type: "txt2img", loraId }`
3) Poll status: `GET /api/jobs/{jobId}/status` → returns `status` and `imageUrl` when done

Notes
- Auth is optional for MVP; userId fields are nullable. You can add Auth.js later.
- Providers use placeholder model routes; pick Runware/fal and adjust model IDs as needed.

## Recent Changes (Jan 3, 2026)

- Events System
  - Prisma model + API: `GET/POST /api/events`, `GET/PATCH/DELETE /api/events/[id]`
  - Server‑side cover uploads: `POST /api/storage/upload` (avoids R2 CORS)
  - Public listing `/events` (filters: All/Active/Upcoming/Archived, default All)
  - Card CTA links to `event.url` when present; details page at `/events/[id]`
  - Admin‑only management `/events/manage` (Create, table with Edit/Delete)
  - Admin link in nav for `ADMIN_EMAIL`
- Auth Migration (NextAuth v5 app router)
  - Root `auth.ts` exports `{ handlers, auth, signIn, signOut }`
  - Route handler at `app/api/auth/[...nextauth]/route.ts`
  - Header shows GitHub avatar/name; profile page `/profile` lists user LoRAs
- LoRA Workflow
  - Upload with metadata (description, tags, NSFW, model type, base model), optional training zip and cover image
  - Listing pages `/models/lora` (with Hide NSFW) and merged dynamic covers in `/models`
  - Generator supports LoRA selection and params (width/height/steps/seed/CFG + negative prompt)
- Inference + Debugging
  - Configurable Runware/FAL providers + mock provider for demos
  - Status/error surfacing; dynamic route params normalization for Next 16

## Prisma on Vercel / CI

- Vercel caches dependencies and may skip Prisma's auto‑generation. To avoid `PrismaClientInitializationError` during build, we:
  - Run `prisma generate` on `postinstall` (see `package.json`)
  - Run `npx prisma generate` in CI before `next build` (see `.github/workflows/ci.yml`)
  - If you add new models, re‑deploy to trigger generation with the latest schema.

## Admin Access

- Set `ADMIN_EMAIL` in env (default: `cturyasiima@gmail.com`). Admin‑only features:
  - Nav link: “Manage Events”
  - `/events/manage` (create, edit, delete events)

## Notable Routes

- Events: `/events` (list), `/events/[id]` (details), `/events/manage` (admin)
- LoRA: `/lora/upload`, `/models/lora`, `/profile` (your LoRAs)
- API: `/api/events`, `/api/events/[id]`, `/api/storage/upload`

## Attribution & Licenses

- 3D model: “Mecha Girl Warrior” by Chenchanchong — CC‑BY‑4.0
  - Author: https://sketchfab.com/Chenchanchong
  - Source: https://sketchfab.com/3d-models/mecha-girl-warrior-a6a8b11defe647b38404fc6c3df50f01
  - License: http://creativecommons.org/licenses/by/4.0/
- Fonts: Druk Condensed (trial files in `public/fonts`) — ensure your usage complies with its license. Inter is loaded via `next/font/google`.

## Contributing / Planning

This is a starting project while the broader plan is being fleshed out. Issues and PRs are welcome for:

- UX refinements, accessibility, and responsive layout tweaks
- Hooking the “Start Generate” action to a chosen backend
- Adding plumbing for img2img/inpainting inputs and masks
- Implementing job status, history, and downloads

If you’re exploring LoRA support, please open a discussion with proposed UX and data‑flow before diving into implementation.

## Governance & Policies

- Code of Conduct: see `CODE_OF_CONDUCT.md`
- Contributing Guide: see `CONTRIBUTING.md`
- Security Policy: see `SECURITY.md` (use the private advisory link for vulnerabilities)
- License: MIT (see `LICENSE`)
