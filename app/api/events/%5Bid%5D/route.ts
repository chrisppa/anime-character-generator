import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { env } from "@/lib/env";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<Record<string, string>> }) {
  const { id } = await params;
  const e = await prisma.event.findUnique({ where: { id } });
  if (!e) return new Response("Not found", { status: 404 });
  const base = env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  const coverUrl = e.coverKey && base ? `${base}/${encodeURIComponent(e.coverKey)}` : null;
  return Response.json({ ...e, coverUrl });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<Record<string, string>> }) {
  const session = await auth();
  if (session?.user?.email !== env.ADMIN_EMAIL) return new Response("Forbidden", { status: 403 });
  try {
    const body = await req.json();
    const data: any = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.type !== undefined) data.type = body.type;
    if (body.participants !== undefined && body.participants !== "") data.participants = Number(body.participants);
    if (body.prizePool !== undefined) data.prizePool = body.prizePool;
    if (body.url !== undefined) data.url = body.url;
    if (body.coverKey !== undefined) data.coverKey = body.coverKey;
    if (body.startAt) {
      const d = new Date(body.startAt);
      if (!isNaN(d.getTime())) data.startAt = d;
    }
    if (body.endAt) {
      const d = new Date(body.endAt);
      if (!isNaN(d.getTime())) data.endAt = d;
    }
    const { id } = await params;
    const e = await prisma.event.update({ where: { id }, data });
    return Response.json(e);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "failed" }), { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<Record<string, string>> }) {
  const session = await auth();
  if (session?.user?.email !== env.ADMIN_EMAIL) return new Response("Forbidden", { status: 403 });
  const { id } = await params;
  await prisma.event.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
