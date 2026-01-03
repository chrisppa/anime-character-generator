"use client";

import { useEffect, useState } from "react";

type Lora = {
  id: string;
  name: string;
  description?: string | null;
  tags: string[];
  nsfw: boolean;
  modelType: string;
  baseModel?: string | null;
  sizeBytes?: number | null;
  createdAt: string;
};

export default function LoraModelsPage() {
  const [items, setItems] = useState<Lora[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideNSFW, setHideNSFW] = useState(true);

  useEffect(() => {
    fetch("/api/lora/list")
      .then((r) => r.json())
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#E2E2D1] py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-druk-condensed text-5xl uppercase tracking-tight text-black mb-6">LoRAs</h1>
        <p className="text-sm text-gray-700 mb-8">Recently uploaded LoRAs from your project database.</p>
        {loading ? (
          <div className="text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm">No LoRAs yet. Upload one from the <a className="underline" href="/lora/upload">upload page</a>.</div>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-2">
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={hideNSFW} onChange={(e) => setHideNSFW(e.target.checked)} /> Hide NSFW
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.filter((l) => (hideNSFW ? !l.nsfw : true)).map((l) => (
              <div key={l.id} className="bg-white border-2 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black uppercase leading-tight">{l.name}</div>
                    <div className="text-[10px] uppercase text-gray-500">{l.modelType}{l.baseModel ? ` • ${l.baseModel}` : ""}{l.nsfw ? " • NSFW" : ""}</div>
                  </div>
                  <div className="text-[10px] font-mono">{(l.sizeBytes ? l.sizeBytes / (1024 * 1024) : 0).toFixed(1)} MB</div>
                </div>
                {l.description && <div className="mt-2 text-sm text-gray-700 line-clamp-3">{l.description}</div>}
                {l.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {l.tags.slice(0, 6).map((t) => (
                      <span key={t} className="text-[9px] border px-1 py-0.5 bg-gray-50">#{t}</span>
                    ))}
                  </div>
                )}
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
          </>
        )}
      </div>
    </div>
  );
}
