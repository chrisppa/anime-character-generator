import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { auth } from "@/auth";
export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const l = await prisma.lora.findUnique({ where: { id } });
    if (!l) return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
    const session = await auth();
    const base = env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
    const coverUrl = l.coverKey && base ? `${base}/${encodeURIComponent(l.coverKey)}` : null;
    const fileUrl = l.fileKey && base ? `${base}/${encodeURIComponent(l.fileKey)}` : null;
    const datasetUrl = l.trainingDataKey && base ? `${base}/${encodeURIComponent(l.trainingDataKey)}` : null;

    let isFavorite = false;
    let myRating: number | null = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (user) {
        const fav = await prisma.favorite.findUnique({ where: { userId_loraId: { userId: user.id, loraId: l.id } } });
        isFavorite = Boolean(fav);
        const rating = await prisma.rating.findUnique({ where: { userId_loraId: { userId: user.id, loraId: l.id } } });
        myRating = rating?.value ?? null;
      }
    }

    const ratingAvg = l.ratingCount ? l.ratingSum / l.ratingCount : 0;
    return Response.json({
      ...l,
      coverUrl,
      fileUrl,
      datasetUrl,
      isFavorite,
      myRating,
      ratingAvg,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "failed";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
