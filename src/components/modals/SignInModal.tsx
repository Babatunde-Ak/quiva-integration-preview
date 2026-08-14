"use client";
import React from "react";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

type Props = {
  onBack?: () => void;
};

const SignInModal = ({ onBack }: Props) => {
  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 pb-10 text-white">
      {/* Header with Back Arrow */}
      <div className="flex items-center justify-center relative mb-6">
        <button
          onClick={onBack}
          className="absolute left-0 p-2 text-white hover:text-gray-300"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-center mb-6">Sign-in</h2>

      {/* Logo with quarter circle loader */}
      <div className="flex justify-center items-center mb-6 relative">
        <div className="relative">
          <Image
            src="/metamask.png"
            alt="MetaMask"
            width={80}
            height={80}
            className="w-20 h-20 object-contain"
          />
          {/* Quarter Circle Loader */}
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-yellow-500 border-t-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      </div>

      {/* Instruction Text */}
      <p className="text-center text-white/70 text-sm sm:text-base">
        Click sign in in your wallet to confirm you own this wallet
      </p>
    </div>
  );
};

export default SignInModal;
