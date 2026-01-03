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
  // Runware expects an array of tasks; we send one imageInference task
  const task: any = {
    taskType: "imageInference",
    input: params.type === "img2img" ? "image" : "text",
    model: RUNWARE_MODEL,
    parameters: {
      prompt: params.prompt,
      negative_prompt: params.negativePrompt,
      // width/height/seed may be added later
    },
  };
  if (params.loraUrl) {
    // Placeholder: when docs specify LoRA/adapters param, pass it here
    task.parameters.lora_url = params.loraUrl;
  }
  if (params.type === "img2img" && params.imageUrl) {
    task.parameters.image_url = params.imageUrl;
  }
  const body = [task];

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
  // Response may include an array of tasks; pick the first UUID
  const jobId = data.taskUUID || data.id || data.jobId || data.request_id || data?.[0]?.taskUUID || "";
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
  const rawStatus = (data.taskStatus || data.status || data.state || "queued").toString().toLowerCase();
  const status = rawStatus === "completed" ? "succeeded" : rawStatus as StatusResult["status"];
  if (status === "succeeded") {
    const imageUrl = data.output?.images?.[0]?.url || data.output?.[0]?.url || data.image_url || data.images?.[0]?.url || undefined;
    return { status: "succeeded", imageUrl };
  }
  if (["running", "processing", "in_progress"].includes(status)) return { status: "running" } as StatusResult;
  if (["failed", "error", "canceled"].includes(status)) return { status: "failed", error: data.error || data.message || "failed" } as StatusResult;
  return { status: "queued" };
}
