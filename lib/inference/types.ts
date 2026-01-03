export type JobType = "txt2img" | "img2img" | "inpainting";

export type SubmitParams = {
  prompt: string;
  type: JobType;
  loraUrl?: string; // signed URL to safetensors or LoRA ref
  imageUrl?: string; // for img2img/inpainting
  negativePrompt?: string;
  // optional generation params
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  seed?: number | string;
};

export type SubmitResult = {
  providerJobId: string;
  status: "queued" | "running" | "succeeded" | "failed";
  imageUrl?: string;
  error?: string;
};

export type StatusResult = {
  status: "queued" | "running" | "succeeded" | "failed";
  imageUrl?: string;
  error?: string;
};
