import { NextRequest } from "next/server";
import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";
import { auth } from "@/auth";

function folderFor(kind?: string) {
  switch (kind) {
    case "training":
      return "training";
    case "cover":
      return "loras/covers";
    case "eventCover":
      return "events/covers";
    default:
      return "loras";
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const kind = (form.get("kind") as string | null) || undefined;
    if (!file) return new Response("file is required", { status: 400 });

    const key = `${folderFor(kind)}/${Date.now()}-${file.name}`;
    const contentType = (file.type && file.type.length ? file.type : "application/octet-stream");
    const arrayBuffer = await file.arrayBuffer();
    const body = Buffer.from(arrayBuffer);

    await r2.send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );

    const base = env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
    const url = base ? `${base}/${encodeURIComponent(key)}` : undefined;
    return Response.json({ key, url });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "failed" }), { status: 500 });
  }
}

