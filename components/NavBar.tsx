"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { href: "/models", label: "Models" },
    { href: "/events", label: "Events" },
    { href: "/changelog", label: "Changelog" },
    {
      href: "https://ko-fi.com/chrisppa",
      label: "Sponsor",
      external: true,
    },
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
                className="hover:opacity-70 transition-opacity"
                {...(link.external && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA Button */}
        <Link href="/auth" className="hidden lg:block">
          <button className="bg-white border-2 border-black px-6 py-2 rounded-full font-bold text-sm hover:bg-yellow-100 transition-colors cursor-pointer">
            Join Us
          </button>
        </Link>

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
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors text-sm font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                  {...(link.external && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="px-4 pt-2">
              <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full bg-white border-2 border-black px-6 py-2 rounded-full font-bold text-sm hover:bg-yellow-100 transition-colors cursor-pointer">
                  Join Us
                </button>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};
