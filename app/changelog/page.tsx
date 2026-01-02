"use client";
import React from 'react';
import { Link2, Filter, ListFilter, Search } from 'lucide-react';

interface UpdateEntryProps {
  title: string;
  date: string;
  category: string;
  tag: string;
  children: React.ReactNode;
}

const UpdateEntry: React.FC<UpdateEntryProps> = ({ title, date, children }) => {
  return (
    <div className="bg-white border-2 md:border-[3px] border-black p-4 md:p-8 mb-6 md:mb-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 mb-3 md:mb-4 border-b-2 border-black/10 pb-3 md:pb-4">
        <div className="flex items-center gap-2 md:gap-3">
          <h2 className="text-base md:text-xl uppercase text-black flex items-center gap-2 font-black leading-tight">
             <Link2 size={12} className="text-gray-400 md:w-3.5 md:h-3.5 shrink-0" /> 
             <span className="wrap-break-word">{title}</span>
          </h2>
        </div>
      </div>

      {/* Date */}
      <p className="font-inter font-black text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest mb-4 md:mb-6">
        {date}
      </p>

      {/* Content Area */}
      <div className="font-inter text-xs md:text-sm leading-relaxed text-black/80 space-y-4 md:space-y-6">
        {children}
      </div>
    </div>
  );
};

export default function Changelog(){
  return (
    <div className="min-h-screen bg-[#E2E2D1] pt-6 md:pt-12 pb-16 md:pb-32 px-3 md:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Simple Header Navigation - Borrowed from Civitai Layout */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4 md:gap-6">
          <h1 className="text-4xl sm:text-5xl md:text-7xl uppercase tracking-tighter text-black italic font-black">
            UPDATES
          </h1>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-none sm:w-48 md:w-64">
              <input 
                type="text" 
                placeholder="Search titles..." 
                className="w-full bg-white border-2 border-black px-3 md:px-4 py-2 font-inter text-[9px] md:text-[10px] font-bold outline-none focus:bg-yellow-50"
              />
              <Search className="absolute right-2 md:right-3 top-2.5 text-gray-400" size={14} />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2 md:gap-3">
              <button className="flex-1 sm:flex-none bg-white border-2 border-black p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                <ListFilter size={14} className="md:w-4 md:h-4 mx-auto" />
              </button>
              <button className="flex-1 sm:flex-none bg-white border-2 border-black px-3 md:px-4 py-2 font-inter text-[9px] md:text-[10px] font-black uppercase flex items-center justify-center gap-1.5 md:gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all whitespace-nowrap">
                Filters <Filter size={12} className="md:w-3.5 md:h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Update Logs */}

        <UpdateEntry 
          title="Backend MVP scaffolding (API, Prisma, R2, Inference)" 
          date="Jan 2, 2026" 
          category="PLATFORM" 
          tag="FEATURE"
        >
          <p>Initial backend added to the repository — no separate service required for the MVP. It includes a Postgres schema with Prisma, Cloudflare R2 signed uploads, and a pluggable inference layer (Runware / fal.ai) with basic job submission and status polling.</p>

          <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t-2 border-black/5">
            <h4 className="text-[8px] md:text-[9px] uppercase tracking-widest text-black font-black">What’s new:</h4>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">API routes</strong>
                  <span className="text-gray-500 text-xs md:text-sm">LoRA upload sign/register, job submit, and job status polling.</span>
                </div>
              </li>
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Storage + data</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Cloudflare R2 for LoRAs and outputs, Postgres via Prisma for Users/Loras/Jobs.</span>
                </div>
              </li>
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Inference abstraction</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Switch between providers without changing the client API.</span>
                </div>
              </li>
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Docs & env</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Added `.env.example` and backend notes for quick setup.</span>
                </div>
              </li>
            </ul>
          </div>
        </UpdateEntry>
        <UpdateEntry 
          title="Changes to Generator Images in the Feed" 
          date="Dec 30, 2025" 
          category="GENERATION" 
          tag="UPDATE"
        >
          <p>We&apos;ve made an important update to how images are displayed and handled in the Generator interface.</p>
          
          <p>As image models continue to advance, output sizes have grown significantly. Loading full-resolution images directly into the feed was impacting performance. To address this, images are now <strong>downsized preview versions</strong> to keep the system fast and responsive.</p>

          <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t-2 border-black/5">
            <h4 className="text-[8px] md:text-[9px] uppercase tracking-widest text-black font-black">Here&apos;s what that means in practice:</h4>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Drag &amp; drop still works</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Dragging a preview image into a post will still use the full-resolution source.</span>
                </div>
              </li>
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Downloading images gives full quality</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Selecting images and downloading them via the dedicated button delivers original-quality outputs.</span>
                </div>
              </li>
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Right-click saving update</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Right-clicking currently saves the preview version. We are adding a dedicated on-image download button for full-resolution access.</span>
                </div>
              </li>
            </ul>
          </div>
        </UpdateEntry>

        <UpdateEntry 
          title="New Video Generation Model: FluxMotion V2" 
          date="Dec 28, 2025" 
          category="MODELS" 
          tag="NEW"
        >
          <p>We&apos;re excited to announce the launch of <strong>FluxMotion V2</strong>, our most advanced video generation model yet.</p>
          
          <p>This model brings significant improvements in temporal consistency, motion smoothness, and overall video quality. Built on our latest architecture, it understands complex motion dynamics and generates more realistic animations.</p>

          <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t-2 border-black/5">
            <h4 className="text-[8px] md:text-[9px] uppercase tracking-widest text-black font-black">Key Features:</h4>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Extended duration support</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Generate videos up to 10 seconds with consistent quality throughout.</span>
                </div>
              </li>
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">4K resolution output</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Create stunning high-resolution videos at 3840x2160 pixels.</span>
                </div>
              </li>
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Improved physics understanding</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Better handling of gravity, fluid dynamics, and realistic object interactions.</span>
                </div>
              </li>
            </ul>
          </div>
        </UpdateEntry>

        <UpdateEntry 
          title="Community Features: Collections & Collaborative Boards" 
          date="Dec 25, 2025" 
          category="COMMUNITY" 
          tag="FEATURE"
        >
          <p>Create and share curated collections of your favorite generations with the new <strong>Collections</strong> feature.</p>
          
          <p>Organize your work into themed galleries, collaborate with other creators on shared boards, and discover collections from the community. Perfect for competitions, inspiration boards, and portfolio showcases.</p>

          <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t-2 border-black/5">
            <h4 className="text-[8px] md:text-[9px] uppercase tracking-widest text-black font-black">What you can do:</h4>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Create unlimited collections</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Organize your generations by theme, style, or project.</span>
                </div>
              </li>
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Invite collaborators</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Work together with other creators on shared collections.</span>
                </div>
              </li>
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Public or private boards</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Choose who can view and contribute to your collections.</span>
                </div>
              </li>
            </ul>
          </div>
        </UpdateEntry>

        <UpdateEntry 
          title="Performance Improvements & Bug Fixes" 
          date="Dec 20, 2025" 
          category="PLATFORM" 
          tag="FIXES"
        >
          <p>This update focuses on stability, performance, and addressing community-reported issues.</p>

          <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t-2 border-black/5">
            <h4 className="text-[8px] md:text-[9px] uppercase tracking-widest text-black font-black">Fixed Issues:</h4>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Gallery loading speed</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Reduced initial load time by 40% through optimized image delivery.</span>
                </div>
              </li>
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Prompt history sync</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Fixed issue where prompt history wasn&apos;t syncing across devices.</span>
                </div>
              </li>
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Mobile interface improvements</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Better touch controls and responsive layout on mobile devices.</span>
                </div>
              </li>
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Notification system</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Resolved duplicate notifications and improved delivery reliability.</span>
                </div>
              </li>
            </ul>
          </div>
        </UpdateEntry>

        <UpdateEntry 
          title="API V3 Now Available for Developers" 
          date="Dec 15, 2025" 
          category="API" 
          tag="RELEASE"
        >
          <p>Our completely redesigned API V3 is now available for all developers. This version includes breaking changes but offers significant improvements in functionality and ease of use.</p>
          
          <p>Check out our <strong>migration guide</strong> in the developer documentation to upgrade from V2 to V3. Legacy V2 endpoints will continue to work until March 2026.</p>

          <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t-2 border-black/5">
            <h4 className="text-[8px] md:text-[9px] uppercase tracking-widest text-black font-black">What&apos;s New:</h4>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Webhook support</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Receive real-time notifications for generation completions and events.</span>
                </div>
              </li>
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Batch operations</strong>
                  <span className="text-gray-500 text-xs md:text-sm">Process multiple generations in a single API call for better efficiency.</span>
                </div>
              </li>
              <li className="flex gap-2 md:gap-3">
                <span className="text-yellow-500 font-black text-sm md:text-base shrink-0">•</span>
                <div className="min-w-0">
                  <strong className="block uppercase text-[10px] md:text-[11px] font-bold">Enhanced error handling</strong>
                  <span className="text-gray-500 text-xs md:text-sm">More detailed error messages and improved status codes.</span>
                </div>
              </li>
            </ul>
          </div>
        </UpdateEntry>

      </div>
    </div>
  );
}
