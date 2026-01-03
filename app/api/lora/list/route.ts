import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const list = await prisma.lora.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    const base = env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
    const withUrls = list.map((l) => ({
      ...l,
      coverUrl: l.coverKey && base ? `${base}/${encodeURIComponent(l.coverKey)}` : null,
    }));
    return Response.json(withUrls);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "failed";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
