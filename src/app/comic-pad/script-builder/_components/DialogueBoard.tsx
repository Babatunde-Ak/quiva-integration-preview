"use client";
import React, { useState } from "react";
import { MessageSquare, Type, Volume2, Plus } from "lucide-react";

interface DialogueItem {
  id: number;
  type: "speech" | "thought" | "caption" | "sound";
  text: string;
  character?: string;
  panel: number;
}

const DialogueBoard = () => {
  const [dialogues, setDialogues] = useState<DialogueItem[]>([
    { id: 1, type: "speech", text: "This is it. Time to find the truth.", character: "Sarah", panel: 1 },
    { id: 2, type: "caption", text: "Another day in Metro City comes to an end.", panel: 1 },
    { id: 3, type: "sound", text: "CRASH!", panel: 2 },
  ]);
  
  const [selectedDialogue, setSelectedDialogue] = useState<number | null>(null);
  const [newDialogue, setNewDialogue] = useState({ type: "speech" as const, text: "", character: "", panel: 1 });

  const addDialogue = () => {
    if (newDialogue.text.trim()) {
      const newId = Math.max(...dialogues.map(d => d.id)) + 1;
      setDialogues([...dialogues, { 
        id: newId, 
        type: newDialogue.type,
        text: newDialogue.text,
        character: newDialogue.character || undefined,
        panel: newDialogue.panel 
      }]);
      setNewDialogue({ type: "speech", text: "", character: "", panel: 1 });
    }
  };

  const deleteDialogue = (id: number) => {
    setDialogues(dialogues.filter(d => d.id !== id));
    if (selectedDialogue === id) {
      setSelectedDialogue(null);
    }
  };

  const getDialogueIcon = (type: string) => {
    switch (type) {
      case "speech": return <MessageSquare size={18} />;
      case "thought": return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>;
      case "caption": return <Type size={18} />;
      case "sound": return <Volume2 size={18} />;
      default: return <MessageSquare size={18} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Dialogue Board</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
            <Type size={18} />
            Text Style
          </button>
          <button 
            onClick={addDialogue}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-lg transition"
          >
            <Plus size={18} />
            Add Dialogue
          </button>
        </div>
      </div>

      {/* Dialogue Interface */}
      <div className="flex-1 grid grid-cols-12 gap-6">
        {/* Dialogue Types */}
        <div className="col-span-3 bg-black-200 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-4">Add New Dialogue</h3>
          
          {/* Dialogue Type Selector */}
          <div className="space-y-3 mb-4">
            {[
              { type: "speech", label: "Speech Bubble", icon: <MessageSquare size={18} /> },
              { type: "thought", label: "Thought Bubble", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg> },
              { type: "caption", label: "Caption Box", icon: <Type size={18} /> },
              { type: "sound", label: "Sound Effect", icon: <Volume2 size={18} /> },
            ].map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => setNewDialogue({ ...newDialogue, type: type as any })}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                  newDialogue.type === type
                    ? "bg-orange-500 text-black font-medium"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Input Fields */}
          <div className="space-y-3">
            {(newDialogue.type === "speech" || newDialogue.type === "thought") && (
              <div>
                <label className="text-sm text-white/70">Character</label>
                <input
                  type="text"
                  value={newDialogue.character}
                  onChange={(e) => setNewDialogue({ ...newDialogue, character: e.target.value })}
                  placeholder="Character name"
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
            )}
            
            <div>
              <label className="text-sm text-white/70">Panel</label>
              <select
                value={newDialogue.panel}
                onChange={(e) => setNewDialogue({ ...newDialogue, panel: parseInt(e.target.value) })}
                className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
              >
                <option value={1}>Panel 1</option>
                <option value={2}>Panel 2</option>
                <option value={3}>Panel 3</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">Text</label>
              <textarea
                value={newDialogue.text}
                onChange={(e) => setNewDialogue({ ...newDialogue, text: e.target.value })}
                placeholder="Enter dialogue text..."
                rows={3}
                className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="col-span-6 bg-white rounded-xl p-6">
          <h3 className="text-gray-800 text-lg font-semibold mb-4">Comic Page Preview</h3>
          <div className="grid grid-cols-2 gap-4 h-96">
            {/* Panel 1 */}
            <div className="border-2 border-gray-300 rounded-lg p-4 relative bg-gray-50">
              <div className="absolute top-2 left-2 text-xs text-gray-500">Panel 1</div>
              {dialogues.filter(d => d.panel === 1).map((dialogue, index) => (
                <div
                  key={dialogue.id}
                  className={`absolute text-xs p-2 rounded-lg max-w-24 ${
                    dialogue.type === "speech" ? "bg-white border border-gray-400 speech-bubble" :
                    dialogue.type === "thought" ? "bg-white border border-gray-400 thought-bubble" :
                    dialogue.type === "caption" ? "bg-gray-800 text-white" :
                    "bg-yellow-200 text-black font-bold"
                  }`}
                  style={{
                    top: 30 + (index * 40),
                    left: 10 + (index % 2) * 60,
                  }}
                >
                  {dialogue.character && (
                    <div className="font-bold text-xs">{dialogue.character}:</div>
                  )}
                  {dialogue.text}
                </div>
              ))}
            </div>

            {/* Panel 2 */}
            <div className="border-2 border-gray-300 rounded-lg p-4 relative bg-gray-50">
              <div className="absolute top-2 left-2 text-xs text-gray-500">Panel 2</div>
              {dialogues.filter(d => d.panel === 2).map((dialogue, index) => (
                <div
                  key={dialogue.id}
                  className={`absolute text-xs p-2 rounded-lg max-w-24 ${
                    dialogue.type === "speech" ? "bg-white border border-gray-400" :
                    dialogue.type === "thought" ? "bg-white border border-gray-400" :
                    dialogue.type === "caption" ? "bg-gray-800 text-white" :
                    "bg-yellow-200 text-black font-bold"
                  }`}
                  style={{
                    top: 30 + (index * 40),
                    left: 10 + (index % 2) * 60,
                  }}
                >
                  {dialogue.character && (
                    <div className="font-bold text-xs">{dialogue.character}:</div>
                  )}
                  {dialogue.text}
                </div>
              ))}
            </div>

            {/* Panel 3 */}
            <div className="col-span-2 border-2 border-gray-300 rounded-lg p-4 relative bg-gray-50 h-32">
              <div className="absolute top-2 left-2 text-xs text-gray-500">Panel 3</div>
              {dialogues.filter(d => d.panel === 3).map((dialogue, index) => (
                <div
                  key={dialogue.id}
                  className={`absolute text-xs p-2 rounded-lg max-w-32 ${
                    dialogue.type === "speech" ? "bg-white border border-gray-400" :
                    dialogue.type === "thought" ? "bg-white border border-gray-400" :
                    dialogue.type === "caption" ? "bg-gray-800 text-white" :
                    "bg-yellow-200 text-black font-bold"
                  }`}
                  style={{
                    top: 30 + (index * 40),
                    left: 10 + (index % 3) * 80,
                  }}
                >
                  {dialogue.character && (
                    <div className="font-bold text-xs">{dialogue.character}:</div>
                  )}
                  {dialogue.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dialogue List */}
        <div className="col-span-3 bg-black-200 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-4">Dialogue List</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {dialogues.map((dialogue) => (
              <div
                key={dialogue.id}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  selectedDialogue === dialogue.id
                    ? "bg-orange-500/20 border border-orange-500/40"
                    : "bg-white/5 border border-white/20 hover:bg-white/10"
                }`}
                onClick={() => setSelectedDialogue(dialogue.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getDialogueIcon(dialogue.type)}
                    <span className="text-sm font-medium">Panel {dialogue.panel}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDialogue(dialogue.id);
                    }}
                    className="w-6 h-6 bg-red-500/20 hover:bg-red-500/40 rounded text-xs transition"
                  >
                    🗑
                  </button>
                </div>
                {dialogue.character && (
                  <div className="text-xs text-orange-400 mb-1">{dialogue.character}</div>
                )}
                <div className="text-xs text-white/70 line-clamp-2">{dialogue.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogueBoard;