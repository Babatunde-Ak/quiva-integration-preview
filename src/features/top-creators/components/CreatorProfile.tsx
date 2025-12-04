"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export default function CreatorProfile() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30">
      <div className="relative w-full h-48 md:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=2000&auto=format&fit=crop"
          alt="Banner"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-10">
        <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20 relative z-10 mb-12">
          <div className="relative rounded-full p-1 bg-black">
            <div className="rounded-full p-[3px] bg-[#F8961C]/90">
              <Avatar className="w-32 h-32 md:w-44 md:h-44 border-2 border-[#F8961C]/90">
                <AvatarImage
                  src="https://cdn.marvel.com/content/1x/asm2025001_dimeo.jpg"
                  className="object-cover bg-[#1a1a1a]"
                />
                <AvatarFallback>JW</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="mt-4 md:mt-0 md:ml-6 md:mb-5 font-mono flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-3xl md:text-3xl font-bold tracking-wide text-white">
              Juanie Waletahs
            </h1>
            <p className="text-white/70 text-base md:text-lg font-normal mt-1">
              Creator
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center md:gap-16 mb-16 border-y border-white/5 md:border-none py-8 md:py-0 bg-white/5 md:bg-transparent rounded-2xl md:rounded-none">
          {/* Stat 1 */}
          <div className="flex flex-col items-center gap-1 w-full md:w-auto">
            <span className="text-4xl md:text-5xl font-mono text-white tracking-tight">
              41%
            </span>
            <span className="text-white/60 text-sm font-light tracking-widest">
              Ratings
            </span>
          </div>

          <div className="w-16 h-[1px] md:w-[1px] md:h-16 bg-[#F8961C]/90 my-6 md:my-0" />

          {/* Stat 2 */}
          <div className="flex flex-col items-center gap-1 w-full md:w-auto">
            <span className="text-4xl md:text-5xl font-mono text-white tracking-tight">
              300
            </span>
            <span className="text-white/60 text-sm font-light tracking-widest">
              Total comic sold
            </span>
          </div>

          <div className="w-16 h-[1px] md:w-[1px] md:h-16 bg-[#F8961C]/90 my-6 md:my-0" />

          {/* Stat 3 */}
          <div className="flex flex-col items-center gap-1 w-full md:w-auto">
            <span className="text-4xl md:text-5xl font-mono text-white tracking-tight">
              101
            </span>
            <span className="text-white/60 text-sm font-light tracking-widest">
              Collections
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6 pb-20">
          <button
            onClick={() => router.push("/marketplace/collections")}
            className="w-full sm:w-auto px-10 py-4 bg-[#F8961C]/90 hover:bg-[#F8961C] text-black text-sm font-bold rounded-lg transition-all active:scale-95 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
          >
            View Collection
          </button>

          <button
            onClick={() => router.push("/marketplace/top-creators")}
            className="w-full sm:w-auto px-14 py-4 bg-transparent border border-[#F8961C]/90 text-white hover:bg-orange-500/10 text-sm font-medium rounded-lg transition-all active:scale-95"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
