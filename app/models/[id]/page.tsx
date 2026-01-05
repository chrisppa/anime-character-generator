import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import React from "react";

async function fetchInitial(id: string) {
  const l = await prisma.lora.findUnique({ where: { id } });
  if (!l) return null;
  const base = env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  const coverUrl = l.coverKey && base ? `${base}/${encodeURIComponent(l.coverKey)}` : null;
  const ratingAvg = l.ratingCount ? l.ratingSum / l.ratingCount : 0;
  return { ...l, coverUrl, ratingAvg };
}

function formatMB(n?: number | null) {
  if (!n) return "0.0 MB";
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function RatingDisplay({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className={i < full ? "text-yellow-400 fill-current" : "text-gray-300"} />
      ))}
      <span className="text-xs font-mono">{value.toFixed(1)}</span>
    </div>
  );
}

function Actions({ id, hasDataset }: { id: string; hasDataset: boolean }) {
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  async function handleDownload(path: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/lora/${id}/${path}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      if (data.url) window.location.href = data.url as string;
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }
  async function toggleFavorite() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/lora/${id}/favorite`, { method: "POST" });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed");
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }
  async function rate(v: number) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/lora/${id}/rate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value: v }) });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed");
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => handleDownload("download")} disabled={busy} className="px-3 py-2 border-2 border-black bg-black text-white hover:bg-yellow-400 hover:text-black text-xs font-bold uppercase">
          Download LoRA
        </button>
        {hasDataset && (
          <button onClick={() => handleDownload("dataset")} disabled={busy} className="px-3 py-2 border-2 border-black bg-white hover:bg-gray-100 text-xs font-bold uppercase">
            Download Dataset
          </button>
        )}
        <button onClick={toggleFavorite} disabled={busy} className="px-3 py-2 border-2 border-black bg-white hover:bg-gray-100 text-xs font-bold uppercase">
          Favorite
        </button>
        <div className="flex items-center gap-1 ml-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <button key={i} onClick={() => rate(i + 1)} className="p-1" aria-label={`Rate ${i + 1}`}>
              <Star size={16} className="text-yellow-500" />
            </button>
          ))}
        </div>
      </div>
      {msg && <div className="text-xs text-red-600">{msg}</div>}
    </div>
  );
}

export default async function LoraDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = await fetchInitial(id);
  if (!l) return <div className="min-h-screen p-8">Not found.</div>;
  return (
    <div className="min-h-screen bg-[#E2E2D1] py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {l.coverUrl && (
          <div className="relative aspect-[3/1] border-b-4 border-black">
            <Image src={l.coverUrl} alt={l.name} fill className="object-cover" sizes="100vw" />
          </div>
        )}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-druk-condensed text-4xl uppercase tracking-tight">{l.name}</h1>
              <div className="text-[10px] uppercase text-gray-500">
                {l.modelType}{l.baseModel ? ` • ${l.baseModel}` : ""}{l.nsfw ? " • NSFW" : ""}
                {" • "}{formatMB(l.sizeBytes)}
              </div>
            </div>
            <div className="text-right">
              <RatingDisplay value={l.ratingAvg} />
              <div className="text-[10px] text-gray-500">{l.ratingCount} ratings • {l.downloads} downloads</div>
            </div>
          </div>

          { /* @ts-expect-error Async Server Component boundary with client state */ }
          <Actions id={l.id} hasDataset={Boolean(l.trainingDataKey)} />

          {l.description && <div className="text-sm text-gray-800 whitespace-pre-wrap">{l.description}</div>}
          {l.tags?.length ? (
            <div className="flex flex-wrap gap-1">
              {l.tags.map((t) => (
                <span key={t} className="text-[9px] border px-1 py-0.5 bg-gray-50">#{t}</span>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between">
            <Link href="/models" className="underline text-sm">← Back to models</Link>
            <div className="text-[10px] font-mono">ID: {l.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

