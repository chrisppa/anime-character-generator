import { prisma } from "@/lib/db";
import { getSignedGetUrl } from "@/lib/r2";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const l = await prisma.lora.findUnique({ where: { id } });
    if (!l || !l.fileKey) return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
    await prisma.lora.update({ where: { id }, data: { downloads: { increment: 1 } } });
    const url = await getSignedGetUrl(l.fileKey);
    return Response.json({ url });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "failed";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}

