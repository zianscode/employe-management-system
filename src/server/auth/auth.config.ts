import type { NextAuthConfig } from "next-auth";
import { canAccessRoute } from "@/shared/constants/roles";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProfileComplete = auth?.user?.isProfileComplete === true;
      
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnOnboarding = nextUrl.pathname.startsWith("/onboarding");

      if (isLoggedIn) {
        if (isOnDashboard && !canAccessRoute(nextUrl.pathname, auth?.user?.role)) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }

        if (!isProfileComplete && !isOnOnboarding && isOnDashboard) {
          return Response.redirect(new URL("/onboarding", nextUrl));
        }
        
        if (isProfileComplete && isOnOnboarding) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }

        if (nextUrl.pathname === "/login" || nextUrl.pathname === "/") {
           return Response.redirect(new URL("/dashboard", nextUrl));
        }
      } else if (isOnDashboard || isOnOnboarding) {
        return false; 
      }
      
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isProfileComplete = user.isProfileComplete;
        token.employeeId = user.employeeId;
      }
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isProfileComplete = token.isProfileComplete as boolean;
        session.user.employeeId = token.employeeId as string;
        session.user.image = token.picture as string; 
      }
      return session;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;
