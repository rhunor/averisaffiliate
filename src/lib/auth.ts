import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(8) })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const bcrypt = await import("bcryptjs");
        const { default: dbConnect } = await import("@/lib/db");
        const { default: User } = await import("@/models/User");

        await dbConnect();

        const user = await User.findOne({ email: parsed.data.email });
        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          referralCode: user.referralCode,
          isActive: user.isActive,
          isEmailVerified: !!user.isEmailVerified,
          profileImage: user.profileImage || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as unknown as Record<string, unknown>;
        (token as Record<string, unknown>).email = u.email;
        (token as Record<string, unknown>).role = u.role;
        (token as Record<string, unknown>).referralCode = u.referralCode;
        (token as Record<string, unknown>).isActive = u.isActive;
        (token as Record<string, unknown>).isEmailVerified = u.isEmailVerified;
        (token as Record<string, unknown>).profileImage = u.profileImage ?? null;
      }
      if (trigger === "update") {
        const s = session as Record<string, unknown> | null;
        // If caller passed specific fields, apply them directly without a DB round-trip
        if (s?.profileImage !== undefined) {
          (token as Record<string, unknown>).profileImage = s.profileImage ?? null;
        }
        // Re-fetch mutable fields from DB to keep session in sync
        try {
          const { default: dbConnect } = await import("@/lib/db");
          const { default: User } = await import("@/models/User");
          await dbConnect();
          const dbUser = (await User.findById(token.sub).lean()) as Record<string, unknown> | null;
          if (dbUser) {
            (token as Record<string, unknown>).isEmailVerified = !!dbUser.isEmailVerified;
            (token as Record<string, unknown>).isActive = dbUser.isActive;
            // Only overwrite profileImage from DB if the caller didn't supply it
            if (s?.profileImage === undefined) {
              (token as Record<string, unknown>).profileImage = (dbUser.profileImage as string) ?? null;
            }
          }
        } catch {
          // Non-fatal — token still has the caller-supplied values
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const tok = token as Record<string, unknown>;
        const s = session.user as unknown as Record<string, unknown>;
        s.id = tok.sub as string;
        s.email = tok.email as string;
        s.role = tok.role as string;
        s.referralCode = tok.referralCode as string;
        s.isActive = tok.isActive as boolean;
        s.isEmailVerified = tok.isEmailVerified as boolean;
        s.profileImage = (tok.profileImage as string) ?? null;
      }
      return session;
    },
  },
});
