import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  try {
    const user = await prisma.user.upsert({ where: { email: session.user.email }, update: {}, create: { email: session.user.email } });
    const existing = await prisma.favorite.findUnique({ where: { userId_loraId: { userId: user.id, loraId: id } } });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return Response.json({ isFavorite: false });
    } else {
      await prisma.favorite.create({ data: { userId: user.id, loraId: id } });
      return Response.json({ isFavorite: true });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "failed";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}

