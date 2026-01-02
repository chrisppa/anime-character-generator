import { env } from "@/lib/env";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export const r2 = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export async function getSignedPutUrl(key: string, contentType: string, expiresIn = 60 * 5) {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(r2, command, { expiresIn });
  return url;
}

export async function getSignedGetUrl(key: string, expiresIn = 60 * 10) {
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
  });
  const url = await getSignedUrl(r2, command, { expiresIn });
  return url;
}

export function publicUrlFor(key: string) {
  if (!env.R2_PUBLIC_BASE_URL) return "";
  return `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${encodeURIComponent(key)}`;
}

