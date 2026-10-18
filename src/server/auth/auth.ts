import NextAuth, { CredentialsSignin, type User } from "next-auth";
import { JWT } from "next-auth/jwt";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/server/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { EmployeeStatus } from "@prisma/client";

class UserNotFoundError extends CredentialsSignin {
  code = "user_not_found";
}

class AccountInactiveError extends CredentialsSignin {
  code = "account_inactive";
}

/** Karyawan dengan status ini tidak boleh login lagi */
const INACTIVE_STATUSES: EmployeeStatus[] = [EmployeeStatus.RESIGNED, EmployeeStatus.TERMINATED];

const nextAuth = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;
        const normalizedEmail = email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: { role: true, employee: true },
        });

        if (!user) throw new UserNotFoundError();

        const passwordsMatch = await bcrypt.compare(password.trim(), user.password);
        if (!passwordsMatch) return null;

        if (user.employee && INACTIVE_STATUSES.includes(user.employee.status)) {
          throw new AccountInactiveError();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.employee?.name || "User",
          image: user.employee?.avatar || null,
          role: user.role.name,
          isProfileComplete: user.employee?.isProfileComplete ?? false,
          employeeId: user.employee?.id,
        };
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

      // Dari client hanya nama & foto yang boleh diperbarui.
      // Role, employeeId, dan status profil selalu dibaca ulang dari database di bawah.
      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name;
        const picture = session.picture ?? session.image;
        if (typeof picture === "string") token.picture = picture;
      }

      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: { role: true, employee: true },
          });

          // Akun dihapus atau karyawan sudah nonaktif -> sesi tidak berlaku
          if (!dbUser) return null;
          if (dbUser.employee && INACTIVE_STATUSES.includes(dbUser.employee.status)) return null;

          token.role = dbUser.role.name;
          token.isProfileComplete = dbUser.employee?.isProfileComplete ?? false;
          token.employeeId = dbUser.employee?.id;

          const avatar = dbUser.employee?.avatar;
          // Avatar base64 terlalu besar untuk disimpan di cookie
          token.picture = avatar && avatar.startsWith("data:image") && avatar.length > 2000 ? null : avatar;
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
