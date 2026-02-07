import { getSupabaseServer } from "@/lib/supabaseServer";

export async function fetchProjectByEditToken(token: string) {
  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer
    .from("projects")
    .select("id, input, site, seo, expires_at, share_slug, edit_token, status")
    .eq("edit_token", token)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function fetchProjectByShareSlug(slug: string) {
  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer
    .from("projects")
    .select("id, input, site, seo, expires_at, share_slug")
    .eq("share_slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
