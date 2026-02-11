import { getSupabaseServer } from "@/lib/supabaseServer";
import { unstable_noStore as noStore } from "next/cache";

export async function fetchProjectByEditToken(token: string) {
  noStore();
  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer
    .from("projects")
    .select("id, input, site, seo, expires_at, share_slug, edit_token, status")
    .eq("edit_token", token)
    .single();

  if (error || !data) {
    return null;
  }

  if (data?.input?.logoUrl && data.site) {
    data.site = {
      ...data.site,
      pages: data.site.pages.map((page: any) => ({
        ...page,
        sections: page.sections.map((section: any) =>
          section.widget === "header"
            ? { ...section, props: { ...section.props, logo: data.input.logoUrl } }
            : section
        ),
      })),
    };
  }

  return data;
}

export async function fetchProjectByShareSlug(slug: string) {
  noStore();
  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer
    .from("projects")
    .select("id, input, site, seo, expires_at, share_slug")
    .eq("share_slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  if (data?.input?.logoUrl && data.site) {
    data.site = {
      ...data.site,
      pages: data.site.pages.map((page: any) => ({
        ...page,
        sections: page.sections.map((section: any) =>
          section.widget === "header"
            ? { ...section, props: { ...section.props, logo: data.input.logoUrl } }
            : section
        ),
      })),
    };
  }

  return data;
}
