"use client";
import React, { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { Trophy, Users, Calendar, ArrowUpRight } from "lucide-react";
import * as images from "@/public/images";

interface EventCardProps {
  title: string;
  date: string;
  participants: string;
  status: string;
  type: string;
  imgSrc: StaticImageData | string;
  prizePool: string;
  detailHref: string;
  externalHref?: string | null;
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  date,
  participants,
  status,
  type,
  imgSrc,
  prizePool,
  detailHref,
  externalHref,
}) => {
  const isEnded = status.toLowerCase() === "ended";

  return (
    <div className="group relative bg-white border-2 md:border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col">
      {/* Event Header Tag */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 flex gap-1.5 md:gap-2">
        <span
          className={`px-2 py-1 md:px-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
            isEnded ? "bg-gray-200" : "bg-[#FAFF00] animate-pulse"
          }`}
        >
          {status}
        </span>
        <span className="bg-black text-white px-2 py-1 md:px-3 text-[9px] md:text-[10px] font-mono border-2 border-black">
          TYPE_{type}
        </span>
      </div>

      {/* Hero Image Section */}
      <div className="relative aspect-video overflow-hidden border-b-2 md:border-b-[3px] border-black bg-gray-100">
        <div
          className={`absolute inset-0 transition-all duration-700 ${isEnded ? "grayscale contrast-125" : "group-hover:scale-110"}`}
        >
          <Image
            src={imgSrc as any}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Prize Pool Overlay */}
        <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-black text-white p-1.5 md:p-2 border-2 border-white/20 backdrop-blur-md flex items-center gap-1.5 md:gap-2">
          <Trophy size={12} className="text-yellow-400 md:w-3.5 md:h-3.5" />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter">
            Prize: {prizePool}
          </span>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-4 md:p-6 space-y-3 md:space-y-4">
        <div className="flex justify-between items-start gap-3 md:gap-4">
          <a href={detailHref} className="flex-1">
            <h3 className="text-base md:text-xl font-black uppercase leading-tight md:leading-6 tracking-tighter group-hover:underline underline-offset-4 decoration-2 md:decoration-4">
              {title}
            </h3>
          </a>
          <a href={detailHref} aria-label="View details">
            <ArrowUpRight className="shrink-0 w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 pt-3 md:pt-4 border-t-2 border-black/5 font-mono">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-widest">
              Deadline
            </span>
            <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-[11px] font-bold">
              <Calendar size={11} className="md:w-3 md:h-3" /> {date}
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-widest">
              Participants
            </span>
            <div className="flex items-center justify-end gap-1.5 md:gap-2 text-[10px] md:text-[11px] font-bold">
              <Users size={11} className="md:w-3 md:h-3" /> {participants}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {externalHref ? (
          <a
            href={isEnded ? undefined : externalHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full block text-center py-2.5 md:py-3 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] border-2 border-black transition-all ${
              isEnded
                ? "bg-transparent text-gray-400 border-gray-200 pointer-events-none"
                : "bg-black text-white hover:bg-yellow-400 hover:text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1"
            }`}
          >
            {isEnded ? "Competition Ended" : "Enter Competition"}
          </a>
        ) : (
          <button
            className={`w-full py-2.5 md:py-3 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] border-2 border-black transition-all bg-transparent text-gray-400 border-gray-200 cursor-not-allowed`}
          >
            No Link Available
          </button>
        )}
      </div>
    </div>
  );
};

type FilterType = "all" | "active" | "upcoming" | "archived";

interface EventItem {
  id: string;
  title: string;
  date: string;
  participants: string;
  status: string;
  type: string;
  prizePool: string;
  imgSrc: StaticImageData | string;
  detailHref: string;
  externalHref?: string | null;
}

export default function EventsArchive() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [items, setItems] = useState<EventItem[]>([]);

  useEffect(() => {
    const mapType = (t: string) => t?.toUpperCase() || "CONTEST";
    // fallback images
    const articleImages = Object.entries(images)
      .filter(([key]) => key.toLowerCase().includes("article"))
      .map(([, value]) => value as StaticImageData);

    fetch(`/api/events?filter=${activeFilter}`)
      .then((r) => r.json())
      .then((list) => {
        if (!Array.isArray(list)) return;
        type ApiEvent = {
          id: string;
          title: string;
          startAt: string;
          participants?: number | null;
          status: string;
          type: string;
          prizePool?: string | null;
          coverUrl?: string | null;
          url?: string | null;
        };
        const mapped = (list as ApiEvent[]).map((e, idx) => ({
          id: e.id,
          title: e.title,
          date: new Date(e.startAt).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" }).toUpperCase(),
          participants: e.participants ? `${e.participants}` : "—",
          status: e.status,
          type: mapType(e.type),
          prizePool: e.prizePool || "—",
          imgSrc: e.coverUrl || articleImages[idx % articleImages.length],
          detailHref: `/events/${e.id}`,
          externalHref: e.url || null,
        }));
        setItems(mapped);
      })
      .catch(() => {});
  }, [activeFilter]);

  const filters: FilterType[] = ["all", "active", "upcoming", "archived"];

  return (
    <div className="min-h-screen bg-[#E2E2D1] pt-6 md:pt-12 pb-16 md:pb-32 px-3 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-6 md:gap-8">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] md:leading-[0.8] text-black italic">
              COMPETITIONS
            </h1>
          </div>

          {/* Filter Buttons */}
          <div className="w-full md:w-auto bg-white border-2 md:border-[3px] border-black p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex-1 md:flex-none px-4 md:px-6 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === f
                    ? "bg-black text-white"
                    : "hover:bg-yellow-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {items.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              date={event.date}
              participants={event.participants}
              status={event.status}
              type={event.type}
              prizePool={event.prizePool}
              imgSrc={event.imgSrc}
              detailHref={event.detailHref}
              externalHref={event.externalHref}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
