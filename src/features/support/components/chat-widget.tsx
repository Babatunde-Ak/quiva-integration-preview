"use client";

import React, { useState } from "react";
import {
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

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      {isOpen && (
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
                  <span className="text-[10px] text-white/80">The team can also help</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="opacity-80 hover:opacity-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 bg-gradient-to-b from-[#4a2c15] to-black p-6 relative flex flex-col">
            <div className="mb-auto mt-8">
              <div className="relative rounded-2xl border border-white/80 p-4 text-sm font-medium text-white shadow-sm inline-block max-w-[85%]">
                Hi there! I&apos;m Zee, Quiva&apos;s AI support bot. How can I help?
              </div>
              <div className="mt-2 ml-1 flex items-center gap-2">
                <span className="text-[10px] font-bold text-white/60">Zee . AI Agent</span>
                <span className="text-[10px] text-white/40">Just now</span>
              </div>
            </div>

            {/* Input Area */}
            <div className="mt-4 flex flex-col gap-3">
              <div className="rounded-3xl border border-white/20 bg-black/40 p-2 text-white/70 focus-within:border-orange-500/50 transition-colors">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-white/70 focus:outline-none"
                />
                <div className="flex items-center justify-between px-2 pb-1 pt-2">
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
                  <button className="flex items-center gap-1 rounded-lg bg-[#d97736] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#b05f2a] transition-colors">
                    Send <Send className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl border border-white/30 bg-transparent px-4 py-3 pr-8">
                <p className="text-[10px] leading-tight text-white/80">
                  By chatting with us, you acknowledge your consent to the collections, use and
                  disclosure of your information as set forth in our{" "}
                  <span className="underline cursor-pointer hover:text-white">Privacy Policy</span>.
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
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d97736] shadow-lg shadow-orange-900/30 hover:bg-[#b05f2a] hover:scale-105 transition-all duration-300 active:scale-95"
      >
        {isOpen ? (
          <ChevronDown className="h-8 w-8 text-white" />
        ) : (
          <MessageSquare className="h-6 w-6 text-white fill-current" />
        )}
      </button>
    </div>
  );
}
