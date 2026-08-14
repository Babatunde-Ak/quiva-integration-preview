"use client";
import React, { useState } from "react";
import { Grid, Move, RotateCw, Square } from "lucide-react";

const LayoutBoard = () => {
  const [selectedPanel, setSelectedPanel] = useState<number | null>(null);

  const panels = [
    { id: 1, x: 10, y: 10, width: 200, height: 150 },
    { id: 2, x: 220, y: 10, width: 200, height: 150 },
    { id: 3, x: 10, y: 170, width: 410, height: 120 },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Layout Board</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
            <Grid size={18} />
            Grid
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-lg transition">
            <Square size={18} />
            Add Panel
          </button>
        </div>
      </div>

      {/* Layout Interface */}
      <div className="flex-1 grid grid-cols-12 gap-6">
        {/* Tools Panel */}
        <div className="col-span-2 bg-black-200 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-4">Panel Tools</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 bg-orange-500 text-black rounded-lg font-medium">
              <Square size={18} />
              Rectangle
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
              </svg>
              Circle
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12,2 22,20 2,20"/>
              </svg>
              Polygon
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition">
              <Move size={18} />
              Move
            </button>
          </div>

          {/* Panel Properties */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Properties</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-white/70">Width</label>
                <input
                  type="number"
                  defaultValue="200"
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-sm text-white/70">Height</label>
                <input
                  type="number"
                  defaultValue="150"
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-sm text-white/70">Border</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  defaultValue="2"
                  className="w-full mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="col-span-8 bg-white rounded-xl p-6 relative">
          <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg relative">
            {/* Page dimensions indicator */}
            <div className="absolute -top-6 left-0 text-sm text-gray-500">
              Page: 8.5&quot; × 11&quot;
            </div>

            {/* Panels */}
            {panels.map((panel) => (
              <div
                key={panel.id}
                className={`absolute border-2 cursor-pointer transition-all ${
                  selectedPanel === panel.id
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-gray-400 hover:border-gray-600"
                }`}
                style={{
                  left: panel.x,
                  top: panel.y,
                  width: panel.width,
                  height: panel.height,
                }}
                onClick={() => setSelectedPanel(panel.id)}
              >
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                  Panel {panel.id}
                </div>
                {selectedPanel === panel.id && (
                  <>
                    {/* Resize handles */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-orange-500 rounded-full cursor-nw-resize"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full cursor-ne-resize"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-500 rounded-full cursor-sw-resize"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 rounded-full cursor-se-resize"></div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Panels List */}
        <div className="col-span-2 bg-black-200 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-4">Panel List</h3>
          <div className="space-y-2">
            {panels.map((panel) => (
              <div
                key={panel.id}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  selectedPanel === panel.id
                    ? "bg-orange-500/20 border border-orange-500/40"
                    : "bg-white/5 border border-white/20 hover:bg-white/10"
                }`}
                onClick={() => setSelectedPanel(panel.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Panel {panel.id}</span>
                  <div className="flex items-center gap-1">
                    <button className="w-6 h-6 bg-white/20 rounded text-xs hover:bg-white/30">👁</button>
                    <button className="w-6 h-6 bg-white/20 rounded text-xs hover:bg-white/30">🗑</button>
                  </div>
                </div>
                <div className="text-xs text-white/60 mt-1">
                  {panel.width} × {panel.height}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutBoard;