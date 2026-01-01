"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Home, ArrowLeft } from 'lucide-react';
import { not_found } from '@/public/images';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#E2E2D1] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      
      {/* Massive Background Decorative Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
        <h1 className="font-druk-condensed text-[25rem] md:text-[40rem] leading-none text-black/3 italic tracking-tighter">
          404
        </h1>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-4xl w-full text-center">
        
        {/* The Image Container */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8 border-[6px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden group">
          <Image 
            src={not_found} // Replace with your generated character path
            alt="404 Host"
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
          />
        </div>

        {/* Text Content */}
        <div className="space-y-4">
            <p className="font-inter font-bold text-sm md:text-base max-w-md text-black/70">
              The character or page you are looking for has been de-rezzed or moved to a different sector. Even our top models couldn&apos;t find this one.
            </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col md:flex-row gap-6 w-full md:w-auto">
          <Link href="/" className="w-full md:w-auto">
            <button className="w-full bg-[#FAFF00] border-4 border-black px-10 py-5 font-druk-text-wide text-[11px] uppercase tracking-tighter flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <Home size={18} strokeWidth={3} /> Return to Home
            </button>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full md:w-auto bg-white border-4 border-black px-10 py-5 font-druk-text-wide text-[11px] uppercase tracking-tighter flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <ArrowLeft size={18} strokeWidth={3} /> Previous Sector
          </button>
        </div>
      </div>
    </div>
  );
}