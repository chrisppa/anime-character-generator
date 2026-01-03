import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { env } from "@/lib/env";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const e = await prisma.event.findUnique({ where: { id: params.id } });
  if (!e) return new Response("Not found", { status: 404 });
  const base = env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  const coverUrl = e.coverKey && base ? `${base}/${encodeURIComponent(e.coverKey)}` : null;
  return Response.json({ ...e, coverUrl });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.email !== env.ADMIN_EMAIL) return new Response("Forbidden", { status: 403 });
  const body = await req.json();
  const e = await prisma.event.update({ where: { id: params.id }, data: body });
  return Response.json(e);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.email !== env.ADMIN_EMAIL) return new Response("Forbidden", { status: 403 });
  await prisma.event.delete({ where: { id: params.id } });
  return new Response(null, { status: 204 });
}

