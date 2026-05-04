import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEMO_USER_ID, SESSION_COOKIE } from "@/lib/session";

const protectedPaths = ["/dashboard", "/repos", "/changelogs", "/settings"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const session = req.cookies.get(SESSION_COOKIE)?.value;
  if (session === DEMO_USER_ID) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("signin", "required");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/repos/:path*", "/changelogs/:path*", "/settings/:path*"],
};
