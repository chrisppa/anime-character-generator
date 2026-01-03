import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, key, sizeBytes } = body;
    if (!name || !key) return new Response(JSON.stringify({ error: "name and key required" }), { status: 400 });

    const lora = await prisma.lora.create({
      data: {
        name,
        description: body.description ?? null,
        tags: Array.isArray(body.tags) ? body.tags : typeof body.tags === "string" ? body.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        nsfw: Boolean(body.nsfw) || false,
        modelType: body.modelType ?? "LORA",
        baseModel: body.baseModel ?? null,
        resourceHashes: body.resourceHashes ?? null,
        fileKey: key,
        sizeBytes,
        trainingDataKey: body.trainingDataKey ?? null,
        trainingDataSizeBytes: body.trainingDataSizeBytes ?? null,
      },
    });
    return Response.json(lora);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "failed" }), { status: 500 });
  }
}
