import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getSignedGetUrl } from "@/lib/r2";
import { inference } from "@/lib/inference/provider";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, type = "txt2img", loraId, negativePrompt } = await req.json();
    if (!prompt) return new Response(JSON.stringify({ error: "prompt required" }), { status: 400 });

    // Resolve LoRA signed URL if provided
    let loraUrl: string | undefined;
    if (loraId) {
      const lora = await prisma.lora.findUnique({ where: { id: loraId } });
      if (!lora) return new Response(JSON.stringify({ error: "lora not found" }), { status: 404 });
      loraUrl = await getSignedGetUrl(lora.fileKey);
    }

    // Create job record
    const job = await prisma.job.create({
      data: {
        prompt,
        type,
        status: "queued",
        provider: env.INFERENCE_PROVIDER,
      },
    });

    // Submit to inference provider (fire-and-forget for speed)
    const result = await inference.submit({ prompt, type, loraUrl, negativePrompt });

    await prisma.job.update({
      where: { id: job.id },
      data: { providerJobId: result.providerJobId, status: result.status, error: result.error || undefined },
    });

    return Response.json({ jobId: job.id, providerJobId: result.providerJobId });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "failed" }), { status: 500 });
  }
}
