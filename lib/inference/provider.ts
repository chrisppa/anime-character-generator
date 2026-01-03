import { env } from "@/lib/env";
import type { SubmitParams, SubmitResult, StatusResult } from "@/lib/inference/types";
import * as runware from "@/lib/inference/runware";
import * as fal from "@/lib/inference/fal";
import * as mock from "@/lib/inference/mock";

export const inference = {
  submit: (params: SubmitParams): Promise<SubmitResult> => {
    if (env.INFERENCE_PROVIDER === "fal") return fal.submit(params);
    if (env.INFERENCE_PROVIDER === "mock") return mock.submit(params);
    return runware.submit(params);
  },
  getStatus: (providerJobId: string): Promise<StatusResult> => {
    if (env.INFERENCE_PROVIDER === "fal") return fal.getStatus(providerJobId);
    if (env.INFERENCE_PROVIDER === "mock") return mock.getStatus(providerJobId);
    return runware.getStatus(providerJobId);
  },
};
