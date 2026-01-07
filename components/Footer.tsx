"use client";

import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="relative bg-black pt-20 pb-10 overflow-hidden">
      {/* 1. The Massive Scrolling Background (Marquee) */}
      <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none opacity-20 select-none py-4">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className="text-[180px] font-black italic uppercase tracking-tighter text-transparent stroke-white stroke-2"
              style={{ WebkitTextStroke: "2px rgba(255,255,255,0.3)" }}
            >
              &nbsp;GENERATE_THE_FUTURE_LIMITLESS_CREATIVITY_
            </span>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 2. Main CTA Card - Neo-Brutalist Style */}
          <div className="bg-[#E2E2D1] border-4 border-white p-8 md:p-12 shadow-[16px_16px_0px_0px_#facc15] transition-transform hover:-translate-y-2">
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-black leading-none mb-6 font-druk-text-wide">
              READY TO
              <br />
              PLUG IN?
            </h2>
            <p className="text-black font-bold mb-8 max-w-sm leading-tight italic">
              Access our specialized LoRA nodes and start generating
              studio-quality anime assets today.
            </p>
            <Link href="/api/auth/signin">
              <button className="group relative bg-black text-white px-8 py-4 font-black uppercase tracking-widest text-lg border-4 border-black hover:bg-white hover:text-black transition-colors w-full md:w-auto cursor-pointer">
                JOIN THE NETWORK
                <span className="absolute -right-4 -bottom-4 bg-yellow-400 text-black text-[10px] px-2 py-1 border-2 border-black group-hover:bg-white transition-colors">
                  JOIN THE FUN
                </span>
              </button>
            </Link>
          </div>

          {/* 3. Link Grid & Technical Specs */}
          <div className="grid grid-cols-2 gap-8 text-white">
            <div className="space-y-4">
              <h4 className="font-black text-yellow-400 uppercase tracking-widest text-xs border-b border-white/20 pb-2">
                Navigation
              </h4>
              <ul className="space-y-2 font-bold uppercase text-sm">
                <li>
                  <Link
                    href="/models"
                    className="hover:text-yellow-400 cursor-pointer transition-colors inline-block"
                  >
                    Models
                  </Link>
                </li>
                <li>
                  <Link
                    href="/events"
                    className="hover:text-yellow-400 cursor-pointer transition-colors inline-block"
                  >
                    Events
                  </Link>
                </li>
                <li>
                  <Link
                    href="/changelog"
                    className="hover:text-yellow-400 cursor-pointer transition-colors inline-block"
                  >
                    Changelog
                  </Link>
                </li>
                <li>
                  <a
                    href="https://docs.yoursite.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-yellow-400 cursor-pointer transition-colors inline-block"
                  >
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-yellow-400 uppercase tracking-widest text-xs border-b border-white/20 pb-2">
                Community
              </h4>
              <ul className="space-y-2 font-bold uppercase text-sm">
                <li>
                  <a
                    href="https://ko-fi.com/chrisppa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block cursor-pointer transition-opacity hover:opacity-80"
                    aria-label="Ko‑fi (Sponsor)"
                  >
                    <Image
                      src="https://ko-fi.com/img/githubbutton_sm.svg"
                      alt="Ko‑fi"
                      width={110}
                      height={28}
                      className="h-6 w-auto md:h-7"
                      unoptimized
                    />
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.com/invite/civitai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-yellow-400 cursor-pointer transition-colors inline-block"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com/kristuryasiima"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-yellow-400 cursor-pointer transition-colors inline-block"
                  >
                    Twitter (X)
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/chrisppa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-yellow-400 cursor-pointer transition-colors inline-block"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 4. Bottom Legal / Data Strip */}
        <div className="mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="font-black text-2xl text-white tracking-tighter">
              ani♥mind
            </div>
            <div className="h-4 w-px bg-white/30 hidden md:block" />
            <p className="text-[10px] font-mono text-white/50 tracking-widest uppercase">
              © 2026 ALL_RIGHTS_RESERVED
            </p>
          </div>

          <div className="flex gap-4">
            {["Author: crispa", "MODEL: LoRA", "TYPE: ANIME"].map((stat) => (
              <div
                key={stat}
                className="text-[9px] font-mono font-bold bg-white/5 px-2 py-1 rounded border border-white/10 text-white/40"
              >
                {stat}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
