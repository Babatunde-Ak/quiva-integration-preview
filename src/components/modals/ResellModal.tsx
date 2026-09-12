"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { HbarIcon } from "@/components/ui/HbarIcon";
import { useWagmiMarketplace } from "@/hook/useWagmiMarketplace";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
interface ComicData {
  id: string;
  title: string;
  collection: string;
  edition: number;
  totalEditions: number;
  imageUrl: string;
  tokenAddress?: string;
  tokenId?: string;
  serialNumber?: number | string;
}

interface ResellModalProps {
  isOpen: boolean;
  onClose: () => void;
  comic: ComicData;
}

export default function ResellModal({
  isOpen,
  onClose,
  comic,
}: ResellModalProps) {
  const { listForResale, isConnected, error: marketplaceError } = useWagmiMarketplace();
  const [step, setStep] = useState<"input" | "success">("input");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { currentComic } = useAppSelector((state: any) => state.comic);
  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("input");
        setAmount("");
        setIsLoading(false);
        setLocalError(null);
      }, 300);
    }
  }, [isOpen]);

  const handleListForSale = async () => {
    const priceInHbar = Number(amount);
    const routeParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const routeTokenId = routeParams?.get("tokenId") || "";
    const routeSerial = routeParams?.get("serialNumber");
    const serialNumber = Number(comic.serialNumber ?? routeSerial ?? 0);
    const tokenAddress = comic.tokenAddress || comic.tokenId || routeTokenId || currentComic.nftId.tokenId;

    if (!Number.isFinite(priceInHbar) || priceInHbar < 0.1) {
      setLocalError("Enter a resale price of at least 0.1 HBAR.");
      return;
    }
    if (!isConnected) {
      setLocalError("Connect your wallet before listing this NFT.");
      return;
    }
    if (!tokenAddress || !Number.isFinite(serialNumber) || serialNumber <= 0) {
      setLocalError("This comic is missing its NFT token address or serial number.");
      return;
    }

    setIsLoading(true);
    setLocalError(null);

    try {
      await listForResale({
        tokenAddress,
        serialNumber,
        priceInHbar,
      });
      setIsLoading(false);
      setStep("success");
    } catch (error: any) {
      setIsLoading(false);
      setLocalError(error?.message || "Unable to list this comic for resale.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop with blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden">
        <AnimatePresence mode="wait">
          {step === "input" ? (
            <ListingStep
              key="step-input"
              comic={comic}
              amount={amount}
              setAmount={setAmount}
              onCancel={onClose}
              onConfirm={handleListForSale}
              isLoading={isLoading}
              error={localError || marketplaceError}
            />
          ) : (
            <SuccessStep key="step-success" comic={comic} onClose={onClose} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Step 1: Input Form ---
const ListingStep = ({
  comic,
  amount,
  setAmount,
  onCancel,
  onConfirm,
  isLoading,
  error,
}: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: -10 }}
    transition={{ duration: 0.2 }}
    className="bg-[#0f0f0f] font-mono border border-neutral-800 rounded-2xl p-6 shadow-2xl"
  >
    <div className="text-center mb-6">
      <h2 className="text-xl font-bold text-white mb-1">List comic for sale</h2>
      <p className="text-sm text-neutral-400">
        You&apos;re about to put this comic up for sale. Set your price and let
        collectors grab it from you.
      </p>
    </div>

    {/* Comic Card Preview */}
    <div className="bg-neutral-800/50 rounded-xl p-3 mb-6 flex gap-4 items-center border border-neutral-700/50">
      <div className="relative w-16 h-20 rounded-md overflow-hidden shrink-0 bg-neutral-700">
        <img
          src={comic.imageUrl}
          alt={comic.title}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-white font-semibold text-sm">{comic.collection}</h3>
        <p className="text-xs text-neutral-300 mt-0.5">{comic.title}</p>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-400">
          <span>
            Edition Info <br />{" "}
            <strong className="text-white text-xs">
              #{comic.edition} of {comic.totalEditions}
            </strong>
          </span>
          <div className="h-6 w-[1px] bg-neutral-700"></div>
          <span>
            Status <br />{" "}
            <span className="flex items-center gap-1 text-green-500 font-bold bg-green-500/10 px-1.5 py-0.5 rounded text-[10px]">
              Owned <Check size={10} strokeWidth={4} />
            </span>
          </span>
        </div>
      </div>
    </div>

    {/* Input Area */}
    <div className="mb-6">
      <div className="relative">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter Amount"
          className="w-full bg-neutral-800/50 border border-neutral-700 rounded-lg py-3 px-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
        />
      </div>
      <p className="flex text-xs items-center text-neutral-400 mt-2">
        Minimum resale price: 0.1
        <HbarIcon size={12} />
      </p>
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>

    {/* Actions */}
    <div className="flex gap-3">
      <button
        onClick={onConfirm}
        disabled={isLoading || !amount}
        className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 size={18} className="animate-spin" />}
        List For Sale
      </button>
      <button
        onClick={onCancel}
        className="flex-1 border border-neutral-600 hover:border-neutral-500 text-white font-medium py-3 rounded-full transition-colors"
      >
        Cancel
      </button>
    </div>
  </motion.div>
);

// --- Step 2: Success Message ---
const SuccessStep = ({ comic, onClose }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.3, type: "spring" }}
    className="bg-[#000] border font-mono border-neutral-800 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden"
  >
    {/* Confetti / Success Visual */}
    <div className="relative w-24 h-32 mx-auto mb-6">
      {/* Main Image */}
      <div className="relative z-10 w-24 h-32 rounded-lg border-2 border-neutral-700 overflow-hidden shadow-lg transform rotate-[-3deg]">
        <img
          src={comic.imageUrl}
          alt={comic.title}
          className="object-cover w-full h-full"
        />
      </div>
      {/* Success Icon Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="absolute -bottom-2 -right-2 z-20 bg-neutral-800 border border-neutral-700 rounded-full p-2 shadow-lg"
      >
        <span className="text-xl">🎉</span>
      </motion.div>
    </div>

    <h2 className="text-xl font-bold text-white mb-3">
      Comic Listed Successfully!
    </h2>
    <p className="text-sm text-neutral-400 mb-8 leading-relaxed max-w-xs mx-auto">
      Your comic{" "}
      <span className="text-white font-medium">
        {comic.collection} #{comic.edition}
      </span>{" "}
      (Edition #{comic.edition} of {comic.totalEditions}) is now live on the
      Quiva Marketplace. Seat back and let the bids roll in.
    </p>

    <div className="flex gap-3">
      <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-full transition-colors">
        View in marketplace
      </button>
      <button
        onClick={onClose}
        className="flex-1 border border-neutral-600 hover:border-neutral-500 text-white font-medium py-3 rounded-full transition-colors"
      >
        Back to my Comics
      </button>
    </div>
  </motion.div>
);
