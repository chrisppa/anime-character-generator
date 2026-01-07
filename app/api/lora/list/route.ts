import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const list = await prisma.lora.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: true },
    });
    const base = env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
    const result = list.map((l) => ({
      id: l.id,
      name: l.name,
      description: l.description,
      nsfw: l.nsfw,
      modelType: l.modelType,
      baseModel: l.baseModel,
      downloads: l.downloads,
      ratingSum: l.ratingSum,
      ratingCount: l.ratingCount,
      ratingAvg: l.ratingCount ? l.ratingSum / l.ratingCount : 0,
      coverUrl: l.coverKey && base ? `${base}/${encodeURIComponent(l.coverKey)}` : null,
      uploader: l.user?.email ? l.user.email.split("@")[0] : null,
      createdAt: l.createdAt,
    }));
    return Response.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "failed";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
