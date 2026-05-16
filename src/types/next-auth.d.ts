import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    referralCode: string;
    isActive: boolean;
    isEmailVerified: boolean;
  }

  interface Session {
    user: User & {
      id: string;
      role: string;
      referralCode: string;
      isActive: boolean;
      isEmailVerified: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    referralCode: string;
    isActive: boolean;
    isEmailVerified: boolean;
  }
}
