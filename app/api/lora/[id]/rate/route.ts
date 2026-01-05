import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const value = Number(body?.value);
    if (!Number.isFinite(value) || value < 1 || value > 5) return new Response("Invalid rating", { status: 400 });
    const user = await prisma.user.upsert({ where: { email: session.user.email }, update: {}, create: { email: session.user.email } });
    const existing = await prisma.rating.findUnique({ where: { userId_loraId: { userId: user.id, loraId: id } } });
    const lora = await prisma.$transaction(async (tx) => {
      if (existing) {
        const delta = value - existing.value;
        await tx.rating.update({ where: { id: existing.id }, data: { value } });
        return tx.lora.update({ where: { id }, data: { ratingSum: { increment: delta } } });
      } else {
        await tx.rating.create({ data: { userId: user.id, loraId: id, value } });
        return tx.lora.update({ where: { id }, data: { ratingSum: { increment: value }, ratingCount: { increment: 1 } } });
      }
    });
    const ratingAvg = lora.ratingCount ? lora.ratingSum / lora.ratingCount : 0;
    return Response.json({ ratingAvg, ratingCount: lora.ratingCount, myRating: value });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "failed";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}

