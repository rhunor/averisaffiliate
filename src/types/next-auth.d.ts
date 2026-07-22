import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    referralCode: string;
    isActive: boolean;
    isEmailVerified: boolean;
    isLifetime: boolean;
    subscriptionExpiresAt: string | null;
  }

  interface Session {
    user: User & {
      id: string;
      role: string;
      referralCode: string;
      isActive: boolean;
      isEmailVerified: boolean;
      isLifetime: boolean;
      subscriptionExpiresAt: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    referralCode: string;
    isActive: boolean;
    isEmailVerified: boolean;
    isLifetime: boolean;
    subscriptionExpiresAt: string | null;
  }
}
