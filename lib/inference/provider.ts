import { env } from "@/lib/env";
import type { SubmitParams, SubmitResult, StatusResult } from "@/lib/inference/types";
import * as runware from "@/lib/inference/runware";
import * as fal from "@/lib/inference/fal";

export const inference = {
  submit: (params: SubmitParams): Promise<SubmitResult> => {
    if (env.INFERENCE_PROVIDER === "fal") return fal.submit(params);
    return runware.submit(params);
  },
  getStatus: (providerJobId: string): Promise<StatusResult> => {
    if (env.INFERENCE_PROVIDER === "fal") return fal.getStatus(providerJobId);
    return runware.getStatus(providerJobId);
  },
};

