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
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "failed" }), { status: 500 });
  }
}
