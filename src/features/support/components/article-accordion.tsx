"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Article } from "../data/support-data";

interface ArticleAccordionProps {
  articles: Article[];
}

export default function ArticleAccordion({ articles }: ArticleAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId(openId === id ? null : id);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/20 bg-transparent">
      {articles.map((article) => {
        const isOpen = openId === article.id;
        return (
          <div key={article.id} className="border-b border-white/20 last:border-0">
            <button
              onClick={() => toggle(article.id)}
              className="group flex w-full cursor-pointer items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
            >
              <span
                className={`font-medium transition-colors ${
                  isOpen ? "text-orange-400" : "text-white/70 group-hover:text-white"
                }`}
              >
                {article.title}
              </span>
              <ChevronRight
                className={`h-4 w-4 text-orange-500 flex-shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-90" : "rotate-0 opacity-70 group-hover:opacity-100"
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-6 pt-0 text-sm leading-relaxed text-white/60">
                {article.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
