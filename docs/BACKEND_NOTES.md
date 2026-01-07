Backend overview (current)

- API routes under `app/api/`
  - LoRA upload + metadata
    - `POST /api/lora/sign` → presigned PUT to R2; body `{ filename, contentType, kind }` returns `{ key, uploadUrl }`
      - kind: `loras` (default), `training` (dataset zip), `cover`, `eventCover`
    - `POST /api/lora/register` → persist LoRA record; body includes `{ name, key, sizeBytes, description?, tags?, nsfw?, modelType?, baseModel?, trainingDataKey?, trainingDataSizeBytes?, coverKey? }`
    - `POST /api/storage/upload` → server-side upload to R2 via multipart `FormData` (`file`, `kind`) to bypass browser CORS (useful for covers / small files).
  - LoRA listing + details + interactions
    - `GET /api/lora/list` → recent LoRAs (50); includes `coverUrl` and `ratingAvg`.
    - `GET /api/lora/[id]` → full details `{ ..., coverUrl, fileUrl, datasetUrl, ratingAvg, isFavorite, myRating }`.
    - `POST /api/lora/[id]/favorite` → toggle favorite for current user.
    - `POST /api/lora/[id]/rate` → rate 1..5; upserts rating and updates aggregates.
    - `GET /api/lora/[id]/download` → increments downloads and returns signed GET URL.
    - `GET /api/lora/[id]/dataset` → signed GET URL for training dataset (if present).
  - Job submission + status
    - `POST /api/jobs/submit` → create Job and submit to provider; returns `{ jobId, providerJobId? }`.
    - `GET /api/jobs/:id/status` → returns `{ status, imageUrl?, error? }` and polls provider once.
  - Events
    - `GET /api/events` → list with derived `status` (Upcoming/Ongoing/Ended), filter via `?filter=all|active|upcoming|archived`.
    - `GET /api/events/[id]` → details with `coverUrl`.
    - `PATCH /api/events/[id]` → admin-only updates (typed to Prisma `EventUpdateInput`).
    - `DELETE /api/events/[id]` → admin-only delete.
  - Auth
    - `GET/POST /api/auth/[...nextauth]` → Auth.js (NextAuth v5) handlers; use `/api/auth/signin` to initiate login.

- Inference providers (pluggable)
  - Choose with `INFERENCE_PROVIDER=runware|fal|mock` (default falls back to Runware if unset).
  - Runware (`lib/inference/runware.ts`)
    - Submits a single `imageInference` task; passes `prompt`, `negative_prompt`, `width/height/steps/guidance_scale/seed`.
    - If a LoRA is selected, includes `parameters.lora_url` (adjust this to provider-specific “adapters” param if required by your route).
  - FAL (`lib/inference/fal.ts`)
    - Submits to `FAL_BASE/FAL_ROUTE/requests`; includes `input.prompt`, `input.negative_prompt`, and `lora_urls: [url]` when present.
    - Status endpoints try common variants (GET/POST) to accommodate route differences.
  - Mock (`lib/inference/mock.ts`) – development only; returns a random image with a short delay.

- Storage: Cloudflare R2 (S3-compatible)
  - Signing via AWS SDK v3 in `lib/r2.ts`.
  - GET presign: `getSignedGetUrl(key)`; PUT presign: `getSignedPutUrl(key, contentType)`.
  - CORS for direct uploads: add a rule on the bucket with your origins, methods `PUT,GET,HEAD` (and `POST` if needed), `AllowedHeaders: ["*"]`, and expose headers (e.g., `ETag`, `x-amz-checksum-crc32`).

- Database: Postgres (Neon) + Prisma (`prisma/schema.prisma`)
  - Models
    - `User { id, email, ..., favorites[], ratings[] }`
    - `Lora { id, name, description?, tags[], nsfw, modelType, baseModel?, resourceHashes?, fileKey, sizeBytes?, trainingDataKey?, trainingDataSizeBytes?, coverKey?, userId?, downloads, ratingSum, ratingCount, createdAt }`
    - `Favorite { id, userId, loraId, createdAt }` with `@@unique([userId, loraId])`
    - `Rating { id, userId, loraId, value(1..5), createdAt }` with `@@unique([userId, loraId])`
    - `Event { id, title, description?, type, startAt, endAt, participants?, prizePool?, url?, coverKey?, userId?, createdAt, updatedAt }`
    - `Job { id, prompt, type, status, provider, providerJobId?, imageUrl?, error?, userId?, loraId?, createdAt, updatedAt }`
  - Aggregates
    - `Lora.ratingAvg = ratingCount ? ratingSum / ratingCount : 0`
    - `Lora.downloads` updated by `/api/lora/[id]/download`.

- Auth: NextAuth v5 (App Router)
  - Root `auth.ts` initializes providers and exports `{ handlers, auth, signIn, signOut }`.
  - We avoid importing v4-only types and use a minimal typed shim for config/result due to v5 type surface.
  - `/profile` and protected routes check `await auth()`; session shape extended to include `user.id`.

- Next.js 16 handler notes
  - Route handler context params are asynchronous: `{ params }: { params: Promise<{ id: string }> }` (we await `params`).
  - Remove any legacy URL-encoded dynamic folders (e.g., `%5Bid%5D`) and use `[id]`.

- Environment variables (see `.env.example`)
  - Database: `DATABASE_URL`
  - R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`
  - Inference: `INFERENCE_PROVIDER`, `RUNWARE_API_KEY`, `RUNWARE_*` (optional overrides), `FAL_KEY`, `FAL_ROUTE`
  - Auth: `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
  - Admin: `ADMIN_EMAIL`

Operational tips

- Migrations: run `npm run prisma:migrate` (or `npm run prisma:push`) when schema changes.
- CI/Build: ensure `prisma generate` runs (we run on `postinstall`).
- CORS: for direct uploads, configure R2 CORS as described above; otherwise, use `/api/storage/upload`.
- Images: Next/Image is configured for R2 hosts in `next.config.ts` `images.remotePatterns`.
