import { NextResponse, type NextRequest } from "next/server";
import { readSession, SESSION_COOKIE } from "@/lib/api/backend";
import { canAccessRoute } from "@/shared/constants/roles";

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const protectedPath = ["/dashboard", "/change-password", "/onboarding"].find((route) => path === route || path.startsWith(`${route}/`));
  if (!protectedPath && path !== "/login") return NextResponse.next();
  const session = await readSession(request.cookies.get(SESSION_COOKIE)?.value);
  const redirect = (target: string) => NextResponse.redirect(new URL(target, request.url));
  if (!session) return protectedPath ? redirect("/login") : NextResponse.next();
  const { user } = session;
  const landing = user.mustChangePassword ? "/change-password" : !user.isProfileComplete ? "/onboarding" : "/dashboard";
  if (path === "/login" || protectedPath !== landing || !canAccessRoute(path, user.role)) return redirect(landing);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
