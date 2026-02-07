import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

function isExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() < Date.now();
}

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer
    .from("projects")
    .select("id, input, site, seo, expires_at, share_slug")
    .eq("share_slug", params.slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (isExpired(data.expires_at)) {
    return NextResponse.json({ error: "Expired" }, { status: 410 });
  }

  return NextResponse.json(data);
}
