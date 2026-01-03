"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function LoraUploadPage() {
  const { status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [nsfw, setNsfw] = useState(false);
  const [modelType, setModelType] = useState("LORA");
  const [baseModel, setBaseModel] = useState("");
  const [trainingZip, setTrainingZip] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f && !name) setName(f.name.replace(/\.[^.]+$/, ""));
  }

  function onPickTraining(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setTrainingZip(f);
  }

  function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setCover(f);
  }

  async function onUpload() {
    if (!file) return;
    setBusy(true);
    setMessage(null);
    setCreatedId(null);
    try {
      // 1) Ask server for presigned PUT
      const signRes = await fetch("/api/lora/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream", kind: "loras" }),
      });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign?.error || "Sign failed");

      // 2) Upload directly to R2
      const putRes = await fetch(sign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!putRes.ok) {
        const txt = await putRes.text();
        throw new Error(`Upload failed: ${txt}`);
      }

      // 2b) Optional training data upload
      let trainingDataKey: string | undefined;
      let trainingDataSizeBytes: number | undefined;
      if (trainingZip) {
        const tSignRes = await fetch("/api/lora/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: trainingZip.name, contentType: trainingZip.type || "application/zip", kind: "training" }),
        });
        const tSign = await tSignRes.json();
        if (!tSignRes.ok) throw new Error(tSign?.error || "Training data sign failed");
        const putT = await fetch(tSign.uploadUrl, { method: "PUT", headers: { "Content-Type": trainingZip.type || "application/zip" }, body: trainingZip });
        if (!putT.ok) throw new Error(`Training data upload failed: ${await putT.text()}`);
        trainingDataKey = tSign.key;
        trainingDataSizeBytes = trainingZip.size;
      }

      // 2c) Optional cover image upload
      let coverKey: string | undefined;
      if (cover) {
        const cSignRes = await fetch("/api/lora/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: cover.name, contentType: cover.type || "image/png", kind: "cover" }),
        });
        const cSign = await cSignRes.json();
        if (!cSignRes.ok) throw new Error(cSign?.error || "Cover sign failed");
        const putC = await fetch(cSign.uploadUrl, { method: "PUT", headers: { "Content-Type": cover.type || "image/png" }, body: cover });
        if (!putC.ok) throw new Error(`Cover upload failed: ${await putC.text()}`);
        coverKey = cSign.key;
      }

      // 3) Register in DB with metadata
      const regRes = await fetch("/api/lora/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || file.name,
          description,
          tags,
          nsfw,
          modelType,
          baseModel,
          key: sign.key,
          sizeBytes: file.size,
          trainingDataKey,
          trainingDataSizeBytes,
          coverKey,
        }),
      });
      const reg = await regRes.json();
      if (!regRes.ok) throw new Error(reg?.error || "Register failed");
      setCreatedId(reg.id);
      setMessage("LoRA uploaded and registered successfully.");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#E2E2D1] py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="font-druk-condensed text-4xl uppercase tracking-tight text-black mb-4">Upload LoRA</h1>
        <p className="text-sm text-gray-700 mb-6">Upload a .safetensors LoRA file. It will be stored in R2 and registered in the database. After upload, copy the LoRA ID to use in generation.</p>

        {status !== "authenticated" && (
          <div className="p-3 border-2 border-black bg-yellow-50 mb-4 space-y-2">
            <div className="text-sm">Please sign in to upload LoRAs.</div>
            <button onClick={() => signIn("github")} className="px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 text-sm font-bold">
              Sign in with GitHub
            </button>
          </div>
        )}

      <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Name</label>
            <input
              className="w-full bg-white border border-black p-2 text-sm"
              placeholder="My LoRA"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Description</label>
            <textarea
              className="w-full bg-white border border-black p-2 text-sm h-24"
              placeholder="What does this LoRA do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Tags (comma separated)</label>
            <input
              className="w-full bg-white border border-black p-2 text-sm"
              placeholder="character, anime, style"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Model Type</label>
              <select className="bg-white border border-black p-2 text-sm" value={modelType} onChange={(e) => setModelType(e.target.value)}>
                <option value="CHECKPOINT">Checkpoint</option>
                <option value="LORA">LoRA</option>
                <option value="TEXTUAL_INVERSION">Textual Inversion</option>
                <option value="VAE">VAE</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Base Model</label>
              <input
                className="w-full bg-white border border-black p-2 text-sm"
                placeholder="SDXL, SD 1.5, Flux Schnell"
                value={baseModel}
                onChange={(e) => setBaseModel(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 mt-5">
              <input type="checkbox" checked={nsfw} onChange={(e) => setNsfw(e.target.checked)} />
              <span className="text-sm">Mature content</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-gray-500 mb-1">File (.safetensors)</label>
            <input type="file" accept=".safetensors" onChange={onPick} className="block w-full" />
            {file && (
              <div className="mt-1 text-xs text-gray-600">{file.name} • {(file.size / (1024 * 1024)).toFixed(2)} MB</div>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Training Data (optional .zip)</label>
            <input type="file" accept=".zip" onChange={onPickTraining} className="block w-full" />
            {trainingZip && (
              <div className="mt-1 text-xs text-gray-600">{trainingZip.name} • {(trainingZip.size / (1024 * 1024)).toFixed(2)} MB</div>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Cover Image (optional)</label>
            <input type="file" accept="image/*" onChange={onPickCover} className="block w-full" />
            {cover && (
              <div className="mt-1 text-xs text-gray-600">{cover.name} • {(cover.size / (1024 * 1024)).toFixed(2)} MB</div>
            )}
          </div>

          <button
            onClick={onUpload}
            disabled={busy || !file || status !== "authenticated"}
            className="w-full bg-black text-white py-3 font-druk-text-wide text-[11px] uppercase tracking-widest border-2 border-black hover:bg-[#FAFF00] hover:text-black transition-all disabled:opacity-50"
          >
            {busy ? "Uploading..." : "Upload & Register"}
          </button>

          {message && <div className="text-sm mt-2">{message}</div>}
          {createdId && (
            <div className="mt-4 p-3 border border-black bg-yellow-50 text-sm">
              <div className="font-bold">LoRA ID</div>
              <div className="font-mono break-all">{createdId}</div>
              <button
                onClick={() => navigator.clipboard?.writeText(createdId)}
                className="mt-2 px-3 py-1 border-2 border-black bg-white hover:bg-gray-100 text-xs"
              >
                Copy ID
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
