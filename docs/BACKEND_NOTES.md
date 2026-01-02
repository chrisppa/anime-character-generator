Backend MVP overview

- API routes under `app/api/`
  - `POST /api/lora/sign` → presigned PUT to R2; returns `{ key, uploadUrl }`
  - `POST /api/lora/register` → persist LoRA record `{ name, key }`
  - `POST /api/jobs/submit` → create Job and submit to provider; returns `{ jobId, providerJobId }`
  - `GET /api/jobs/:id/status` → returns `{ status, imageUrl? }` and polls provider once
- Providers: choose via `INFERENCE_PROVIDER=runware|fal`
- Storage: Cloudflare R2 (S3-compatible) with presigned GET/PUT
- DB: Postgres (Neon) with Prisma schema in `prisma/schema.prisma`
- Auth: optional for MVP (user fields are nullable)

Environment variables are listed in `.env.example`.

