import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, token }: any) {
      if (session?.user) (session.user as any).id = token?.sub;
      return session;
    },
  },
} satisfies Parameters<typeof NextAuth>[0];

export const { auth, signIn, signOut } = NextAuth(authConfig);
