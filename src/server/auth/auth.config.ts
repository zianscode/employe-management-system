import type { NextAuthConfig } from "next-auth";
import { canAccessRoute } from "@/shared/constants/roles";

export const CHANGE_PASSWORD_PATH = "/change-password";
const ONBOARDING_PATH = "/onboarding";
const DASHBOARD_PATH = "/dashboard";

function landingPathFor(user: { mustChangePassword?: boolean; isProfileComplete?: boolean }) {
  if (user.mustChangePassword) return CHANGE_PASSWORD_PATH;
  if (!user.isProfileComplete) return ONBOARDING_PATH;
  return DASHBOARD_PATH;
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const path = nextUrl.pathname;
      const isProtected = [DASHBOARD_PATH, ONBOARDING_PATH, CHANGE_PASSWORD_PATH].some((p) => path.startsWith(p));
      const user = auth?.user;

      if (!user) return !isProtected;

      const landing = landingPathFor(user);
      const redirectTo = (target: string) => Response.redirect(new URL(target, nextUrl));

      if (path === "/" || path === "/login") return redirectTo(landing);
      if (landing !== DASHBOARD_PATH && isProtected && !path.startsWith(landing)) return redirectTo(landing);
      if (landing === DASHBOARD_PATH && (path.startsWith(ONBOARDING_PATH) || path.startsWith(CHANGE_PASSWORD_PATH))) {
        return redirectTo(DASHBOARD_PATH);
      }
      if (path.startsWith(DASHBOARD_PATH) && !canAccessRoute(path, user.role)) return redirectTo(DASHBOARD_PATH);

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isProfileComplete = user.isProfileComplete;
        token.mustChangePassword = user.mustChangePassword;
        token.employeeId = user.employeeId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isProfileComplete = token.isProfileComplete as boolean;
        session.user.mustChangePassword = token.mustChangePassword as boolean;
        session.user.employeeId = token.employeeId as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
