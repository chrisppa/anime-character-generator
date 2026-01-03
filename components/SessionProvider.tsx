"use client";

import { SessionProvider } from "@auth/nextjs/react";

export default function AppSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
