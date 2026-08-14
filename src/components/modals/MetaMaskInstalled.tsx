"use client";
import React from "react";
import { ArrowLeft, HelpCircle } from "lucide-react";
import Image from "next/image";

type Props = {
  onBack?: () => void;
  onSelectWallet?: (wallet: string) => void;
};

const ConnectWalletModal = ({ onBack, onSelectWallet }: Props) => {
  const wallets = [
    { name: "Phantom", tag: "Popular", logo: "/phantom.png" },
    { name: "MetaMask", tag: "Installed", logo: "/metamask.png" },
    { name: "Trust Wallet", logo: "/trust.png" },
    { name: "Wallet Connect", logo: "/walletconnect.png" },
  ];

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 pb-10 text-white">
      {/* Header */}
      <div className="flex items-center justify-center relative mb-6">
        {/* Back Arrow */}
        <button
          onClick={onBack}
          className="absolute left-0 p-2 text-white hover:text-gray-300"
        >
          <ArrowLeft size={22} />
        </button>

        {/* Title + Help */}
        <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          Select your wallet
        </h3>

        <HelpCircle
          size={20}
          className="absolute right-0 text-white/70 cursor-pointer"
        />
      </div>

      {/* Wallet Options */}
      <div className="grid gap-4 mb-8">
        {wallets.map((wallet) => (
          <button
            key={wallet.name}
            onClick={() => onSelectWallet?.(wallet.name)}
            className="flex items-center justify-between border border-white/20 bg-white/5 hover:bg-white/10 transition rounded-xl px-4 py-3 sm:px-6 sm:py-4"
          >
            <div className="flex items-center gap-3">
              <Image
                src={wallet.logo}
                alt={wallet.name}
                width={40}
                height={40}
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              <span className="font-semibold text-lg">{wallet.name}</span>
            </div>
            {wallet.tag && (
              <span
                className={`text-xs sm:text-sm px-3 py-1 rounded-full font-bold transition ${
                  wallet.tag === "Installed"
                    ? "bg-green-500 text-black hover:brightness-110"
                    : wallet.tag === "Popular"
                    ? "bg-black text-white hover:brightness-125"
                    : "bg-yellow-500 text-black hover:brightness-110"
                }`}
              >
                {wallet.tag}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-center text-white/60 text-xs sm:text-sm leading-relaxed">
        If you have not logged in before, you will create a new Quiva account.
        By proceeding, you agree to our{" "}
        <span className="font-bold cursor-pointer hover:underline">
          Terms of Service
        </span>{" "}
        &{" "}
        <span className="font-bold cursor-pointer hover:underline">
          Privacy Policy
        </span>
        .
      </p>
    </div>
  );
};

export default ConnectWalletModal;
