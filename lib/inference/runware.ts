import { SubmitParams, SubmitResult, StatusResult } from "@/lib/inference/types";

const RUNWARE_BASE = "https://api.runware.ai/v1";

function headers() {
  const key = process.env.RUNWARE_API_KEY;
  if (!key) throw new Error("RUNWARE_API_KEY is not set");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  } as const;
}

// NOTE: Runware exposes multiple endpoints; this wrapper uses a generic pattern.
// Adjust the model and payload as you finalize the chosen model.
export async function submit(params: SubmitParams): Promise<SubmitResult> {
  // Example endpoint (subject to change based on chosen model)
  const url = `${RUNWARE_BASE}/images/generate/async`;
  const body: any = {
    prompt: params.prompt,
    // Example model; replace with Flux/SDXL model id from Runware
    model: "flux-schnell",
    loras: params.loraUrl ? [{ url: params.loraUrl, scale: 1.0 }] : undefined,
    mode: params.type,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return { providerJobId: "", status: "failed", error: text };
  }

  const data: any = await res.json();
  const jobId = data.id || data.jobId || data.request_id || "";
  return { providerJobId: jobId, status: "queued" };
}

export async function getStatus(providerJobId: string): Promise<StatusResult> {
  const url = `${RUNWARE_BASE}/jobs/${providerJobId}`; // adjust to actual status path
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    const text = await res.text();
    return { status: "failed", error: text };
  }
  const data: any = await res.json();
  const status = (data.status || data.state || "queued").toLowerCase();
  if (status === "succeeded" || status === "completed") {
    const imageUrl = data.output?.[0]?.url || data.image_url || undefined;
    return { status: "succeeded", imageUrl };
  }
  if (["running", "processing"].includes(status)) return { status: "running" };
  if (["failed", "error", "canceled"].includes(status)) return { status: "failed", error: data.error || "failed" };
  return { status: "queued" };
}

