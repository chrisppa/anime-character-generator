import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export default async function EventDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await prisma.event.findUnique({ where: { id } });
  if (!e) return <div className="min-h-screen p-8">Event not found.</div>;
  const base = env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  const coverUrl = e.coverKey && base ? `${base}/${encodeURIComponent(e.coverKey)}` : null;
  const start = new Date(e.startAt);
  const end = new Date(e.endAt);

  return (
    <div className="min-h-screen bg-[#E2E2D1] py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {coverUrl && (
          <div className="relative aspect-video border-b-4 border-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt={e.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <h1 className="font-druk-condensed text-4xl uppercase tracking-tight">{e.title}</h1>
          <div className="text-sm text-gray-600 mt-1">
            {start.toLocaleString()} — {end.toLocaleString()} • {e.type}
          </div>
          {e.prizePool && (
            <div className="mt-2 text-sm font-bold">Prize: {e.prizePool}</div>
          )}
          {e.url && (
            <div className="mt-2">
              <a href={e.url} target="_blank" rel="noopener noreferrer" className="underline">Open official page</a>
            </div>
          )}
          {e.description && (
            <div className="mt-4 whitespace-pre-wrap leading-relaxed">{e.description}</div>
          )}
        </div>
      </div>
    </div>
  );
}
