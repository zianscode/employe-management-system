import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    isProfileComplete: boolean;
    mustChangePassword: boolean;
    employeeId?: string;
    image?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      role: string;
      isProfileComplete: boolean;
      mustChangePassword: boolean;
      employeeId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    isProfileComplete: boolean;
    mustChangePassword: boolean;
    employeeId?: string;
    picture?: string | null;
  }
}
