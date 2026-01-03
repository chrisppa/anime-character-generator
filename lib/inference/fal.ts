import { SubmitParams, SubmitResult, StatusResult } from "@/lib/inference/types";

const FAL_BASE = process.env.FAL_BASE || "https://queue.fal.run";
const FAL_ROUTE = process.env.FAL_ROUTE || "fal-ai/flux/schnell"; // configurable model route

function headers() {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY is not set");
  return {
    "Content-Type": "application/json",
    Authorization: `Key ${key}`,
  } as const;
}

// fal queue semantics: POST /{route}/requests with input, then GET /{route}/requests/{id}
export async function submit(params: SubmitParams): Promise<SubmitResult> {
  const url = `${FAL_BASE}/${FAL_ROUTE}/requests`;
  const body: any = {
    input: {
      prompt: params.prompt,
      negative_prompt: params.negativePrompt,
      // lora urls may be supported depending on the route
      lora_urls: params.loraUrl ? [params.loraUrl] : undefined,
    },
  };

  const res = await fetch(url, { method: "POST", headers: headers(), body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) {
    console.error("FAL submit failed", res.status, text);
    return { providerJobId: "", status: "failed", error: text };
  }
  let data: any = {};
  try { data = JSON.parse(text); } catch {}
  console.log("FAL submit ok", data);
  const id = data.request_id || data.id || "";
  return { providerJobId: id, status: "queued" };
}

export async function getStatus(providerJobId: string): Promise<StatusResult> {
  const candidates: Array<{ method: "GET" | "POST"; url: string }> = [
    { method: "GET", url: `${FAL_BASE}/${FAL_ROUTE}/requests/${providerJobId}` },
    // Some routes expose a top-level requests status endpoint
    { method: "GET", url: `${FAL_BASE}/requests/${providerJobId}` },
    // Some older routes require a POST poll endpoint
    { method: "POST", url: `${FAL_BASE}/${FAL_ROUTE}/requests/${providerJobId}` },
  ];

  for (const attempt of candidates) {
    try {
      const res = await fetch(attempt.url, { method: attempt.method, headers: headers() });
      const text = await res.text();
      if (!res.ok) {
        // If the method is not allowed or not found, try the next candidate
        if (res.status === 405 || res.status === 404) {
          console.warn("FAL status candidate failed", res.status, attempt.method, attempt.url);
          continue;
        }
        console.error("FAL status failed", res.status, text);
        return { status: "failed", error: text };
      }
      let data: any = {};
      try { data = JSON.parse(text); } catch {}
      console.log("FAL status", data);
      const raw = (data.status || data.state || data.phase || "queued").toString().toLowerCase();
      const status: StatusResult["status"] = raw === "completed" ? "succeeded" : (raw as any);
      if (status === "succeeded") {
        const imageUrl = data.response?.images?.[0]?.url || data.response?.output?.[0]?.url || data.image_url || data.images?.[0]?.url || undefined;
        return { status: "succeeded", imageUrl };
      }
      if (["running", "processing", "in_progress"].includes(status)) return { status: "running" } as StatusResult;
      if (["failed", "error", "canceled"].includes(status)) return { status: "failed", error: data.error || data.message || "failed" } as StatusResult;
      return { status: "queued" };
    } catch (e: any) {
      console.warn("FAL status fetch threw", attempt.method, attempt.url, e?.message);
      continue;
    }
  }

  return { status: "failed", error: "All status endpoints failed (405/404). Check FAL_ROUTE/FAL_BASE." };
}
