import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const list = await prisma.lora.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return Response.json(list);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "failed" }), { status: 500 });
  }
}

