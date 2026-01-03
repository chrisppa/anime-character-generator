"use client";

import { signIn } from "next-auth/react";

export default function SignInButton({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <button
      onClick={() => signIn("github")}
      className={className || "px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 text-sm font-bold"}
    >
      {children ?? "Sign in with GitHub"}
    </button>
  );
}

