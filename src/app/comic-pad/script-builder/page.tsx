"use client";
import React, { useState } from "react";
import { OrangeButton } from "@/components/button";

type BoardType = "script" | "draw" | "layout" | "dialogue";

export default function ScriptBuilderPage() {
  const [currentBoard, setCurrentBoard] = useState<BoardType>("script");
  const [showPublishingModal, setShowPublishingModal] = useState(false);
  const [scriptContent, setScriptContent] = useState("");

  const boards = [
    { id: "script" as BoardType, label: "Script Editor" },
    { id: "draw" as BoardType, label: "Draw Board" },
    { id: "layout" as BoardType, label: "Layout Board" },
    { id: "dialogue" as BoardType, label: "Dialogue Board" },
  ];

  return (
    <div className="min-h-screen bg-black text-white" style={{ background: 'linear-gradient(135deg, #000000 0%, #000000 80%, #1a0f1a 100%)' }}>
      {/* Top Navigation Bar */}
      <div className="bg-black border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-white-300 hover:text-white transition-colors"
            >
              ← Back to Comic Pad
            </button>
            <div className="text-xl font-bold text-orange-500">Script Builder</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-gray-400 text-sm">Page 1 of 1</div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              Preview
            </button>
            <button 
              onClick={() => setShowPublishingModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-secondary-300 text-black font-semibold rounded-lg transition-none"
            >
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Unified Board Container */}
        <div className="bg-black border border-gray-700 rounded-2xl p-6 min-h-[600px]">
          {/* Script Editor Board */}
          {currentBoard === "script" && (
            <div className="h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">📝 Script Editor</h2>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white">
                     Save 
                  </button>
                  <button className="px-4 py-2 bg-secondary-300 text-black font-semibold rounded-lg transition-none">
                    ➕ Add Scene
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
               
                  </h3>
                  <textarea
                    value={scriptContent}
                    onChange={(e) => setScriptContent(e.target.value)}
                    placeholder="Start writing your comic script here...

Example:
PAGE 1

PANEL 1
WIDE SHOT of a bustling city street at sunset.
CAPTION: Another day in Metro City comes to an end.

PANEL 2
CLOSE UP on SARAH (20s, determined expression) looking up at a tall building.
SARAH: This is it. Time to find the truth."
                    className="w-full h-96 bg-gray-900 border border-gray-700 rounded-lg p-4 text-orange-100 placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono tracking-wide leading-relaxed"
                  />
                  <div className="mt-2 text-right text-gray-400 text-sm">
                    {scriptContent.length} characters
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-white">📖 Script Structure</h3>
                  <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 h-96 overflow-y-auto">
                    {scriptContent ? (
                      <div className="whitespace-pre-wrap text-white text-sm leading-relaxed">
                        {scriptContent}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-white text-center">
                        <div>
                          <div className="text-4xl mb-4">📝</div>
                          <p>Start writing to see your script structure...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Draw Board */}
          {currentBoard === "draw" && (
            <div className="h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">🎨 Draw Board</h2>
                <div className="flex items-center gap-3">
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white">↶</button>
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white">↷</button>
                  <button className="px-4 py-2 bg-secondary-300 text-black font-semibold rounded-lg transition-none">
                    📚 Add Layer
                  </button>
                </div>
              </div>
              
              <div className="text-center text-white py-20">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-2xl font-bold mb-4">Drawing Tools Coming Soon</h3>
                <p className="text-white">Interactive drawing canvas and advanced tools will be available here</p>
              </div>
            </div>
          )}

          {/* Layout Board */}
          {currentBoard === "layout" && (
            <div className="h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">📐 Layout Board</h2>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white">
                    🔲 Grid
                  </button>
                  <button className="px-4 py-2 bg-secondary-300 text-black font-semibold rounded-lg transition-none">
                    ➕ Add Panel
                  </button>
                </div>
              </div>
              
              <div className="text-center text-white py-20">
                <div className="text-6xl mb-4">📐</div>
                <h3 className="text-2xl font-bold mb-4">Panel Layout Tools</h3>
                <p className="text-white">Drag and drop panel creation and layout management coming soon</p>
              </div>
            </div>
          )}

          {/* Dialogue Board */}
          {currentBoard === "dialogue" && (
            <div className="h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">💬 Dialogue Board</h2>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white">
                    🎨 Text Style
                  </button>
                  <button className="px-4 py-2 bg-secondary-300 text-black font-semibold rounded-lg transition-none">
                    ➕ Add Dialogue
                  </button>
                </div>
              </div>
              
              <div className="text-center text-white py-20">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-2xl font-bold mb-4">Dialogue Management</h3>
                <p className="text-white">Speech bubbles, captions, and sound effects editor coming soon</p>
              </div>
            </div>
          )}

          {/* Board Navigation Tabs - Inside the Board Container at Bottom */}
          <div className="flex justify-center mt-8 pt-6 border-t border-gray-700">
            <div className="flex items-center gap-0.5 bg-gray-900 rounded-full p-0.5 border border-gray-600">
              {boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => setCurrentBoard(board.id)}
                  className={`px-4 py-2 rounded-full transition-all font-medium text-xs ${
                    currentBoard === board.id
                      ? "bg-secondary-300 text-black shadow-md"
                      : "text-white hover:text-white hover:bg-gray-700"
                  }`}
                >
                  {board.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Publishing Modal */}
      {showPublishingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowPublishingModal(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors text-white"
            >
              ✕
            </button>

            <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 pt-6 pb-10 text-white text-center">
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className={`w-3 h-3 rounded-full transition-colors ${step === 1 ? "bg-secondary-300" : "bg-gray-600"}`}></div>
                ))}
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-white">Give your masterpiece one more look</h3>

              <div className="flex justify-center mb-8">
                <div className="w-96 h-64 bg-gradient-to-br from-orange-500 to-purple-500 opacity-20 rounded-2xl flex items-center justify-center border border-gray-700">
                  <p className="text-gray-300">📚 Banner Image Placeholder</p>
                </div>
              </div>

              <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                Before we publish your amazing comic to the marketplace, take a moment to review your work. 
                Make sure everything looks perfect - your story, artwork, dialogue, and layout are all exactly 
                how you want them. Once published, your comic will be available for readers to discover and enjoy!
              </p>

              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <OrangeButton className="w-full py-4 px-8 text-lg">
                  Next
                </OrangeButton>
                <button 
                  onClick={() => setShowPublishingModal(false)}
                  className="w-full bg-transparent hover:bg-gray-700 text-gray-300 hover:text-white font-medium py-4 px-8 rounded-2xl border border-gray-600 transition-colors"
                >
                  Back to Editor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}