import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import type { Session } from "next-auth";

type NextAuthResultLite = {
  handlers: Record<"GET" | "POST", (req: unknown) => Promise<Response>>;
  // We primarily use the zero-arg variant in this codebase
  auth: () => Promise<Session | null>;
  signIn: (...args: unknown[]) => Promise<unknown>;
  signOut: (...args: unknown[]) => Promise<unknown>;
};

type NextAuthConfigLite = {
  providers: unknown[];
  debug?: boolean;
  callbacks?: {
    session?: (args: { session: Session; token: Record<string, unknown> }) => Promise<Session>;
  };
};

const config: NextAuthConfigLite = {
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
};
export const { handlers, auth, signIn, signOut } = (NextAuth as unknown as (c: NextAuthConfigLite) => NextAuthResultLite)(config);
