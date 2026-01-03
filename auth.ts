import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import type { Session } from "next-auth";

const config = {
  providers: [GitHub],
  debug: process.env.NODE_ENV !== "production",
  callbacks: {
    async session({ session, token }: { session: Session; token: Record<string, unknown> }) {
      if (session?.user && typeof token === "object" && token && "sub" in token) {
        (session.user as Record<string, unknown>).id = token.sub as string;
      }
      return session;
    },
  },
} satisfies Parameters<typeof NextAuth>[0];

export const { handlers, auth, signIn, signOut } = NextAuth(config);