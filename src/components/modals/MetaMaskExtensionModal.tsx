"use client";
import React from "react";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

type Props = {
  onBack?: () => void;
};

const MetaMaskModal = ({ onBack }: Props) => {
  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 text-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1 hover:text-gray-300">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Image
          src="/metamask.png"
          alt="MetaMask"
          width={40}
          height={40}
          className="object-contain"
        />
      </div>


        {/* Title */}
        <div className="text-center">
        <h2 className="text-xl font-bold mb-2">
            Install MetaMask extension to connect
        </h2>
        <p className="text-white/70 mb-6">
            Select from your preferred options below:
        </p>
        </div>




      {/* Options */}
      <div className="flex flex-col gap-3">
        <button className="flex items-center gap-3 border border-white/20 bg-white/5 hover:bg-white/10 transition rounded-lg px-4 py-3">
          <Image src="/chrome.png" alt="Chrome" width={24} height={24} />
          <span>Install Chrome Extension</span>
        </button>
        <button className="flex items-center gap-3 border border-white/20 bg-white/5 hover:bg-white/10 transition rounded-lg px-4 py-3">
          <Image src="/edge.png" alt="Edge" width={24} height={24} />
          <span>Install Edge Extension</span>
        </button>
        <button className="flex items-center gap-3 border border-white/20 bg-white/5 hover:bg-white/10 transition rounded-lg px-4 py-3">
          <Image src="/firefox.png" alt="Firefox" width={24} height={24} />
          <span>Install Firefox Extension</span>
        </button>
      </div>

      {/* Footer */}
    <div className="text-center">
      <p className="text-white/60 text-sm mt-6">
        Refresh the page once installed
      </p>
      </div>
    </div>
  );
};

export default MetaMaskModal;
