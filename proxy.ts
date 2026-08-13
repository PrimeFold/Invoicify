import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function proxy(request: NextRequest) {
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname.startsWith("/auth");
  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.includes("/pdf") ||
    request.nextUrl.pathname.includes("/api/invoices/public") ||
    request.nextUrl.pathname.includes("/preview/invoice");

  if (isAuthRoute || isPublicRoute) {
    return NextResponse.next();
  }

  let session = null;
  try {
    session = await auth.api.getSession({
      headers: request.headers,
    });
  } catch (error) {
    console.warn("Proxy: Database connection issue bypassed on route:", request.nextUrl.pathname, error);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
