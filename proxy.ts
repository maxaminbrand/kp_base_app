import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isDev = pathname.startsWith("/dev");

  if (!isDashboard && !isAdmin && !isDev) return NextResponse.next();

  const cookieName = process.env.AUTH_SESSION_COOKIE_NAME ?? "session";
  const hasSession = !!req.cookies.get(cookieName)?.value;

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/dev/:path*"],
};