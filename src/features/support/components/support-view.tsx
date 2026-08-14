"use client";

import React, { useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { categories, articles, Category } from "../data/support-data";
import SupportHero from "./support-hero";
import CategoryCard from "./category-card";
import ArticleAccordion from "./article-accordion";
import ChatWidget from "./chat-widget";

export default function SupportView() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return categories;
    const q = query.toLowerCase();
    return categories.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [query]);

  const handleCategoryClick = (category: Category) => {
    setActiveCategory(category);
  };

  const handleBack = () => {
    setActiveCategory(null);
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono relative selection:bg-orange-500 selection:text-white">
      <SupportHero query={query} onQueryChange={setQuery} />

      <main className="mx-auto max-w-5xl px-6 py-12 pb-32">
        {!activeCategory ? (
          /* Category grid */
          <>
            {filtered.length === 0 ? (
              <p className="text-center text-white/40 py-16 text-sm">
                No results found for &ldquo;{query}&rdquo;
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((cat) => (
                  <CategoryCard key={cat.id} category={cat} onClick={handleCategoryClick} />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Detail view */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Breadcrumb */}
            <div className="mb-8 flex items-center gap-2 text-sm text-white/50">
              <button onClick={handleBack} className="hover:text-white transition-colors">
                All Support
              </button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/70">{activeCategory.title}</span>
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white/80 mb-2">
                {activeCategory.title}
              </h2>
              <p className="text-white/50">{activeCategory.description}</p>
            </div>

            <ArticleAccordion articles={articles} />
          </div>
        )}
      </main>

      <ChatWidget />
    </div>
  );
}
