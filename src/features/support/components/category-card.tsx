import React from "react";
import Image from "next/image";
import { Category } from "../data/support-data";

interface CategoryCardProps {
  category: Category;
  onClick: (category: Category) => void;
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <div
      onClick={() => onClick(category)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-orange-500/30 bg-gray-900/40 hover:bg-gray-900/60 transition-all hover:border-orange-500 hover:scale-[1.02] duration-200"
    >
      {/* Card image */}
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={category.image}
          alt={category.title}
          fill
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        {/* Dark overlay so text pops */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      <div className="p-5">
        <h3 className="mb-1.5 text-base font-bold text-white group-hover:text-orange-400 transition-colors leading-snug">
          {category.title}
        </h3>
        <p className="text-sm text-white/60 leading-relaxed">{category.description}</p>
      </div>
    </div>
  );
}
