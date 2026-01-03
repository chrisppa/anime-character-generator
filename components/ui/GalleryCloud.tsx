"use client";
import Image, { type StaticImageData } from "next/image";
import * as allImages from "@/public/images";
import { useState } from "react";

export const GalleryCloud = () => {
  const testImages = Object.entries(allImages)
    .filter(([key]) => key.startsWith("test_"))
    .map(([key, src]) => ({ key, src: src as StaticImageData }));

  const [shuffledImages, setShuffledImages] = useState(testImages);
  const [isShuffling, setIsShuffling] = useState(false);

  // Shuffle function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Manual shuffle handler
  const handleShuffle = () => {
    if (isShuffling) return;

    setIsShuffling(true);

    setTimeout(() => {
      setShuffledImages((prev) => shuffleArray(prev));
      setTimeout(() => setIsShuffling(false), 50);
    }, 300);
  };

  // Responsive column distribution
  const getColumns = (count: number) => {
    const columns: { key: string; src: StaticImageData }[][] = Array.from(
      { length: count },
      () => [],
    );
    shuffledImages.forEach((img, idx) => {
      columns[idx % count].push(img);
    });
    return columns;
  };

  const columns4 = getColumns(4); // Desktop
  const columns3 = getColumns(3); // Tablet
  const columns2 = getColumns(2); // Mobile

  const renderColumns = (
    columns: { key: string; src: StaticImageData }[][],
  ) => {
    return columns.map((col, colIdx) => {
      const isEven = colIdx % 2 === 0;

      return (
        <div
          key={`col-${colIdx}`}
          className="flex-1 min-w-0 flex flex-col gap-4 md:gap-6"
        >
          <div
            className={`flex flex-col gap-4 md:gap-6 ${isEven ? "animate-scroll-up" : "animate-scroll-down"} transition-all duration-300 ${isShuffling ? "opacity-0 scale-95 blur-sm" : "opacity-100 scale-100 blur-0"}`}
          >
            {col.map((img, i) => (
              <div
                key={`${img.key}-${i}`}
                className="relative group border-2 border-black bg-white p-1.5 md:p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-2 hover:-translate-x-1"
              >
                <Image
                  src={img.src}
                  alt={img.key.replace(/_/g, " ")}
                  height={400}
                  width={300}
                  className="grayscale hover:grayscale-0 transition-all duration-500 object-cover aspect-3/4 w-full"
                />

                {/* Metadata Overlay on Hover */}
                <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black text-[9px] md:text-[10px] text-white px-2 py-1 font-mono uppercase tracking-widest">
                    ID: {img.key.split("_")[1] || "000"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <section className="relative bg-[#E2E2D1] py-12 md:py-16 lg:p-20 overflow-hidden">
      {/* Header for the Gallery */}
      <div className="z-20 text-center mb-8">
        <h3 className="text-2xl md:text-3xl lg:text-7xl font-black uppercase tracking-tighter text-black leading-none px-3 py-4 md:px-4 md:py-8 font-druk-text">
          ShowCase
        </h3>

        {/* Shuffle Button */}
        <button
          onClick={handleShuffle}
          disabled={isShuffling}
          className="mt-4 px-6 py-3 bg-black text-white font-bold uppercase tracking-wider text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
        >
          {isShuffling ? "Shuffling..." : "Shuffle Gallery"}
        </button>
      </div>

      {/* Mobile: 2 columns */}
      <div className="relative sm:hidden flex gap-3 px-3 h-full">
        <div className="absolute inset-0 z-10 pointer-events-none" />
        {renderColumns(columns2)}
      </div>

      {/* Tablet: 3 columns */}
      <div className="relative hidden sm:flex lg:hidden gap-4 px-4 h-full">
        <div className="absolute inset-0 z-10 pointer-events-none" />
        {renderColumns(columns3)}
      </div>

      {/* Desktop: 6 columns */}
      <div className="relative hidden lg:flex gap-6 px-4 h-full">
        <div className="absolute inset-0 z-10 pointer-events-none" />
        {renderColumns(columns4)}
      </div>
    </section>
  );
};