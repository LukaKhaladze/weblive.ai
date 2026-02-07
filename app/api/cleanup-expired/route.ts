import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

async function removeFolderFiles(projectId: string, folder: string) {
  const supabaseServer = getSupabaseServer();
  const { data } = await supabaseServer.storage
    .from("weblive-assets")
    .list(`${projectId}/${folder}`, { limit: 100 });

  if (!data || data.length === 0) {
    return;
  }

  const paths = data.map((item) => `${projectId}/${folder}/${item.name}`);
  await supabaseServer.storage.from("weblive-assets").remove(paths);
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const supabaseServer = getSupabaseServer();

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const { data: expired, error } = await supabaseServer
    .from("projects")
    .select("id")
    .lt("expires_at", now);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  for (const project of expired || []) {
    await removeFolderFiles(project.id, "logo");
    await removeFolderFiles(project.id, "images");
  }

  if (expired && expired.length > 0) {
    await supabaseServer.from("projects").delete().in(
      "id",
      expired.map((item) => item.id)
    );
  }

  return NextResponse.json({ deleted: expired?.length || 0 });
}
