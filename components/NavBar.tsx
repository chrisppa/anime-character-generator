"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";

type NavLink = {
  href: string;
  label?: string;
  external?: boolean;
  iconSrc?: string;
  ariaLabel?: string;
};

export const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks: NavLink[] = [
    { href: "/models", label: "Models" },
    { href: "/events", label: "Events" },
    { href: "/changelog", label: "Changelog" },
    { href: "/models/lora", label: "LoRAs" },
    { href: "/lora/upload", label: "Upload LoRA" },
    {
      href: "https://twitter.com/kristuryasiima",
      label: "Twitter (X)",
      external: true,
    },
    {
      href: "https://discord.com/invite/civitai",
      label: "Discord",
      external: true,
    },
    { href: "https://github.com/chrisppa", label: "GitHub", external: true },
    // Ko‑fi sponsor icon as the last item
    {
      href: "https://ko-fi.com/chrisppa",
      external: true,
      iconSrc: "https://github.githubassets.com/assets/ko_fi-53a60c17e75c.svg",
      ariaLabel: "Ko‑fi (Sponsor)",
    },
  ];

  return (
    <nav className="px-4 md:px-8 lg:px-40">
      <div className="flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/">
          <h1 className="text-xl md:text-2xl font-bold cursor-pointer">
            ani&hearts;mind
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-sm font-semibold">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="hover:opacity-70 transition-opacity inline-flex items-center"
                aria-label={link.ariaLabel || link.label}
                {...(link.external && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
              >
                {link.iconSrc ? (
                  <img
                    src={link.iconSrc}
                    alt={link.ariaLabel || link.label || "Icon"}
                    className="h-5 w-auto xl:h-6"
                  />
                ) : (
                  link.label
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Auth */}
        {status === "authenticated" ? (
          <div className="hidden lg:flex items-center gap-3 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {session?.user?.image && (
              <button
                onClick={() => setIsUserMenuOpen((v) => !v)}
                className="rounded-full border-2 border-black focus:outline-none focus:ring-2 focus:ring-black/20"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
              >
                <img
                  src={session.user.image}
                  alt={session.user.name || "avatar"}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>
            )}
            {session?.user?.name && (
              <button
                onClick={() => setIsUserMenuOpen((v) => !v)}
                className="text-sm font-semibold max-w-[160px] truncate"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
              >
                {session.user.name}
              </button>
            )}
            {/* Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-50">
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    signOut();
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => signIn("github")}
            className="hidden lg:block bg-white border-2 border-black px-6 py-2 rounded-full font-bold text-sm hover:bg-yellow-100 transition-colors cursor-pointer"
          >
            Sign in
          </button>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200">
          <ul className="flex flex-col space-y-1 py-4">
            {status === "authenticated" && (
              <li className="px-4 pb-2">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {session?.user?.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "avatar"}
                      className="w-8 h-8 rounded-full border-2 border-black object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{session?.user?.name || "Signed in"}</div>
                    {session?.user?.email && (
                      <div className="text-[10px] text-gray-500 truncate">{session.user.email}</div>
                    )}
                  </div>
                </div>
              </li>
            )}
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors text-sm font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label={link.ariaLabel || link.label}
                  {...(link.external && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                >
                  {link.iconSrc ? (
                    <img
                      src={link.iconSrc}
                      alt={link.ariaLabel || link.label || "Icon"}
                      className="h-7 w-auto"
                    />
                  ) : (
                    link.label
                  )}
                </Link>
              </li>
            ))}
            <li className="px-4 pt-2">
              {status === "authenticated" ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut();
                  }}
                  className="w-full bg-white border-2 border-black px-6 py-2 rounded-full font-bold text-sm hover:bg-yellow-100 transition-colors cursor-pointer"
                >
                  Sign out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signIn("github");
                  }}
                  className="w-full bg-white border-2 border-black px-6 py-2 rounded-full font-bold text-sm hover:bg-yellow-100 transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};
