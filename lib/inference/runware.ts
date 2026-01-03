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

type RunwareTaskInput = "text" | "image";
interface RunwareTask {
  taskType: "imageInference";
  input: RunwareTaskInput;
  model: string;
  parameters: {
    prompt?: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    guidance_scale?: number;
    seed?: number | string;
    lora_url?: string;
    image_url?: string;
    [key: string]: unknown;
  };
}

type RunwareSubmitResponse = Record<string, unknown> | Array<Record<string, unknown>>;
type RunwareStatusResponse = {
  taskStatus?: string;
  status?: string;
  state?: string;
  output?: { images?: Array<{ url?: string }> } | Array<{ url?: string }>;
  image_url?: string;
  images?: Array<{ url?: string }>;
  error?: string;
  message?: string;
} & Record<string, unknown>;

// NOTE: Runware exposes multiple endpoints; this wrapper uses a generic pattern.
// Adjust the model and payload as you finalize the chosen model.
export async function submit(params: SubmitParams): Promise<SubmitResult> {
  const url = RUNWARE_GENERATE_URL;
  // Runware expects an array of tasks; we send one imageInference task
  const task: RunwareTask = {
    taskType: "imageInference",
    input: params.type === "img2img" ? "image" : "text",
    model: RUNWARE_MODEL,
    parameters: {
      prompt: params.prompt,
      negative_prompt: params.negativePrompt,
      // width/height/seed may be added later
    },
  };
  if (params.width) task.parameters.width = params.width;
  if (params.height) task.parameters.height = params.height;
  if (params.steps) task.parameters.steps = params.steps;
  if (params.cfgScale) task.parameters.guidance_scale = params.cfgScale;
  if (params.seed !== undefined) task.parameters.seed = params.seed;
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

  let data: RunwareSubmitResponse = {};
  try { data = JSON.parse(text) as RunwareSubmitResponse; } catch {}
  console.log("Runware submit ok", data);
  // Response may include an array of tasks; pick the first UUID-like field
  const first: Record<string, unknown> | undefined = Array.isArray(data) ? data[0] : data;
  let jobId = "";
  if (first && typeof first === "object") {
    const obj = first as Record<string, unknown>;
    const cand = [obj["taskUUID"], obj["id"], obj["jobId"], obj["request_id"]];
    for (const v of cand) {
      if (typeof v === "string" && v) { jobId = v; break; }
    }
  }
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
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { parsed = {}; }
  const data = (parsed ?? {}) as RunwareStatusResponse;
  console.log("Runware status", data);
  const rawStatus = (data.taskStatus || data.status || data.state || "queued").toString().toLowerCase();
  const status = rawStatus === "completed" ? "succeeded" : (rawStatus as StatusResult["status"]);
  if (status === "succeeded") {
    const out = data.output as unknown;
    let imageUrl: string | undefined;
    if (Array.isArray(out)) {
      const first = out[0];
      imageUrl = first && typeof first === "object" && typeof (first as { url?: unknown }).url === "string" ? (first as { url?: string }).url : undefined;
    } else if (out && typeof out === "object" && "images" in out) {
      const images = (out as { images?: Array<{ url?: string }> }).images;
      imageUrl = images?.[0]?.url;
    }
    if (!imageUrl) imageUrl = data.image_url || data.images?.[0]?.url;
    return { status: "succeeded", imageUrl };
  }
  if (["running", "processing", "in_progress"].includes(status)) return { status: "running" };
  if (["failed", "error", "canceled"].includes(status)) return { status: "failed", error: data.error || data.message || "failed" };
  return { status: "queued" };
}
