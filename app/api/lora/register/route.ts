import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, key, sizeBytes } = body;
    if (!name || !key) return new Response(JSON.stringify({ error: "name and key required" }), { status: 400 });

    // find or create user if signed in
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
        coverKey: body.coverKey ?? null,
        userId,
      },
    });
    return Response.json(lora);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "failed" }), { status: 500 });
  }
}
