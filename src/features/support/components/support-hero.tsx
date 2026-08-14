import React from "react";
import Image from "next/image";
import { Search } from "lucide-react";

interface SupportHeroProps {
  query: string;
  onQueryChange: (value: string) => void;
}

export default function SupportHero({ query, onQueryChange }: SupportHeroProps) {
  return (
    <div className="relative h-72 w-full overflow-hidden">
      {/* Background image */}
      <Image
        src="/dev_images/hero-bg-img.png"
        alt="Support hero background"
        fill
        className="object-cover object-center opacity-30"
        priority
      />
      {/* Comic strip overlay images */}
      <div className="absolute inset-0 flex pointer-events-none">
        <div className="relative w-32 h-full ml-auto mr-6 opacity-20 hidden lg:block">
          <Image src="/dev_images/demon-slayer.png" alt="" fill className="object-cover object-top" />
        </div>
        <div className="relative w-28 h-full mr-4 opacity-20 hidden lg:block">
          <Image src="/dev_images/kakashi.png" alt="" fill className="object-cover object-top" />
        </div>
        <div className="relative w-28 h-full mr-4 opacity-20 hidden lg:block">
          <Image src="/dev_images/solo-level.png" alt="" fill className="object-cover object-top" />
        </div>
      </div>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-16 flex flex-col gap-6">
        <div>
          <p className="text-orange-400 text-xs font-semibold tracking-widest uppercase mb-1">
            Help Center
          </p>
          <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
            How can we help you?
          </h1>
        </div>
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search for support..."
            className="w-full rounded-xl bg-white/10 backdrop-blur-md border border-white/40 py-3 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
