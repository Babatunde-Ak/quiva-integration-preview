import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";
import Image from "next/image";
import { Send, AlertCircle } from "lucide-react";

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offerAmount: number) => Promise<void>;
  nftTitle: string;
  nftImage: string;
  serialNumber: number;
  minPrice?: number;
}

const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  nftTitle,
  nftImage,
  serialNumber,
  minPrice = 0.01,
}) => {
  const [offerAmount, setOfferAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (!offerAmount || isNaN(parseFloat(offerAmount))) {
      setError("Please enter a valid offer amount");
      return;
    }

    const amount = parseFloat(offerAmount);
    if (amount < minPrice) {
      setError(`Offer must be at least ${minPrice} HBAR`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(amount);
      // Close modal on success
      setOfferAmount("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOfferAmount("");
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} backdrop="blur" size="md">
      <ModalContent className="bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] rounded-3xl border border-[#242424]">
        <ModalHeader className="flex items-center justify-between p-6 border-b border-[#242424]">
          <h2 className="text-2xl font-bold text-white">Make an Offer</h2>
          <button
            onClick={handleClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            ✕
          </button>
        </ModalHeader>

        <ModalBody className="p-6 space-y-4">
          {/* NFT Preview */}
          <div className="bg-[#151515] rounded-2xl p-4 border border-[#242424] flex gap-4">
            {nftImage && (
              <div className="relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={nftImage} alt={nftTitle} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-white font-bold mb-2 line-clamp-2">{nftTitle}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Serial:</span>
                  <span className="text-white font-bold">#{serialNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Offer Amount Input */}
          <div className="space-y-2">
            <label className="text-white/70 text-sm font-bold">Offer Amount (HBAR)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.00"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                disabled={isSubmitting}
                classNames={{
                  input: "text-white bg-[#0A0A0A] border-[#242424]",
                  inputWrapper: "bg-[#0A0A0A] border border-[#242424] rounded-lg",
                }}
                startContent={
                  <span className="text-white/50 text-sm font-bold">≈</span>
                }
                endContent={
                  <span className="text-white/50 text-sm font-bold">HBAR</span>
                }
              />
              <div className="flex items-center justify-center w-16 h-10 rounded-lg bg-[#0A0A0A] border border-[#242424]">
                <Image src="/hbar.png" alt="HBAR" width={20} height={20} />
              </div>
            </div>
          </div>

          {/* Min Price Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
            <p className="text-blue-400">
              ℹ️ Minimum offer: <strong>{minPrice} HBAR</strong>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-[#151515] rounded-lg p-4 space-y-2 text-sm">
            <p className="text-white/70">
              <strong>Collection owners</strong> will be notified of your offer. They can accept or decline your offer.
            </p>
            <p className="text-white/50 text-xs">This offer will be valid for 7 days.</p>
          </div>
        </ModalBody>

        <ModalFooter className="flex gap-3 p-6 border-t border-[#242424]">
          <Button
            onPress={handleClose}
            variant="bordered"
            size="lg"
            disabled={isSubmitting}
            className="flex-1 border-[#242424] text-white hover:border-[#333]"
          >
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            disabled={isSubmitting || !offerAmount}
            size="lg"
            className="flex-1 font-bold text-black bg-[#FF9F1C] hover:bg-[#FFB045] disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Offer
              </>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MakeOfferModal;
