"use client";
import React, { useState } from "react";
import { ArrowLeft, Eye, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import PublishingModal from "./PublishingModal";

type BoardType = "script" | "draw" | "layout" | "dialogue";

interface ScriptBuilderLayoutProps {
  children: React.ReactNode;
  currentBoard: BoardType;
  onBoardChange: (board: BoardType) => void;
  onPreview: () => void;
}

const ScriptBuilderLayout = ({
  children,
  currentBoard,
  onBoardChange,
  onPreview,
}: ScriptBuilderLayoutProps) => {
  const router = useRouter();
  const [showPublishModal, setShowPublishModal] = useState(false);

  const boards = [
    { id: "script" as BoardType, label: "Script Editor" },
    { id: "draw" as BoardType, label: "Draw Board" },
    { id: "layout" as BoardType, label: "Layout Board" },
    { id: "dialogue" as BoardType, label: "Dialogue Board" },
  ];

  const handleBackToComicPad = () => {
    router.push("/comic-pad");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation Bar */}
      <div className="bg-black-200 border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button and Board navigation */}
          <div className="flex items-center gap-6">
            <button
              onClick={handleBackToComicPad}
              className="flex items-center gap-2 text-white/70 hover:text-white transition"
            >
              <ArrowLeft size={20} />
              <span>Back to Comic Pad</span>
            </button>

            {/* Board Navigation */}
            <div className="flex items-center gap-4">
              {boards.map((board, index) => (
                <React.Fragment key={board.id}>
                  <button
                    onClick={() => onBoardChange(board.id)}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentBoard === board.id
                        ? "bg-orange-500 text-black font-semibold"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {board.label}
                  </button>
                  {index < boards.length - 1 && (
                    <div className="w-2 h-2 rounded-full bg-white/30" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right side - Pages, Preview, and Publish buttons */}
          <div className="flex items-center gap-4">
            {/* Pages indicator */}
            <div className="text-white/70 text-sm">Page 1 of 1</div>

            {/* Preview button */}
            <button
              onClick={onPreview}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              <Eye size={18} />
              Preview
            </button>

            {/* Publish button */}
            <button
              onClick={() => setShowPublishModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-lg transition"
            >
              <Upload size={18} />
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">{children}</div>

      {/* Publishing Modal */}
      {showPublishModal && (
        <PublishingModal onClose={() => setShowPublishModal(false)} />
      )}
    </div>
  );
};

export default ScriptBuilderLayout;
