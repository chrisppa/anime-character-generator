import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, key, sizeBytes } = await req.json();
    if (!name || !key) return new Response(JSON.stringify({ error: "name and key required" }), { status: 400 });
    const lora = await prisma.lora.create({ data: { name, fileKey: key, sizeBytes } });
    return Response.json(lora);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "failed" }), { status: 500 });
  }
}

