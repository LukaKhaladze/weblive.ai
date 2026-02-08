import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { SiteSchema, SeoSchema, WizardInputSchema } from "@/lib/schema";

function isExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() < Date.now();
}

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer
    .from("projects")
    .select("id, input, site, seo, expires_at, share_slug, edit_token, status")
    .eq("edit_token", params.token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (isExpired(data.expires_at)) {
    return NextResponse.json({ error: "Expired" }, { status: 410 });
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

  return NextResponse.json(data);
}

export async function PUT(req: Request, { params }: { params: { token: string } }) {
  const body = await req.json();
  const supabaseServer = getSupabaseServer();

  const updates: Record<string, any> = {};
  if (body.input) {
    const parsedInput = WizardInputSchema.safeParse(body.input);
    if (!parsedInput.success) {
      return NextResponse.json({ error: parsedInput.error.flatten() }, { status: 400 });
    }
    updates.input = parsedInput.data;
  }
  if (body.site) {
    const parsedSite = SiteSchema.safeParse(body.site);
    if (!parsedSite.success) {
      return NextResponse.json({ error: parsedSite.error.flatten() }, { status: 400 });
    }
    updates.site = parsedSite.data;
  }
  if (body.seo) {
    const parsedSeo = SeoSchema.safeParse(body.seo);
    if (!parsedSeo.success) {
      return NextResponse.json({ error: parsedSeo.error.flatten() }, { status: 400 });
    }
    updates.seo = parsedSeo.data;
  }

  const logoFromSite = updates.site
    ? updates.site.pages
        .flatMap((page: any) => page.sections)
        .find((section: any) => section.widget === "header")?.props?.logo || ""
    : "";

  if (logoFromSite && !updates.input?.logoUrl) {
    if (!updates.input) {
      const { data: existingInput } = await supabaseServer
        .from("projects")
        .select("input")
        .eq("edit_token", params.token)
        .single();
      if (existingInput?.input) {
        updates.input = { ...existingInput.input, logoUrl: logoFromSite };
      }
    } else {
      updates.input = { ...updates.input, logoUrl: logoFromSite };
    }
  }

  if (updates.input?.logoUrl && !updates.site) {
    const { data: existing } = await supabaseServer
      .from("projects")
      .select("site")
      .eq("edit_token", params.token)
      .single();
    if (existing?.site) {
      updates.site = {
        ...existing.site,
        pages: existing.site.pages.map((page: any) => ({
          ...page,
          sections: page.sections.map((section: any) =>
            section.widget === "header"
              ? { ...section, props: { ...section.props, logo: updates.input.logoUrl } }
              : section
          ),
        })),
      };
    }
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseServer
    .from("projects")
    .update(updates)
    .eq("edit_token", params.token)
    .select("id, input, site, seo, expires_at, share_slug, edit_token, status")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  if (isExpired(data.expires_at)) {
    return NextResponse.json({ error: "Expired" }, { status: 410 });
  }

  return NextResponse.json(data);
}
