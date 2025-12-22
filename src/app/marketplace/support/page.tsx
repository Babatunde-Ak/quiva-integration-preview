"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronRight,
  MessageSquare,
  X,
  Send,
  ChevronDown,
  Paperclip,
  Smile,
  ImageIcon,
  Type,
  ChevronLeft,
  Bot,
} from "lucide-react";

// --- Types ---
type ViewState = "HOME" | "CATEGORY_DETAIL";

interface Category {
  id: string;
  title: string;
  description: string;
  imageColor: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
}

// --- Mock Data ---
const categories: Category[] = [
  {
    id: "getting-started",
    title: "Getting Started with Quiva",
    description: "If this is your first time visiting Quiva, get started here.",
    imageColor: "from-orange-600 to-yellow-500",
  },
  {
    id: "creator",
    title: "Be a Creator with Quiva",
    description: "Learn how to put your art out there for users to read",
    imageColor: "from-red-600 to-orange-500",
  },
  {
    id: "account",
    title: "Account Management",
    description: "Learn how to create an account and set up your wallet",
    imageColor: "from-amber-600 to-yellow-400",
  },
  {
    id: "buying",
    title: "Buying comic on Quiva",
    description: "Learn how to purchase your first comic on Quiva",
    imageColor: "from-green-600 to-emerald-500",
  },
  {
    id: "selling",
    title: "Selling comic on Quiva",
    description: "Learn how to list your comic for sale on Quiva marketplace",
    imageColor: "from-emerald-600 to-green-400",
  },
  {
    id: "faq",
    title: "FAQ on Quiva",
    description: "Learn answers to frequently asked questions on Quiva",
    imageColor: "from-orange-500 to-amber-500",
  },
];

const articles: Article[] = [
  {
    id: "1",
    title: "Welcome to Quiva",
    content:
      "Welcome! Quiva is a decentralized marketplace for digital comics. Here you can buy, sell, and trade unique comic issues secured by blockchain technology. We aim to empower creators and give true ownership to readers.",
  },
  {
    id: "2",
    title: "Create your account with a wallet address",
    content:
      'To create an account, simply click the "Connect Wallet" button in the top right corner. We support MetaMask, Phantom, and WalletConnect. Once connected, your account is automatically created—no email required.',
  },
  {
    id: "3",
    title: "Get to know your wallet",
    content:
      "Your wallet is your identity on Quiva. It holds your funds (ETH/SOL) and stores your comic collection. Always keep your seed phrase safe and never share it with anyone, not even Quiva support.",
  },
  {
    id: "4",
    title: "Purchase your first Comic",
    content:
      'Navigate to the Marketplace tab. You can filter by genre, popularity, or new releases. Click on a comic cover, review the price, and click "Buy Now." Approve the transaction in your wallet to complete the purchase.',
  },
  {
    id: "5",
    title: "Review your Marketplace page",
    content:
      'Your Marketplace page shows all your listed items. You can edit prices, delist items, or view offer history from your Profile dashboard under the "My Listings" tab.',
  },
];

export default function SupportPage() {
  const [view, setView] = useState<ViewState>("HOME");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // State for the accordion dropdowns
  const [openArticleId, setOpenArticleId] = useState<string | null>(null);

  const handleCategoryClick = (category: Category) => {
    setActiveCategory(category);
    setView("CATEGORY_DETAIL");
    setOpenArticleId(null); // Reset dropdowns when entering a new category
  };

  const handleBack = () => {
    setView("HOME");
    setActiveCategory(null);
  };

  const toggleArticle = (id: string) => {
    setOpenArticleId(openArticleId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono relative selection:bg-orange-500 selection:text-white">
      {/* --- Hero Section --- */}
      <div className="relative h-64 w-full overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-color-dodge"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black"></div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 pt-20">
          <h1 className="text-3xl font-bold text-white mb-6">
            Quiva Help Center
          </h1>
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for support..."
              className="w-full rounded-xl bg-white/10 backdrop-blur-md border border-white/70 py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none placeholder:text-white focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <main className="mx-auto max-w-5xl px-6 py-12 pb-32">
        {view === "HOME" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-orange-500/30 bg-gray-900/40 hover:bg-gray-900/60 transition-all hover:border-orange-500"
              >
                <div
                  className={`h-40 w-full bg-gradient-to-br ${cat.imageColor} opacity-80 relative flex items-center justify-center`}
                >
                  <div className="h-32 w-32 rounded-full bg-black/20 blur-xl absolute"></div>
                  <span className="relative z-10 text-6xl font-black text-white/20 mix-blend-overlay">
                    HERO
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="mb-2 text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-white leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Detail View with Accordions */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Breadcrumbs */}
            <div className="mb-8 flex items-center gap-2 text-sm text-white/50">
              <button
                onClick={handleBack}
                className="hover:text-white transition-colors"
              >
                All Support
              </button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/70">{activeCategory?.title}</span>
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white/70 mb-2">
                {activeCategory?.title}
              </h2>
              <p className="text-white/70">{activeCategory?.description}</p>
            </div>

            {/* Accordion List */}
            <div className="overflow-hidden rounded-2xl border border-white/70 bg-transparent">
              {articles.map((article) => {
                const isOpen = openArticleId === article.id;

                return (
                  <div
                    key={article.id}
                    className="border-b border-white/70 last:border-0"
                  >
                    <button
                      onClick={() => toggleArticle(article.id)}
                      className="group flex w-full cursor-pointer items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                    >
                      <span
                        className={`font-medium transition-colors ${
                          isOpen
                            ? "text-orange-500"
                            : "text-white/70 group-hover:text-white"
                        }`}
                      >
                        {article.title}
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 text-orange-500 transition-transform duration-300 ${
                          isOpen
                            ? "rotate-90"
                            : "rotate-0 opacity-70 group-hover:opacity-100"
                        }`}
                      />
                    </button>

                    {/* Expanded Content */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="p-6 pt-0 text-sm leading-relaxed text-white/70">
                        {article.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* --- Floating Chat Widget --- */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
        {isChatOpen && (
          <div className="w-[380px] h-[600px] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-orange-900/40 animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between bg-[#9a5b28] p-4 text-white">
              <div className="flex items-center gap-4">
                <button className="opacity-80 hover:opacity-100">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center">
                    <Bot className="h-7 w-7 text-orange-200" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-sm">Zee</span>
                    <span className="text-[10px] text-white/80">
                      The team can also help
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="opacity-80 hover:opacity-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 bg-gradient-to-b from-[#4a2c15] to-black p-6 relative flex flex-col">
              {/* Bot Message */}
              <div className="mb-auto mt-8">
                <div className="relative rounded-2xl border border-white/80 p-4 text-sm font-medium text-white shadow-sm inline-block max-w-[85%]">
                  Hi there! I'm Zee, Quiva's AI support bot. How can I help?
                </div>
                <div className="mt-2 ml-1 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white/60">
                    Zee . AI Agent
                  </span>
                  <span className="text-[10px] text-white/40">Just now</span>
                </div>
              </div>

              {/* Input Area */}
              <div className="mt-4 flex flex-col gap-3">
                {/* Input Box Container */}
                <div className="rounded-3xl border border-white/20 bg-black/40 p-2 text-white/70 focus-within:border-orange-500/50 transition-colors">
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-white/70 focus:outline-none"
                  />

                  {/* Toolbar Row */}
                  <div className="flex items-center justify-between px-2 pb-1 pt-2">
                    {/* Left Icons */}
                    <div className="flex items-center gap-3 text-gray-400">
                      <button className="hover:text-white/70 text-white transition-colors">
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <button className="hover:text-white/70 text-white transition-colors">
                        <Smile className="h-4 w-4" />
                      </button>
                      <button className="hover:text-white/70 text-white transition-colors">
                        <ImageIcon className="h-4 w-4" />
                      </button>
                      <button className="hover:text-white/70 text-white transition-colors">
                        <Type className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Send Button */}
                    <button className="flex items-center gap-1 rounded-lg bg-[#d97736] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#b05f2a] transition-colors">
                      Send <Send className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Disclaimer Box */}
                <div className="relative rounded-2xl border border-white/30 bg-transparent px-4 py-3 pr-8">
                  <p className="text-[10px] leading-tight text-white/80">
                    By chatting with us, you acknowledge your consent to the
                    collections, use and disclosure of your information as a set
                    forth in our{" "}
                    <span className="underline cursor-pointer hover:text-white">
                      Privacy Policy
                    </span>
                    .
                  </p>
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d97736] shadow-lg shadow-orange-900/30 hover:bg-[#b05f2a] hover:scale-105 transition-all duration-300 active:scale-95"
        >
          {isChatOpen ? (
            <ChevronDown className="h-8 w-8 text-white" />
          ) : (
            <MessageSquare className="h-6 w-6 text-white fill-current" />
          )}
        </button>
      </div>
    </div>
  );
}
