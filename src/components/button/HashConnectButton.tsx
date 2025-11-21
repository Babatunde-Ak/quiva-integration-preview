import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWallet, useEvmAddress } from '@buidlerlabs/hashgraph-react-wallets';
import { HashpackConnector } from '@buidlerlabs/hashgraph-react-wallets/connectors';
import { ChevronDown, LogOut, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useWalletAuth } from "@/hook/useWalletAuth";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { logout, setWalletAddress } from "@/redux/slices/walletSlice";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MainButton } from ".";
import { useRouter } from "next/navigation";
import { FaCog, FaStore } from "react-icons/fa";
import { toast } from "react-toastify";
import Picture from '../picture/Index';
import { hashpack } from '../../../public/dev_images';

type HashConnectProps = {
  disabled?: boolean;
};

export default function HashConnectButton({ disabled = false }: HashConnectProps) {
  const router = useRouter();
  const { loginWithWallet } = useWalletAuth();
  const { data: evmAddress } = useEvmAddress();
  const { 
    isConnected, 
    connect, 
    disconnect, 
    isLoading: isConnecting, 
    extensionReady 
  } = useWallet(HashpackConnector);
  
  const dispatch = useAppDispatch();
  const { isAuthenticated, error } = useAppSelector((state) => state.wallet);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userMenuItems = [
    {
      label: "Marketplace",
      icon: <FaStore className="w-4 h-4"/>,
      action: () => router.push("/marketplace")
    },
    {
      label: "Settings",
      icon: <FaCog className="w-4 h-4"/>,
      action: () => router.push("/comic-pad/settings")
    }
  ];

  // Auto-login when wallet connects
  const autoLogin = useCallback(async () => {
    if (isConnected && !isAuthenticated && evmAddress && !isLoggingIn) {
      try {
        setIsLoggingIn(true);
        await dispatch(setWalletAddress(evmAddress));
        await loginWithWallet();
      } catch (err) {
        console.error("Auto-login failed:", err);
        toast.error("Auto-login failed. Please try again.");
      } finally {
        setIsLoggingIn(false);
      }
    }
  }, [isConnected, isAuthenticated, evmAddress, isLoggingIn, dispatch, loginWithWallet]);

  useEffect(() => {
    autoLogin();
  }, [autoLogin]);

  const handleConnect = useCallback(async () => {
    try {
      if (!extensionReady) {
        toast.error("Please install the HashPack extension to connect your wallet.");
        window.open('https://www.hashpack.app/', '_blank');
        return;
      }
      
      const result = await connect();
      if (result) {
        toast.success(`Connected successfully! Address: ${evmAddress}`);
        console.log("Connected to HashPack:", result);
      }
    } catch (error) {
      console.error("Error connecting to HashPack:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  }, [connect, extensionReady, evmAddress]);

  const handleLogout = useCallback(async () => {
    try {
      await disconnect();
      dispatch(logout());
      toast.info("Wallet disconnected");
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Error disconnecting wallet");
    }
  }, [disconnect, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  // Generate a unique avatar based on EVM address
  const getAvatarUrl = (evmAddress: string) => {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${evmAddress}`;
  };

  const getInitials = (evmAddress?: string) => {
    if (evmAddress) {
      return evmAddress.slice(2, 4).toUpperCase();
    }
    return "HB";
  };

  const getExplorerUrl = () => {
    if (!evmAddress) return "";
    return `https://hashscan.io/testnet/address/${evmAddress}`;
  };

  // Not connected state
  if (!isConnected) {
    return (
      <MainButton
        onClick={disabled ? undefined : handleConnect}
        disabled={disabled || isConnecting || !extensionReady}
        className={`w-full px-4 py-2 rounded-xl font-medium border transition-colors flex items-center justify-center gap-2
          ${
            disabled || isConnecting || !extensionReady
              ? "bg-gray-400 text-gray-200 cursor-not-allowed border-gray-400"
              : "bg-transparent text-white border-white/30 hover:border-white hover:bg-white/10"
          }`}
      >
        <Picture src={hashpack} alt='hashpack icon' width={12} height={12}/>
        {isConnecting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Connecting...
          </>
        ) : !extensionReady ? (
          "Install HashPack"
        ) : (
          "HashPack"
        )}
      </MainButton>
    );
  }

  // Connected state with dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={disabled ? undefined : () => setIsDropdownOpen(!isDropdownOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors
          ${
            disabled
              ? "bg-gray-300 cursor-not-allowed border-gray-300"
              : "bg-transparent border-white/30 hover:border-white hover:bg-white/10"
          }`}
      >
        <Avatar className="w-7 h-7 lg:w-8 lg:h-8 border border-secondary-200/50">
          <AvatarImage
            src={getAvatarUrl(evmAddress || "")}
            alt="User Avatar"
          />
          <AvatarFallback className="bg-secondary-200 text-white text-xs font-medium">
            {getInitials(evmAddress)}
          </AvatarFallback>
        </Avatar>

        <span className="text-white text-sm font-medium hidden sm:block">
          {evmAddress ? truncateAddress(evmAddress) : "HashPack"}
        </span>

        <ChevronDown
          size={16}
          className={`text-white transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-black-400 border border-white/20 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-secondary-200/50">
                <AvatarImage
                  src={getAvatarUrl(evmAddress || "")}
                  alt="User Avatar"
                />
                <AvatarFallback className="bg-secondary-200 text-white text-sm font-medium">
                  {getInitials(evmAddress)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium text-sm">
                  {evmAddress ? truncateAddress(evmAddress) : "HashPack User"}
                </p>
                <p className="text-white/60 text-xs">Hedera Network</p>
              </div>
            </div>
          </div>

          {/* EVM Address */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">
                  EVM Address
                </p>
                <p className="text-white font-mono text-sm">
                  {evmAddress ? truncateAddress(evmAddress) : "N/A"}
                </p>
              </div>
              <div className="flex gap-2">
                <MainButton
                  onClick={() => evmAddress && copyToClipboard(evmAddress)}
                  className="!p-2 hover:bg-white/10 rounded-lg transition-colors relative"
                  title="Copy EVM address"
                >
                  <Copy size={14} className="text-white/60" />
                  {copySuccess && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Copied!
                    </span>
                  )}
                </MainButton>
                <MainButton
                  onClick={() => window.open(getExplorerUrl(), "_blank")}
                  className="!p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="View on HashScan"
                >
                  <ExternalLink size={14} className="text-white/60" />
                </MainButton>
              </div>
            </div>
          </div>

          {/* Network Info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">H</span>
                </div>
                <div className="text-left">
                  <p className="text-white/60 text-xs">Network</p>
                  <p className="text-white text-sm font-medium">
                    Hedera Testnet
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          {userMenuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.action();
                setIsDropdownOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black-300 transition-colors ${
                index === userMenuItems.length - 1 ? '' : 'border-b border-white/10'
              } text-white`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </button>
          ))}

          {/* Disconnect */}
          <div className="p-2">
            <button
              onClick={() => {
                handleLogout();
                setIsDropdownOpen(false);
              }}
              className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-lg transition-colors text-red-400 hover:text-red-300"
            >
              <LogOut size={16} />
              <span className="text-sm font-medium">
                Disconnect
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}