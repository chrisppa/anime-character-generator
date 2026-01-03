import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { auth } from "@/auth";
import { getSignedGetUrl } from "@/lib/r2";
import { inference } from "@/lib/inference/provider";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, type = "txt2img", loraId, negativePrompt } = body;
    if (!prompt) return new Response(JSON.stringify({ error: "prompt required" }), { status: 400 });

    // Resolve LoRA signed URL if provided
    let loraUrl: string | undefined;
    if (loraId) {
      const lora = await prisma.lora.findUnique({ where: { id: loraId } });
      if (!lora) return new Response(JSON.stringify({ error: "lora not found" }), { status: 404 });
      loraUrl = await getSignedGetUrl(lora.fileKey);
    }

    // Create job record
    // associate user when available
    const session = await auth();
    let userId: string | undefined = undefined;
    if (session?.user?.email) {
      const user = await prisma.user.upsert({
        where: { email: session.user.email },
        update: {},
        create: { email: session.user.email },
      });
      userId = user.id;
    }

    const job = await prisma.job.create({
      data: {
        prompt,
        type,
        status: "queued",
        provider: env.INFERENCE_PROVIDER,
        userId,
      },
    });

    // Submit to inference provider (fire-and-forget for speed)
    // Optional numeric params with basic sanitation
    const width = Number(body.width) || undefined;
    const height = Number(body.height) || undefined;
    const steps = Number(body.steps) || undefined;
    const cfgScale = Number(body.cfgScale) || undefined;
    const seed = body.seed !== undefined && body.seed !== "" ? Number(body.seed) || body.seed : undefined;

    const result = await inference.submit({
      prompt,
      type,
      loraUrl,
      negativePrompt,
      width,
      height,
      steps,
      cfgScale,
      seed,
    });

    await prisma.job.update({
      where: { id: job.id },
      data: { providerJobId: result.providerJobId, status: result.status, error: result.error || undefined },
    });

    return Response.json({ jobId: job.id, providerJobId: result.providerJobId });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "failed";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
