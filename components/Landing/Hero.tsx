"use client";
import { RoughNotation } from "react-rough-notation";
import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { ModelSelect } from "@/components/ui/model-select";

export const Hero = () => {
  const [activeTab, setActiveTab] = useState("txt2img");
  const [positivePrompt, setPositivePrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const [loraOptions, setLoraOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedLora, setSelectedLora] = useState<string | undefined>(undefined);
  const [steps, setSteps] = useState<number>(28);
  const [cfgScale, setCfgScale] = useState<number>(7);
  const [seed, setSeed] = useState<string>("-1");
  const [width, setWidth] = useState<number>(768);
  const [height, setHeight] = useState<number>(1024);

  useEffect(() => {
    if (!jobId) return;
    // Simple polling loop every 3s
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}/status`);
        const data = await res.json();
        if (data.status) setStatus(data.status);
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setSubmitting(false);
        }
        if (data.error) {
          setLastError(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setSubmitting(false);
        }
      } catch (_e) {
        // ignore transient errors during polling
      }
    }, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [jobId]);

  async function handleGenerate() {
    try {
      setSubmitting(true);
      setStatus("queued");
      setImageUrl(null);
      const body = {
        prompt: positivePrompt || "1girl, mecha musume, white armor, glowing visor, futuristic city, masterpiece",
        negativePrompt: negativePrompt || undefined,
        type: activeTab,
        loraId: selectedLora,
        width,
        height,
        steps,
        cfgScale,
        seed,
      };
      const res = await fetch("/api/jobs/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Submit failed");
      setJobId(data.jobId);
    } catch (e) {
      setStatus("failed");
      setLastError((e as Error).message);
      setSubmitting(false);
    }
  }
  const models = [
    { label: "AniMind v1.0 (Base)", value: "animind" },
    { label: "Chihiro LoRA", value: "chihiro" },
    { label: "Zero Two LoRA", value: "zerotwo" },
  ];

  useEffect(() => {
    fetch("/api/lora/list")
      .then((r) => r.json())
      .then((list) => {
        if (Array.isArray(list)) {
          const opts = list.map((l: { id: string; name: string; nsfw?: boolean }) => ({
            label: `${l.name}${l.nsfw ? " • NSFW" : ""}`,
            value: l.id,
          }));
          setLoraOptions(opts);
        }
      })
      .catch(() => {});
  }, []);
  return (
    <div className="min-h-screen py-20 overflow-x-hidden">
      {/* --- Main Content Layer --- */}
      <div className="z-10 flex flex-col items-center">
        {/* Headings */}
        <h1 className="font-druk-condensed text-6xl md:text-9xl tracking-wide text-center uppercase text-black">
          Anime Character Generation
        </h1>

        <p className="text-xl font-light text-center mt-4 text-black">
          Create{" "}
          <RoughNotation
            type="highlight"
            color="#FFE03B"
            show={true}
            padding={4}
          >
            <span className="font-bold text-black px-1">Studio-Quality</span>
          </RoughNotation>{" "}
          Anime characters using our specialized{" "}
          <RoughNotation type="highlight" color="white" show={true} padding={4}>
            <span className="font-bold text-black px-1">LoRA</span>
          </RoughNotation>{" "}
          models.
        </p>

        {/* --- DEMO INTERFACE START --- */}
        <div className="w-full max-w-5xl mt-12 px-4">
          <div className="bg-white/60 backdrop-blur-md border-2 border-black p-6 bg:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b-2 border-black/10 pb-4">
              {["txt2img", "img2img"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1 font-mono font-bold text-sm uppercase transition-all ${
                    activeTab === tab
                      ? "bg-black text-white"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1 & 2: Prompts */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-gray-500">
                    Positive Prompt
                  </label>
                  <textarea
                    className="w-full bg-white border border-black p-3 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-[#FFE03B] resize-none font-medium"
                    placeholder="1girl, mecha musume, white armor, glowing visor, futuristic city background, masterpiece, best quality..."
                    value={positivePrompt}
                    onChange={(e) => setPositivePrompt(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-gray-500">
                    Negative Prompt
                  </label>
                  <textarea
                    className="w-full bg-white border border-black p-3 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none font-medium"
                    placeholder="low quality, worst quality, bad hands, missing fingers, extra limbs, watermark..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                  />
                </div>
              </div>

              {/* Column 3: Settings */}
              <div className="lg:col-span-1 bg-white/50 border border-black/20 p-4 space-y-4">
                {/* Base Model Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-gray-500">
                    Base Model
                  </label>
                  <div className="relative">
                    <ModelSelect defaultValue="animind" options={models} />
                  </div>
                </div>

                {/* LoRA Selector (optional) */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-gray-500">LoRA (optional)</label>
                  <div className="relative">
                    <ModelSelect
                      value={selectedLora}
                      onValueChange={(v) => setSelectedLora(v)}
                      placeholder={loraOptions.length ? "Select LoRA" : "No LoRAs uploaded"}
                      options={loraOptions}
                    />
                  </div>
                  {selectedLora && (
                    <button onClick={() => setSelectedLora(undefined)} className="mt-1 text-[10px] underline">
                      Clear LoRA
                    </button>
                  )}
                </div>

                {/* Sliders Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-gray-500">
                      Steps
                    </label>
                    <input
                      type="number"
                      value={steps}
                      onChange={(e) => setSteps(Number(e.target.value) || 0)}
                      className="
                        w-full bg-white border border-black px-2 py-1 text-sm font-mono
                        rounded-none
                        focus:rounded-none
                        focus:outline-none
                        focus:ring-0
                      "
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-gray-500">
                      CFG Scale
                    </label>
                    <input
                      type="number"
                      value={cfgScale}
                      onChange={(e) => setCfgScale(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-black px-2 py-1 text-sm font-mono
                      rounded-none
                      focus:rounded-none
                      focus:outline-none
                      focus:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-gray-500">
                    Seed
                  </label>
                  <input
                    type="text"
                    placeholder="-1"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    className="w-full bg-white border border-black px-2 py-1 text-sm font-mono
                    rounded-none
                    focus:rounded-none
                    focus:outline-none
                    focus:ring-0"
                  />
                </div>

                {/* Size */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-gray-500">Width</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-black px-2 py-1 text-sm font-mono rounded-none focus:outline-none focus:ring-0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-gray-500">Height</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-black px-2 py-1 text-sm font-mono rounded-none focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>

                {/* Action Button */}
                <button onClick={handleGenerate} disabled={submitting} className="w-full mt-2 bg-black hover:bg-[#FFE03B] hover:text-black text-white font-bold py-3 px-4 border-2 border-black transition-all flex items-center justify-center gap-2 group shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1 cursor-pointer disabled:opacity-60">
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? "GENERATING..." : "START GENERATE"}</span>
                </button>
              </div>
            </div>
          </div>
          {/* Simple result/status preview */}
          {(status !== "idle" || imageUrl) && (
            <div className="mt-6 p-4 border-2 border-black bg-white">
              <div className="text-xs font-mono uppercase tracking-widest">Status: {status}</div>
              {status === "failed" && (
                <div className="mt-2 text-xs text-red-600">
                  Generation failed{lastError ? `: ${lastError}` : ". Check server logs for details."}
                </div>
              )}
              {imageUrl && (
                <div className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="result" className="border border-black max-h-96 object-contain" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
