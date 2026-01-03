import { SubmitParams, SubmitResult, StatusResult } from "@/lib/inference/types";

type MockJob = { at: number; url: string };
const globalForMock = globalThis as unknown as { __mockJobs?: Map<string, MockJob> };
const store = (globalForMock.__mockJobs ??= new Map<string, MockJob>());

function randomImage() {
  const imgs = [
    "/images/hero1.png",
    "/images/hero2.png",
    "/images/model1.webp",
    "/images/model5.webp",
    "/images/model9.webp",
  ];
  return imgs[Math.floor(Math.random() * imgs.length)];
}

export async function submit(_params: SubmitParams): Promise<SubmitResult> {
  // mark as used for linting purposes
  void _params;
  const id = `mock-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
  store.set(id, { at: Date.now(), url: randomImage() });
  return { providerJobId: id, status: "queued" };
}

export async function getStatus(providerJobId: string): Promise<StatusResult> {
  const job = store.get(providerJobId);
  if (!job) return { status: "failed", error: "Unknown mock job" };
  const elapsed = Date.now() - job.at;
  if (elapsed < 2000) return { status: "running" };
  return { status: "succeeded", imageUrl: job.url };
}
