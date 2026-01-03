import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import SignInButton from "@/components/SignInButton";
import { env } from "@/lib/env";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen bg-[#E2E2D1] py-10 px-4">
        <div className="max-w-2xl mx-auto bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="font-druk-condensed text-4xl uppercase tracking-tight text-black mb-4">Profile</h1>
          <p className="text-sm text-gray-700 mb-4">Sign in to view your uploads and account details.</p>
          <SignInButton />
        </div>
      </div>
    );
  }

  // Fetch LoRAs owned by this user (by email)
  const items = await prisma.lora.findMany({
    where: { user: { email: session.user.email } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const base = env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");

  return (
    <div className="min-h-screen bg-[#E2E2D1] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {session.user.image && (
            <img src={session.user.image} alt={session.user.name || "avatar"} className="w-14 h-14 rounded-full border-2 border-black object-cover" />
          )}
          <div className="min-w-0">
            <div className="font-druk-condensed text-3xl uppercase leading-none">{session.user.name || "User"}</div>
            <div className="text-sm text-gray-600 truncate">{session.user.email}</div>
          </div>
        </div>

        {/* LoRAs */}
        <div className="mt-8">
          <h2 className="font-druk-condensed text-2xl uppercase tracking-tight mb-4">Your LoRAs</h2>
          {items.length === 0 ? (
            <div className="bg-white border-2 border-black p-4">No LoRAs yet. Upload one from the <a className="underline" href="/lora/upload">upload page</a>.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((l) => (
                <div key={l.id} className="bg-white border-2 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  {/* Cover */}
                  <div className="relative aspect-3/2 overflow-hidden border-2 border-black mb-3 bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {l.coverKey && base ? (
                      <img src={`${base}/${encodeURIComponent(l.coverKey)}`} alt={l.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No cover</div>
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-black uppercase leading-tight">{l.name}</div>
                      <div className="text-[10px] uppercase text-gray-500">
                        {l.modelType}{l.baseModel ? ` • ${l.baseModel}` : ""}{l.nsfw ? " • NSFW" : ""}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono">{(l.sizeBytes ? l.sizeBytes / (1024 * 1024) : 0).toFixed(1)} MB</div>
                  </div>
                  {l.tags?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {l.tags.slice(0, 6).map((t) => (
                        <span key={t} className="text-[9px] border px-1 py-0.5 bg-gray-50">#{t}</span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-3">
                    <div className="text-[10px] font-mono break-all">ID: {l.id}</div>
                    <button
                      onClick={() => navigator.clipboard?.writeText(l.id)}
                      className="mt-1 text-[10px] underline"
                    >
                      Copy ID
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

