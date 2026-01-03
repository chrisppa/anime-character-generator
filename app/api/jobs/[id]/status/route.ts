import { prisma } from "@/lib/db";
import { inference } from "@/lib/inference/provider";
import { NextRequest } from "next/server";

// In Next.js 16+/React 19, `params` is a Promise in route handlers.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return new Response(JSON.stringify({ error: "not found" }), { status: 404 });

    // If already terminal, return
    if (["succeeded", "failed"].includes(job.status)) {
      return Response.json({ status: job.status, imageUrl: job.imageUrl, error: job.error });
    }

    // Poll provider once
    if (job.providerJobId) {
      const status = await inference.getStatus(job.providerJobId);
      if (status.status !== job.status || status.imageUrl) {
        const updated = await prisma.job.update({
          where: { id: job.id },
          data: { status: status.status, imageUrl: status.imageUrl, error: status.error },
        });
        return Response.json({ status: updated.status, imageUrl: updated.imageUrl, error: updated.error });
      }
    }

    return Response.json({ status: job.status });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "failed" }), { status: 500 });
  }
}
