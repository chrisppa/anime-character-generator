import { NextRequest } from "next/server";
import { getSignedPutUrl } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType, kind } = await req.json();
    if (!filename || !contentType) {
      return new Response(JSON.stringify({ error: "filename and contentType required" }), { status: 400 });
    }
    const folder = kind === "training" ? "training" : "loras";
    const key = `${folder}/${Date.now()}-${filename}`;
    const url = await getSignedPutUrl(key, contentType);
    return Response.json({ key, uploadUrl: url });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "failed" }), { status: 500 });
  }
}
