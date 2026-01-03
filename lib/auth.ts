import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

const providers = [] as any[];
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  );
}
// Dev-only fallback provider to unblock local testing if OAuth is not configured
providers.push(
  Credentials({
    name: "Dev Login",
    credentials: {
      email: { label: "Email", type: "email" },
    },
    async authorize(credentials) {
      const email = credentials?.email as string | undefined;
      if (!email) return null;
      return { id: email, name: email, email } as any;
    },
  })
);

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  providers,
  debug: process.env.NODE_ENV !== "production",
  callbacks: {
    async session({ session, token }: any) {
      if (session?.user) (session.user as any).id = token?.sub;
      return session;
    },
  },
} satisfies Parameters<typeof NextAuth>[0];

export const { auth, signIn, signOut } = NextAuth(authConfig);
