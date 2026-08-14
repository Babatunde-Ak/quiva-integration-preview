"use client";
import React, { useState } from "react";
import {
  PenTool,
  Scissors,
  Brush,
  Eraser,
  Hand,
  Crop,
  Square,
  Circle,
  Triangle,
  Type,
  Image,
  Shapes,
  Pencil,
  MousePointer,
  Ruler,
  Wand2,
  Grid,
  Layers,
  Plus,
  Minus,
  Move,
} from "lucide-react";

const ComicPadEditor = () => {
  // ✅ 21 tools now
  const tools = [
    { name: "Pen", icon: PenTool },
    { name: "Scissors", icon: Scissors },
    { name: "Brush", icon: Brush },
    { name: "Eraser", icon: Eraser },
    { name: "Hand", icon: Hand },
    { name: "Crop", icon: Crop },
    { name: "Square", icon: Square },
    { name: "Circle", icon: Circle },
    { name: "Triangle", icon: Triangle },
    { name: "Text", icon: Type },
    { name: "Image", icon: Image },
    { name: "Shapes", icon: Shapes },
    { name: "Pencil", icon: Pencil },
    { name: "Pointer", icon: MousePointer },
    { name: "Ruler", icon: Ruler },
    { name: "Magic Wand", icon: Wand2 },
    { name: "Grid", icon: Grid },
    { name: "Layers", icon: Layers },
    { name: "Zoom In", icon: Plus },
    { name: "Zoom Out", icon: Minus },
    { name: "Move", icon: Move },
  ];

  const [activeTool, setActiveTool] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#111] text-white flex flex-col">
      {/* 🔝 Top Navigation Bar */}
      <header className="h-14 bg-[#1A1A1A] border-b border-gray-800 flex items-center justify-between px-6">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-500 rounded"></div>
          <span className="font-bold">Quiva</span>
        </div>

        {/* Middle: Title + Auto-save */}
        <div className="flex flex-col items-center">
          <span className="font-semibold">Untitled</span>
          <span className="text-xs text-gray-400">Auto-save: 10:35am</span>
        </div>

        {/* Right: Buttons */}
        <div className="flex gap-2">
          <button className="border border-gray-600 px-3 py-1 rounded">
            Preview
          </button>
          <button className="bg-yellow-500 text-black px-3 py-1 rounded">
            Publish
          </button>
        </div>
      </header>

      {/* 🔲 Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (21 tools in 7x3 grid) */}
        <aside className="w-72 bg-[#1A1A1A] border-r border-gray-800 p-4 grid grid-cols-3 gap-3">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <button
                key={i}
                onClick={() => setActiveTool(tool.name)}
                className={`w-16 h-16 rounded flex items-center justify-center ${
                  activeTool === tool.name
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-600 hover:bg-yellow-500"
                }`}
                title={tool.name}
              >
                <Icon size={22} />
              </button>
            );
          })}
        </aside>

        {/* Central Canvas Area */}
        <main className="flex-1 bg-[#181818] flex items-center justify-center overflow-auto">
          <div className="text-gray-400">
            {activeTool
              ? `Selected Tool: ${activeTool}`
              : "Canvas Area - Select a Tool"}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-72 bg-[#1A1A1A] border-l border-gray-800 p-4">
          <div className="flex gap-2 mb-4">
            <button className="flex-1 bg-gray-700 px-3 py-1 rounded">
              Properties
            </button>
            <button className="flex-1 bg-gray-700 px-3 py-1 rounded">
              Layout
            </button>
          </div>

          <div>
            <h3 className="text-sm text-gray-300 mb-2">Typography</h3>
            <div className="flex gap-2 mb-2">
              <button className="bg-gray-700 px-3 py-1 rounded">Inter</button>
              <button className="bg-gray-700 px-3 py-1 rounded">Medium</button>
              <button className="bg-gray-700 px-3 py-1 rounded">32</button>
            </div>
            <div className="flex gap-2">
              <button className="bg-gray-700 px-3 py-1 rounded">Paragraph</button>
              <button className="bg-gray-700 px-3 py-1 rounded">Spacing</button>
            </div>
          </div>
        </aside>
      </div>

      {/* 🔻 Bottom Toolbar */}
      <footer className="h-12 bg-[#1A1A1A] border-t border-gray-800 flex items-center justify-center gap-4 text-sm">
        <button className="bg-gray-700 px-3 py-1 rounded">Script Builder</button>
        <button className="bg-gray-700 px-3 py-1 rounded">Draw</button>
        <button className="bg-gray-700 px-3 py-1 rounded">Layout</button>
        <button className="bg-gray-700 px-3 py-1 rounded">Dialogue</button>
      </footer>
    </div>
  );
};

export default ComicPadEditor;
