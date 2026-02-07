import { NextResponse } from "next/server";
import { SeoSchema, SiteSchema, WizardInputSchema } from "@/lib/schema";
import { generateEditToken, generateShareSlug } from "@/lib/tokens";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { generateWithAiStub } from "@/lib/generator/aiStub";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rateLimitStore = new Map<string, { count: number; start: number }>();

function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, start: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count += 1;
  rateLimitStore.set(ip, entry);
  return true;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = WizardInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const editToken = generateEditToken();
  const shareSlug = generateShareSlug();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const { site, seo } = await generateWithAiStub(input);
  const siteParsed = SiteSchema.safeParse(site);
  const seoParsed = SeoSchema.safeParse(seo);
  if (!siteParsed.success || !seoParsed.success) {
    return NextResponse.json({ error: "Generator output invalid." }, { status: 500 });
  }

  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer
    .from("projects")
    .insert({
      edit_token: editToken,
      share_slug: shareSlug,
      expires_at: expiresAt.toISOString(),
      input,
      site: siteParsed.data,
      seo: seoParsed.data,
      status: "generated",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    edit_token: editToken,
    share_slug: shareSlug,
    expires_at: data.expires_at,
  });
}
