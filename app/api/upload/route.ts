import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const form = await req.formData();
  const supabaseServer = getSupabaseServer();
  const file = form.get("file");
  const projectId = form.get("projectId");
  const type = form.get("type");

  if (!(file instanceof File) || typeof projectId !== "string" || typeof type !== "string") {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const safeType = type === "logo" ? "logo" : "images";
  const ext = file.name.split(".").pop() || "png";
  const path = `${projectId}/${safeType}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseServer.storage
    .from("weblive-assets")
    .upload(path, file, { contentType: file.type || "image/png" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: signed } = await supabaseServer.storage
    .from("weblive-assets")
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  return NextResponse.json({ path, url: signed?.signedUrl || "" });
}
