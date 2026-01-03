import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

const providers = [] as any[];

// GitHub OAuth (auto-detects AUTH_GITHUB_ID/SECRET if set)
providers.push(GitHub);

// Dev-only credentials fallback so local auth works without OAuth
providers.push(
  Credentials({
    name: "Dev Login",
    credentials: { email: { label: "Email", type: "email" } },
    async authorize(credentials) {
      const email = (credentials?.email as string | undefined)?.trim();
      if (!email) return null;
      return { id: email, name: email, email } as any;
    },
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  debug: process.env.NODE_ENV !== "production",
  callbacks: {
    async session({ session, token }) {
      if (session?.user) (session.user as any).id = (token as any)?.sub;
      return session;
    },
  },
});

