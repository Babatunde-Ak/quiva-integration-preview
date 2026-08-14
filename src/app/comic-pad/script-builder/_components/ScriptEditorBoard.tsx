"use client";
import React, { useState } from "react";
import { Plus, Save, Type } from "lucide-react";

const ScriptEditorBoard = () => {
  const [scriptContent, setScriptContent] = useState("");

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Script Editor</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
            <Save size={18} />
            Save Draft
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-lg transition">
            <Plus size={18} />
            Add Scene
          </button>
        </div>
      </div>

      {/* Script Writing Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Script Input */}
        <div className="bg-black-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Type size={20} className="text-orange-500" />
            <h3 className="text-lg font-semibold">Write Your Script</h3>
          </div>
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
SARAH: This is it. Time to find the truth.

PANEL 3
..."
            className="w-full h-96 bg-white/5 border border-white/20 rounded-lg p-4 text-white placeholder:text-white/50 resize-none focus:outline-none focus:border-orange-500 transition"
          />
          <div className="mt-2 text-right text-white/50 text-sm">
            {scriptContent.length} characters
          </div>
        </div>

        {/* Script Preview/Structure */}
        <div className="bg-black-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Script Structure</h3>
          <div className="space-y-3">
            {scriptContent ? (
              <div className="bg-white/5 border border-white/20 rounded-lg p-4 h-96 overflow-y-auto">
                <div className="whitespace-pre-wrap text-white/80 text-sm leading-relaxed">
                  {scriptContent || "Start writing to see your script structure..."}
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/20 rounded-lg p-4 h-96 flex items-center justify-center">
                <div className="text-center text-white/50">
                  <Type size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Start writing your script to see the structure preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-6 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
        <h4 className="text-orange-500 font-semibold mb-2">Script Writing Tips:</h4>
        <ul className="text-white/70 text-sm space-y-1">
          <li>• Start each page with &quot;PAGE [number]&quot;</li>
          <li>• Begin each panel with &quot;PANEL [number]&quot; and describe the shot</li>
          <li>• Use character names in ALL CAPS when they first speak</li>
          <li>• Add captions and dialogue to bring your story to life</li>
        </ul>
      </div>
    </div>
  );
};

export default ScriptEditorBoard;