import { NextResponse } from "next/server";
import { DEMO_USER_ID, SESSION_COOKIE, ensureDemoUser, sessionCookieOptions } from "@/lib/auth";

export async function GET(req: Request) {
  await ensureDemoUser(true);
  const url = new URL("/dashboard", req.url);
  const response = NextResponse.redirect(url);
  response.cookies.set(SESSION_COOKIE, DEMO_USER_ID, sessionCookieOptions());
  return response;
}

export async function POST() {
  const user = await ensureDemoUser(true);
  const response = NextResponse.json({ user });
  response.cookies.set(SESSION_COOKIE, DEMO_USER_ID, sessionCookieOptions());
  return response;
}
