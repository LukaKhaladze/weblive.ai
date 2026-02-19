import { NextResponse } from "next/server";
import { planSite } from "@/lib/planner";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;
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

  const body = await req.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  try {
    const result = await planSite({
      prompt,
      locale: typeof body?.locale === "string" ? body.locale : "en",
      brand: body?.brand,
      contact: body?.contact,
      constraints: body?.constraints,
    });

    return NextResponse.json({
      siteSpec: result.siteSpec,
      warnings: result.warnings,
      unsupported_features: result.unsupported_features,
    });
  } catch (error) {
    console.error("/api/plan failed", error);
    return NextResponse.json({ error: "Planning failed." }, { status: 500 });
  }
}
