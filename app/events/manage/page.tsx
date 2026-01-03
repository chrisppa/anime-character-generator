"use client";

import { useState } from "react";

export default function ManageEventsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("CONTEST");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [participants, setParticipants] = useState<string>("");
  const [prizePool, setPrizePool] = useState("");
  const [url, setUrl] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onCreate() {
    try {
      setBusy(true);
      setMessage(null);
      let coverKey: string | undefined;
      if (cover) {
        const signRes = await fetch("/api/lora/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: cover.name, contentType: cover.type || "image/png", kind: "eventCover" }),
        });
        const sign = await signRes.json();
        if (!signRes.ok) throw new Error(sign?.error || "Cover sign failed");
        const put = await fetch(sign.uploadUrl, { method: "PUT", headers: { "Content-Type": cover.type || "image/png" }, body: cover });
        if (!put.ok) throw new Error(`Cover upload failed: ${await put.text()}`);
        coverKey = sign.key;
      }
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type, startAt, endAt, participants, prizePool, url, coverKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Create failed");
      setMessage("Event created.");
      setTitle(""); setDescription(""); setStartAt(""); setEndAt(""); setParticipants(""); setPrizePool(""); setUrl(""); setCover(null);
    } catch (e: any) {
      setMessage(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#E2E2D1] py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="font-druk-condensed text-4xl uppercase tracking-tight text-black mb-4">Create Event</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase">Title</label>
            <input className="w-full border border-black p-2" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase">Type</label>
            <select className="w-full border border-black p-2" value={type} onChange={(e) => setType(e.target.value)}>
              {['CONTEST','AWARDS','RESULTS','OTHER'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase">Start</label>
            <input type="datetime-local" className="w-full border border-black p-2" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase">End</label>
            <input type="datetime-local" className="w-full border border-black p-2" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase">Participants</label>
            <input className="w-full border border-black p-2" value={participants} onChange={(e) => setParticipants(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase">Prize Pool</label>
            <input className="w-full border border-black p-2" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-mono uppercase">URL</label>
            <input className="w-full border border-black p-2" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-mono uppercase">Description</label>
            <textarea className="w-full border border-black p-2 h-32" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-mono uppercase">Cover Image</label>
            <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] || null)} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={onCreate} disabled={busy} className="bg-black text-white px-6 py-2 border-2 border-black hover:bg-yellow-400 hover:text-black disabled:opacity-60">
            {busy ? "Creating…" : "Create Event"}
          </button>
          {message && <div className="text-sm">{message}</div>}
        </div>
      </div>
    </div>
  );
}

