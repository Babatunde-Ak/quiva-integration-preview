import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

interface MintSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMintMore: () => void;
  onReadComic: () => void;
  comicTitle: string;
  comicImage: string;
  mintedQuantity: number;
  totalMinted: number;
}

const MintSuccessModal: React.FC<MintSuccessModalProps> = ({
  isOpen,
  onClose,
  onMintMore,
  onReadComic,
  comicTitle,
  comicImage,
  mintedQuantity,
  totalMinted,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdrop="blur"
      size="md"
      isDismissable={false}
      classNames={{
        backdrop: "bg-black/50 backdrop-opacity-75",
      }}
    >
      <ModalContent className="bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] rounded-3xl border border-[#242424] p-0">
        {/* Header with Close */}
        <ModalHeader className="flex items-center justify-between p-6 border-b border-[#242424]">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-bold text-white">Mint Successful!</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            ✕
          </button>
        </ModalHeader>

        {/* Body */}
        <ModalBody className="p-6 space-y-6">
          {/* Success Message */}
          <div className="text-center">
            <p className="text-white/80 text-lg mb-2">
              Congratulations! You just minted
            </p>
            <p className="text-3xl font-bold text-orange-400 mb-4">
              {mintedQuantity} NFT{mintedQuantity > 1 ? "s" : ""}
            </p>
            <p className="text-white/60 text-sm">
              Your minted comics are now available in the Comics tab
            </p>
          </div>

          {/* Comic Preview Card */}
          <div className="bg-[#151515] rounded-2xl p-4 border border-[#242424] flex gap-4">
            {comicImage && (
              <div className="relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={comicImage}
                  alt={comicTitle}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-white font-bold mb-2 line-clamp-2">
                {comicTitle}
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">You minted:</span>
                  <span className="text-white font-bold">
                    {mintedQuantity} NFT{mintedQuantity > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Total minted:</span>
                  <span className="text-white/80 font-bold">{totalMinted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-400 text-sm">
              ℹ️ Your minted NFTs are now visible in the <strong>Comics tab</strong>. You can view or read your minted editions there.
            </p>
          </div>
        </ModalBody>

        {/* Footer */}
        <ModalFooter className="flex gap-3 p-6 border-t border-[#242424]">
          <Button
            onPress={onMintMore}
            color="warning"
            size="lg"
            className="flex-1 font-bold text-black bg-[#FF9F1C] hover:bg-[#FFB045]"
          >
            Mint More
          </Button>
          <Button
            onPress={onReadComic}
            variant="bordered"
            size="lg"
            className="flex-1 font-bold border-orange-500/50 text-orange-400 hover:border-orange-500 hover:bg-orange-500/10"
          >
            Read Comic
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MintSuccessModal;
