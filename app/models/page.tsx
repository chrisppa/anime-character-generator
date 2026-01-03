"use client";
import React, { useState, useMemo, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import { Download, Star, Heart, MoreVertical, Zap, Search } from "lucide-react";
import * as models from "@/public/images";

interface ModelStats {
  downloads: string;
  rating: string;
}

interface ModelCardProps {
  imgSrc: StaticImageData | string;
  name: string;
  type: string;
  stats: ModelStats;
}

const ModelCard = ({ imgSrc, name, type, stats }: ModelCardProps) => {
  return (
    <div className="group relative bg-white border-2 md:border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all overflow-hidden flex flex-col">
      {/* --- Image Preview Section --- */}
      <div className="relative aspect-3/4 overflow-hidden border-b-2 md:border-b-[3px] border-black">
        <Image
          src={imgSrc as any}
          alt={name}
          fill
          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1.5 md:gap-2">
          <span className="bg-yellow-400 border-2 border-black px-1.5 py-0.5 md:px-2 text-[9px] md:text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {type}
          </span>
          <span className="bg-black text-white px-1.5 py-0.5 md:px-2 text-[8px] md:text-[9px] font-mono border-2 border-black">
            XL 1.0
          </span>
        </div>

        {/* Hover Action Overlay - hidden on mobile, shown on desktop hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-4">
          <button className="bg-white p-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
            <Download size={20} className="text-black" />
          </button>
          <button className="bg-white p-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
            <Heart size={20} className="text-pink-500 fill-current" />
          </button>
        </div>

        {/* Bottom Floating Stats */}
        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-linear-to-t from-black/80 to-transparent flex justify-between items-end">
          <div className="flex gap-2 md:gap-3 text-white">
            <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold">
              <Download size={10} /> {stats.downloads}
            </span>
            <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold">
              <Star size={10} className="text-yellow-400 fill-current" />{" "}
              {stats.rating}
            </span>
          </div>
          <MoreVertical size={16} className="text-white cursor-pointer" />
        </div>
      </div>

      {/* --- Data Section --- */}
      <div className="p-3 md:p-4 bg-white space-y-2 md:space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-xs md:text-sm font-black uppercase tracking-tight leading-none group-hover:text-yellow-600 transition-colors truncate">
              {name.replace(/_/g, " ")}
            </h3>
            <p className="text-[9px] md:text-[10px] font-mono text-gray-500 mt-1">
              BY: <span className="text-black font-bold">ANIMIND_CORE</span>
            </p>
          </div>
          <Zap
            size={12}
            className="text-yellow-500 fill-current shrink-0 ml-2"
          />
        </div>

        {/* Trigger Tags */}
        <div className="flex flex-wrap gap-1">
          {["lora", "anime", "high-res"].map((tag) => (
            <span
              key={tag}
              className="text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 border border-black/10 bg-gray-50 uppercase italic"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex md:hidden gap-2 pt-2 border-t border-gray-100">
          <button className="flex-1 flex items-center justify-center gap-1 bg-black text-white py-2 text-[10px] font-bold uppercase active:bg-gray-800">
            <Download size={12} /> Download
          </button>
          <button className="flex items-center justify-center px-3 border-2 border-black active:bg-gray-100">
            <Heart size={14} className="text-pink-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

type FilterType = "ALL" | "CHECKPOINT" | "LORA" | "TEXTUAL-INV" | "V3_SPECIAL";

interface ModelItem {
  id: string;
  src: StaticImageData | string;
  name: string;
  type: string;
}

export default function ModelLibrary() {
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  // Convert the imported object into an array we can loop through
  const [dynamicLoras, setDynamicLoras] = useState<ModelItem[]>([]);

  useEffect(() => {
    fetch("/api/lora/list")
      .then((r) => r.json())
      .then((list) => {
        if (!Array.isArray(list)) return;
        const items: ModelItem[] = list.map((l: any) => ({
          id: l.id,
          src: l.coverUrl || (models.not_found as StaticImageData),
          name: l.name,
          type: "LORA",
        }));
        setDynamicLoras(items);
      })
      .catch(() => {});
  }, []);

  const modelList: ModelItem[] = useMemo(() => {
    const statics = Object.entries(models).map(([key, src]) => ({
      id: key,
      src: src as StaticImageData,
      name: key,
      type: key.includes("lora") ? "LORA" : "CHECKPOINT",
    }));
    return [...dynamicLoras, ...statics];
  }, [dynamicLoras]);

  // Generate stats once using useMemo
  const modelsWithStats = useMemo(() => {
    const hashString = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    };

    return modelList.map((model) => {
      const hash = hashString(model.id);
      return {
        ...model,
        stats: {
          downloads: ((hash % 100) / 10).toFixed(1) + "k",
          rating: (4 + (hash % 10) / 10).toFixed(1),
        },
      };
    });
  }, [modelList]);

  const categories: FilterType[] = [
    "ALL",
    "CHECKPOINT",
    "LORA",
    "TEXTUAL-INV",
    "V3_SPECIAL",
  ];

  return (
    <div className="min-h-screen bg-[#E2E2D1] pt-6 md:pt-10 pb-12 md:pb-20 px-3 md:px-6">
      {/* --- Sticky Top Navigation --- */}
      <nav className="max-w-7xl mx-auto sticky top-2 md:top-4 z-50 mb-8 md:mb-12">
        <div className="bg-white border-2 md:border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-2 md:p-2 flex flex-col gap-3">
          {/* Header Row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-4 pl-1 md:pl-2">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-red-600 animate-pulse" />
              <span className="font-mono text-[10px] md:text-xs font-black uppercase tracking-widest">
                top models all in one place
              </span>
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded"
            >
              <Search size={16} />
            </button>

            {/* Desktop Search */}
            <div className="hidden md:block pr-2">
              <input
                type="text"
                placeholder="SEARCH_MODELS..."
                className="bg-gray-100 border-2 border-black px-4 py-1 text-[10px] font-bold focus:bg-yellow-50 outline-none w-48 uppercase"
              />
            </div>
          </div>

          {/* Mobile Search Input */}
          {searchOpen && (
            <div className="md:hidden">
              <input
                type="text"
                placeholder="SEARCH_MODELS..."
                className="w-full bg-gray-100 border-2 border-black px-3 py-2 text-[10px] font-bold focus:bg-yellow-50 outline-none uppercase"
              />
            </div>
          )}

          {/* Category Filters - Horizontal Scroll on Mobile */}
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 md:px-4 py-1.5 md:py-2 font-black text-[9px] md:text-[10px] uppercase tracking-tighter transition-all border-2 whitespace-nowrap shrink-0 ${
                  filter === cat
                    ? "bg-black text-white border-black"
                    : "border-transparent hover:bg-yellow-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* --- Grid System --- */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
        {modelsWithStats.map((model) => (
          <ModelCard
            key={model.id}
            imgSrc={model.src}
            name={model.name}
            type={model.type}
            stats={model.stats}
          />
        ))}
      </div>

      {/* Add scrollbar hide utility */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
