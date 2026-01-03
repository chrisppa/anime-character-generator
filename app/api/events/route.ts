import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { auth } from "@/auth";

function deriveStatus(now: Date, startAt: Date, endAt: Date) {
  if (now < startAt) return "Upcoming";
  if (now > endAt) return "Ended";
  return "Ongoing";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // active|upcoming|archived
  const now = new Date();
  const items = await prisma.event.findMany({ orderBy: { startAt: "desc" }, take: 100 });
  const base = env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  const list = items
    .map((e) => {
      const status = deriveStatus(now, e.startAt, e.endAt);
      return {
        ...e,
        status,
        coverUrl: e.coverKey && base ? `${base}/${encodeURIComponent(e.coverKey)}` : null,
      };
    })
    .filter((e) => {
      if (!filter || filter === "all") return true;
      if (filter === "active") return e.status === "Ongoing";
      if (filter === "upcoming") return e.status === "Upcoming";
      if (filter === "archived") return e.status === "Ended";
      return true;
    });
  return Response.json(list);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: { email: session.user.email },
    });
    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        type: body.type ?? "CONTEST",
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
        participants: body.participants ? Number(body.participants) : null,
        prizePool: body.prizePool ?? null,
        url: body.url ?? null,
        coverKey: body.coverKey ?? null,
        userId: user.id,
      },
    });
    return Response.json(event);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "failed";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
