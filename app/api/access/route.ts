import { NextResponse } from "next/server";

const ACCESS_COOKIE = "weblive_access";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  const expectedPassword = process.env.SITE_ACCESS_PASSWORD || "Sadafa123!";
  if (password !== expectedPassword) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, "granted", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}

