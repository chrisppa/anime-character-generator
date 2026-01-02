export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  INFERENCE_PROVIDER: (process.env.INFERENCE_PROVIDER || "runware").toLowerCase(),
  RUNWARE_API_KEY: process.env.RUNWARE_API_KEY,
  FAL_KEY: process.env.FAL_KEY,
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID!,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID!,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY!,
  R2_BUCKET: process.env.R2_BUCKET!,
  R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL || "",
};

