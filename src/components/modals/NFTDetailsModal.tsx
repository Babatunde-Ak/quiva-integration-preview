import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import Image from "next/image";
import { Copy, CheckCircle2, Copy as CopyIcon } from "lucide-react";

interface NFTDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  nftTitle: string;
  nftImage: string;
  serialNumber: number;
  tokenId: string;
  contractAddress?: string;
  description?: string;
  isMintedViaCampaign?: boolean;
}

const NFTDetailsModal: React.FC<NFTDetailsModalProps> = ({
  isOpen,
  onClose,
  nftTitle,
  nftImage,
  serialNumber,
  tokenId,
  contractAddress,
  description,
  isMintedViaCampaign = true,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" size="lg">
      <ModalContent className="bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] rounded-3xl border border-[#242424]">
        <ModalHeader className="flex items-center justify-between p-6 border-b border-[#242424]">
          <h2 className="text-2xl font-bold text-white">NFT Details</h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            ✕
          </button>
        </ModalHeader>

        <ModalBody className="p-6 space-y-6">
          {/* NFT Image */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-900 border border-[#242424]">
            <Image
              src={nftImage}
              alt={nftTitle}
              fill
              className="object-cover"
            />
            {/* Serial Badge */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-orange-500/50">
              <p className="text-orange-400 font-bold">#{serialNumber}</p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-bold text-xl mb-2">{nftTitle}</h3>
              {description && (
                <p className="text-white/70 text-sm">{description}</p>
              )}
            </div>

            {/* Mint Source */}
            {isMintedViaCampaign && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-orange-400 font-bold text-sm">🎨 Minted via Campaign</span>
                </div>
                <p className="text-orange-400/70 text-xs mt-1">
                  This NFT was minted as part of an exclusive drops campaign
                </p>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="bg-[#151515] rounded-2xl p-6 border border-[#242424] space-y-4">
            <h4 className="text-white font-bold text-sm mb-4">BLOCKCHAIN DETAILS</h4>

            {/* Serial Number */}
            <div className="space-y-2">
              <label className="text-white/50 text-xs font-bold uppercase">Serial Number</label>
              <div className="flex items-center gap-2 bg-[#0A0A0A] rounded-lg p-3 border border-[#242424]">
                <span className="text-white font-mono text-sm flex-1">{serialNumber}</span>
                <button
                  onClick={() => handleCopy(serialNumber.toString(), "serial")}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  {copiedField === "serial" ? (
                    <CheckCircle2 size={16} className="text-green-500" />
                  ) : (
                    <CopyIcon size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Token ID */}
            <div className="space-y-2">
              <label className="text-white/50 text-xs font-bold uppercase">Token ID</label>
              <div className="flex items-center gap-2 bg-[#0A0A0A] rounded-lg p-3 border border-[#242424]">
                <span className="text-white font-mono text-sm flex-1">
                  {truncateAddress(tokenId)}
                </span>
                <button
                  onClick={() => handleCopy(tokenId, "tokenId")}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  {copiedField === "tokenId" ? (
                    <CheckCircle2 size={16} className="text-green-500" />
                  ) : (
                    <CopyIcon size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Contract Address */}
            {contractAddress && (
              <div className="space-y-2">
                <label className="text-white/50 text-xs font-bold uppercase">
                  Smart Contract Address
                </label>
                <div className="flex items-center gap-2 bg-[#0A0A0A] rounded-lg p-3 border border-[#242424]">
                  <span className="text-white font-mono text-sm flex-1">
                    {truncateAddress(contractAddress)}
                  </span>
                  <button
                    onClick={() => handleCopy(contractAddress, "contract")}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    {copiedField === "contract" ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <CopyIcon size={16} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Network */}
            <div className="space-y-2">
              <label className="text-white/50 text-xs font-bold uppercase">Network</label>
              <div className="bg-[#0A0A0A] rounded-lg p-3 border border-[#242424]">
                <span className="text-white font-mono text-sm">Hedera Testnet</span>
              </div>
            </div>
          </div>

          {/* View on Explorer */}
          <button
            onClick={() => {
              // Open in block explorer
              const explorerUrl = `https://testnet.hashscan.io/token/${tokenId}`;
              window.open(explorerUrl, "_blank");
            }}
            className="w-full text-center py-3 px-4 rounded-lg border border-orange-500/50 hover:border-orange-500 text-orange-400 hover:text-orange-300 font-bold transition-all"
          >
            View on Block Explorer →
          </button>
        </ModalBody>

        <ModalFooter className="flex gap-3 p-6 border-t border-[#242424]">
          <Button
            onPress={onClose}
            color="primary"
            size="lg"
            className="flex-1 font-bold"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NFTDetailsModal;
