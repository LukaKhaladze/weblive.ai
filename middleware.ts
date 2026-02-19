import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "weblive_access";

const PUBLIC_PATH_PREFIXES = ["/_next", "/public", "/placeholders", "/uploads"];
const PUBLIC_EXACT_PATHS = ["/access", "/api/access", "/favicon.ico", "/favicon.png"];

function isPublicPath(pathname: string) {
  if (PUBLIC_EXACT_PATHS.includes(pathname)) return true;
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  if (token === "granted") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/access", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

