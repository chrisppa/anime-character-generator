"use client";
import React from "react";
import { Star } from "lucide-react";

type Props = { id: string; hasDataset: boolean };

export default function Actions({ id, hasDataset }: Props) {
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
      const res = await fetch(`/api/lora/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: v }),
      });
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

