import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./src/lib/auth";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/login", "/signup"];

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  const { pathname } = req.nextUrl;
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
    const payload = verifyToken(token);
    if (!payload) {
        const response = NextResponse.redirect(new URL("/login", req.url));
        response.cookies.set("auth-token", "", { maxAge: 0, path: "/" });
        return response;
    }
  }

  if (isAuthRoute && token) {
    const payload = verifyToken(token);
    if (payload) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/login", "/signup"],
};