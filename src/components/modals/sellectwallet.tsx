"use client";
import React from "react";
import { X, Wallet } from "lucide-react";
// import { CustomConnectButton } from "@/providers/WalletProvider";

interface SelectWalletModalProps {
  onClose: () => void;
}

const SelectWalletModal = ({ onClose }: SelectWalletModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-950 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet size={32} className="text-black" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Connect Wallet
          </h2>
          <p className="text-white/70">
            Connect your wallet to access all Quiva features
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="space-y-4">
          {/* <CustomConnectButton /> */}

          <div className="text-center">
            <p className="text-white/50 text-sm">
              By connecting, you agree to our{" "}
              <a
                href="/terms"
                className="text-secondary-300 hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="text-secondary-300 hover:underline"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectWalletModal;


