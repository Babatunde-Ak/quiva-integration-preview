"use client";
import React from "react";
import { Brush, Palette, Layers, Undo, Redo } from "lucide-react";

const DrawBoard = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Draw Board</h2>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
            <Undo size={18} />
          </button>
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
            <Redo size={18} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-lg transition">
            <Layers size={18} />
            Add Layer
          </button>
        </div>
      </div>

      {/* Drawing Interface */}
      <div className="flex-1 grid grid-cols-12 gap-6">
        {/* Tool Palette */}
        <div className="col-span-2 bg-black-200 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-4">Tools</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 bg-orange-500 text-black rounded-lg font-medium">
              <Brush size={18} />
              Brush
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z"/>
              </svg>
              Pencil
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              </svg>
              Eraser
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z"/>
              </svg>
              Shape
            </button>
          </div>

          {/* Color Palette */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Colors</h4>
            <div className="grid grid-cols-4 gap-2">
              {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'].map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-lg border-2 border-white/20 hover:border-white/40 transition"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Brush Settings */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Brush Size</h4>
            <input
              type="range"
              min="1"
              max="50"
              defaultValue="5"
              className="w-full"
            />
          </div>
        </div>

        {/* Canvas Area */}
        <div className="col-span-8 bg-white rounded-xl relative">
          <div className="absolute inset-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Brush size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Start Drawing</p>
              <p className="text-sm">Click and drag to begin creating your comic art</p>
            </div>
          </div>
        </div>

        {/* Layers Panel */}
        <div className="col-span-2 bg-black-200 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-4">Layers</h3>
          <div className="space-y-2">
            <div className="p-3 bg-orange-500/20 border border-orange-500/40 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Layer 1</span>
                <div className="flex items-center gap-1">
                  <button className="w-6 h-6 bg-white/20 rounded text-xs">👁</button>
                  <button className="w-6 h-6 bg-white/20 rounded text-xs">🔒</button>
                </div>
              </div>
            </div>
            <div className="p-3 bg-white/5 border border-white/20 rounded-lg opacity-50">
              <div className="flex items-center justify-between">
                <span className="text-sm">Background</span>
                <div className="flex items-center gap-1">
                  <button className="w-6 h-6 bg-white/20 rounded text-xs">👁</button>
                  <button className="w-6 h-6 bg-white/20 rounded text-xs">🔒</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawBoard;