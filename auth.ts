import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const providers = [GitHub];

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
