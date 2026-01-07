"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ManageEventsPage() {
  const { data: session } = useSession();
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
  type EventRow = {
    id: string;
    title: string;
    type: string;
    startAt: string | Date;
    endAt: string | Date;
    participants?: number | null;
    prizePool?: string | null;
    url?: string | null;
    description?: string | null;
  };
  const [rows, setRows] = useState<EventRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/events?filter=all").then(r=>r.json()).then(setRows).catch(()=>{});
  }, [message]);

  async function onCreate() {
    try {
      setBusy(true);
      setMessage(null);
      let coverKey: string | undefined;
      if (cover) {
        const fd = new FormData();
        fd.append("file", cover);
        fd.append("kind", "eventCover");
        const up = await fetch("/api/storage/upload", { method: "POST", body: fd });
        const upRes = await up.json();
        if (!up.ok) throw new Error(upRes?.error || "Cover upload failed");
        coverKey = upRes.key as string;
      }
      const res = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, description, type, startAt, endAt, participants, prizePool, url, coverKey }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Create failed");
      setMessage("Event created.");
      setTitle(""); setDescription(""); setStartAt(""); setEndAt(""); setParticipants(""); setPrizePool(""); setUrl(""); setCover(null);
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  }

  const isAdmin = session?.user?.email === "cturyasiima@gmail.com";

  return (
    <div className="min-h-screen bg-[#E2E2D1] py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {!isAdmin ? (
          <div>
            <h1 className="font-druk-condensed text-4xl uppercase tracking-tight text-black mb-4">Manage Events</h1>
            <p className="text-sm">You do not have permission to access this page.</p>
          </div>
        ) : (
          <>
            <h1 className="font-druk-condensed text-4xl uppercase text-black mb-4">Create Event</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase">Title</label>
                <input className="w-full border border-black p-2" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase">Type</label>
                <select className="w-full border border-black p-2" value={type} onChange={(e) => setType(e.target.value)}>
                  {["CONTEST","AWARDS","RESULTS","OTHER"].map(o => <option key={o} value={o}>{o}</option>)}
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

            <div className="mt-8">
              <h2 className="font-druk-condensed text-2xl uppercase tracking-tight mb-3">Your Events</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-2 border-black">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-black">
                      <th className="text-left p-2 border-r-2 border-black">Title</th>
                      <th className="text-left p-2 border-r-2 border-black">Type</th>
                      <th className="text-left p-2 border-r-2 border-black">Start</th>
                      <th className="text-left p-2 border-r-2 border-black">End</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="border-t border-black/20">
                        <td className="p-2">{r.title}</td>
                        <td className="p-2">{r.type}</td>
                        <td className="p-2">{new Date(r.startAt).toLocaleString()}</td>
                        <td className="p-2">{new Date(r.endAt).toLocaleString()}</td>
                        <td className="p-2 flex gap-2">
                          <button className="px-3 py-1 border-2 border-black" onClick={() => {
                            setEditingId(r.id);
                            setTitle(r.title);
                            setDescription(r.description || "");
                            setType(r.type);
                            setStartAt(new Date(r.startAt).toISOString().slice(0,16));
                            setEndAt(new Date(r.endAt).toISOString().slice(0,16));
                            setParticipants(r.participants ? String(r.participants) : "");
                            setPrizePool(r.prizePool || "");
                            setUrl(r.url || "");
                          }}>Edit</button>
                          <button className="px-3 py-1 border-2 border-black" onClick={async () => {
                            if (!confirm("Delete this event?")) return;
                            const res = await fetch(`/api/events/${r.id}`, { method: "DELETE" });
                            if (!res.ok) alert("Delete failed");
                            setMessage("Deleted");
                          }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {editingId && (
              <div className="mt-6 flex gap-2">
                <button className="px-4 py-2 border-2 border-black" onClick={async () => {
                  const res = await fetch(`/api/events/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, description, type, startAt, endAt, participants: participants ? Number(participants) : undefined, prizePool, url }) });
                  if (!res.ok) alert("Update failed");
                  setEditingId(null);
                  setMessage("Updated");
                }}>Save Changes</button>
                <button className="px-4 py-2 border-2 border-black" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
