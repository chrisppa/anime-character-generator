import { SubmitParams, SubmitResult, StatusResult } from "@/lib/inference/types";

const FAL_BASE = "https://queue.fal.run"; // fal.ai Queue API base

function headers() {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY is not set");
  return {
    "Content-Type": "application/json",
    Authorization: `Key ${key}`,
  } as const;
}

// This uses fal queue semantics: POST /{model}/requests with input, then poll /requests/{id}
export async function submit(params: SubmitParams): Promise<SubmitResult> {
  // Example model route; replace with an actual fal model ID when chosen
  const modelRoute = "falahq/flux/dev/fast"; // placeholder
  const url = `${FAL_BASE}/${modelRoute}/requests`;

  const body: any = {
    input: {
      prompt: params.prompt,
      // Many fal models support control for loras via adapters; when available, pass URL here
      lora_urls: params.loraUrl ? [params.loraUrl] : undefined,
    },
  };

  const res = await fetch(url, { method: "POST", headers: headers(), body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text();
    return { providerJobId: "", status: "failed", error: text };
  }
  const data: any = await res.json();
  const id = data.request_id || data.id || "";
  return { providerJobId: id, status: "queued" };
}

export async function getStatus(providerJobId: string): Promise<StatusResult> {
  const modelRoute = "falahq/flux/dev/fast"; // placeholder
  const url = `${FAL_BASE}/${modelRoute}/requests/${providerJobId}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    const text = await res.text();
    return { status: "failed", error: text };
  }
  const data: any = await res.json();
  const status = (data.status || data.state || "queued").toLowerCase();
  if (status === "succeeded" || status === "completed") {
    const imageUrl = data.response?.output?.[0]?.url || data.image_url || undefined;
    return { status: "succeeded", imageUrl };
  }
  if (["running", "processing"].includes(status)) return { status: "running" };
  if (["failed", "error", "canceled"].includes(status)) return { status: "failed", error: data.error || "failed" };
  return { status: "queued" };
}

