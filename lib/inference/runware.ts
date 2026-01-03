import { SubmitParams, SubmitResult, StatusResult } from "@/lib/inference/types";

const RUNWARE_BASE = process.env.RUNWARE_BASE || "https://api.runware.ai/v1";
const RUNWARE_GENERATE_URL = process.env.RUNWARE_GENERATE_URL || `${RUNWARE_BASE}/images/generate/async`;
const RUNWARE_STATUS_URL_TEMPLATE = process.env.RUNWARE_STATUS_URL_TEMPLATE || `${RUNWARE_BASE}/jobs/{id}`;
const RUNWARE_MODEL = process.env.RUNWARE_MODEL || "flux-schnell";

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
  const url = RUNWARE_GENERATE_URL;
  const body: any = {
    prompt: params.prompt,
    model: RUNWARE_MODEL,
    loras: params.loraUrl ? [{ url: params.loraUrl, scale: 1.0 }] : undefined,
    mode: params.type,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("Runware submit failed", res.status, text);
    return { providerJobId: "", status: "failed", error: text };
  }

  let data: any = {};
  try { data = JSON.parse(text); } catch {}
  console.log("Runware submit ok", data);
  const jobId = data.id || data.jobId || data.request_id || "";
  return { providerJobId: jobId, status: "queued" };
}

export async function getStatus(providerJobId: string): Promise<StatusResult> {
  const url = RUNWARE_STATUS_URL_TEMPLATE.replace("{id}", providerJobId);
  const res = await fetch(url, { headers: headers() });
  const text = await res.text();
  if (!res.ok) {
    console.error("Runware status failed", res.status, text);
    return { status: "failed", error: text };
  }
  let data: any = {};
  try { data = JSON.parse(text); } catch {}
  console.log("Runware status", data);
  const status = (data.status || data.state || "queued").toLowerCase();
  if (status === "succeeded" || status === "completed") {
    const imageUrl = data.output?.[0]?.url || data.image_url || data.images?.[0]?.url || undefined;
    return { status: "succeeded", imageUrl };
  }
  if (["running", "processing"].includes(status)) return { status: "running" };
  if (["failed", "error", "canceled"].includes(status)) return { status: "failed", error: data.error || "failed" };
  return { status: "queued" };
}
