import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export async function GET(req: Request) {
  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
