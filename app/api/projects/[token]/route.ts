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
