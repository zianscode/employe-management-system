import NextAuth, { CredentialsSignin, type User } from "next-auth";
import { JWT } from "next-auth/jwt";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/server/db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";

class UserNotFoundError extends CredentialsSignin {
  code = "user_not_found";
}

const nextAuth = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, 
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const normalizedEmail = email.toLowerCase().trim();

          const user = await prisma.user.findUnique({ 
            where: { email: normalizedEmail },
            include: { 
              role: true,
              employee: true
            }
          });

          if (!user) {
            throw new UserNotFoundError();
          }

          const passwordsMatch = await bcrypt.compare(password.trim(), user.password);

          if (passwordsMatch) {
            const isComplete = user.employee?.isProfileComplete ?? false;
            console.log(`[AUTH] User ${normalizedEmail} login. Profile Complete: ${isComplete}`);
            
            return {
              id: user.id,
              email: user.email,
              name: user.employee?.name || "User",
              image: user.employee?.avatar || null, 
              role: user.role.name,
              isProfileComplete: isComplete,
              employeeId: user.employee?.id
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }: { token: JWT; user?: User; trigger?: string; session?: Record<string, unknown> }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isProfileComplete = user.isProfileComplete;
        token.employeeId = user.employeeId;
        token.picture = user.image; 
      }

      if (trigger === "update" && session) {
        const updatedToken = { ...token, ...session };
        if (session.image) {
          updatedToken.picture = session.image as string;
        }
        if (session.picture) {
          updatedToken.picture = session.picture as string;
        }
        if (session.name) {
          updatedToken.name = session.name as string;
        }
        return updatedToken;
      }

      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: { employee: true }
          });
          
          if (!dbUser) {
            console.log(`[AUTH] User ID ${token.id} TIDAK ADA di DB. Invaliding session.`);
            return null; 
          }

          token.isProfileComplete = dbUser.employee?.isProfileComplete ?? false;
          token.employeeId = dbUser.employee?.id;
          
          const avatar = dbUser.employee?.avatar;
          if (avatar && avatar.startsWith("data:image") && avatar.length > 2000) {
            token.picture = null; 
            console.log(`[AUTH] Avatar for ${dbUser.email} is too large (Base64). Skipping from token.`);
          } else {
            token.picture = avatar;
          }
          
          console.log(`[AUTH] DB Check: ${dbUser.email} | Image: ${token.picture ? "URL" : "SKIPPED/NULL"}`);
        } catch (error) {
          console.error("[AUTH] DB Check Error:", error);
          return null;
        }
      }

      return token;
    },
  },
});

export const { handlers, auth, signIn, signOut } = nextAuth;
