import React, { useState, useRef, useEffect, useCallback } from 'react';
//import { HashpackConnector, useEvmAddress, useWallet } from '@reown/walletkit';
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
import { useHederaWallet } from '@/providers/HashPackProvider';

type HashConnectProps = {
  disabled?: boolean;
};

export default function HashConnectButton({ disabled = false }: HashConnectProps) {
  const router = useRouter();
  const { loginWithWallet } = useWalletAuth();
  // const { data: evmAddress } = useEvmAddress();
  // const { 
  //   isConnected, 
  //   connect, 
  //   disconnect, 
  //   isLoading: isConnecting
   
  // } = useWallet(HashpackConnector);
  //const { account: evmAddress, isConnected, connectWallet, disconnect, isLoading: isConnecting } = useHederaWallet();
   const { connectWallet, disconnectWallet, isConnected, account, evmAddress } = useHederaWallet();
  const dispatch = useAppDispatch();
  const { isAuthenticated, error } = useAppSelector((state:any) => state.wallet);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownPanelRef = useRef<HTMLDivElement>(null);
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

  // Ref-based guard so changing it never recreates the effect
  const isLoggingInRef = useRef(false);

  useEffect(() => {
    if (!isConnected || isAuthenticated || !account || isLoggingInRef.current) return;

    const run = async () => {
      isLoggingInRef.current = true;
      setIsLoggingIn(true);
      try {
        await dispatch(setWalletAddress(account));
        await loginWithWallet();
      } catch (err: any) {
        console.error("Auto-login failed:", err);
        toast.error("Auto-login failed. Please try again.");
      } finally {
        isLoggingInRef.current = false;
        setIsLoggingIn(false);
      }
    };

    run();
    // loginWithWallet is intentionally excluded — it's a new reference every render
    // and must not re-trigger this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isAuthenticated, account, dispatch]);
  const handleConnect = useCallback(async () => {
    try {
      setIsConnecting(true);
      console.log("Initiating HashPack connection...");

      const result = await connectWallet();
      
      if (result) {
        toast.success(`Connected successfully! Address: ${account}`);
      } else {
        // Connection returned but no result - user may have cancelled
        console.warn("Connection returned without result - user may have cancelled or extension not installed");
      }
    } catch (error: any) {
      console.error("Error connecting to HashPack:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        name: error?.name,
        stack: error?.stack
      });
      
      // Provide more specific error messages
      if (error?.message?.includes("User rejected") || error?.message?.includes("rejected")) {
        toast.info("Connection cancelled by user");
      } else if (error?.message?.includes("not installed") || error?.message?.includes("extension")) {
        toast.error("HashPack extension not found. Please install it from the Chrome Web Store.");
      } else {
        toast.error(`Failed to connect: ${error?.message || "Please try again."}`);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [connectWallet, account]);

  const handleLogout = useCallback(async () => {
    try {
      await disconnectWallet();
      dispatch(logout());
      toast.info("Wallet disconnected");
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Error disconnecting wallet");
    }
  }, [disconnectWallet, dispatch]);

  const handleToggleDropdown = () => {
    if (!isDropdownOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside both the trigger and the panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current?.contains(event.target as Node) ||
        dropdownPanelRef.current?.contains(event.target as Node)
      ) return;
      setIsDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    if (!account) return "";
    return `https://hashscan.io/testnet/address/${account}`;
  };

  // Not connected state
  if (!isConnected) {
    return (
      <MainButton
        onClick={disabled ? undefined : handleConnect}
        disabled={disabled || isConnecting}
        className={`w-full px-4 py-2 rounded-xl font-medium border transition-colors flex items-center justify-center gap-2
          ${
            disabled || isConnecting
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
        ref={triggerRef}
        onClick={disabled ? undefined : handleToggleDropdown}
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
            src={getAvatarUrl(account || "")}
            alt="User Avatar"
          />
          <AvatarFallback className="bg-secondary-200 text-white text-xs font-medium">
            {getInitials(account)}
          </AvatarFallback>
        </Avatar>

        <span className="text-white text-sm font-medium hidden sm:block">
          {account ? truncateAddress(account) : "HashPack"}
        </span>

        <ChevronDown
          size={16}
          className={`text-white transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu — fixed so it escapes any overflow-hidden parent */}
      {isDropdownOpen && (
        <div
          ref={dropdownPanelRef}
          className="fixed w-72 bg-black-400 border border-white/20 rounded-xl shadow-xl z-[200] overflow-hidden"
          style={{ top: dropdownPos.top, right: dropdownPos.right }}
        >
          {/* User Info Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-secondary-200/50">
                <AvatarImage
                  src={getAvatarUrl(account || "")}
                  alt="User Avatar"
                />
                <AvatarFallback className="bg-secondary-200 text-white text-sm font-medium">
                  {getInitials(account)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium text-sm">
                  {account ? truncateAddress(account) : "HashPack User"}
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


// // HashConnectButton.tsx - Updated to use HashinalsProvider while keeping the same component name
// 'use client';

// import React, { useState } from 'react';
// import { useHederaWallet } from '../../providers/HashPackProvider';
// import { Copy, ExternalLink, LogOut, Loader2, ChevronDown } from 'lucide-react';
// import { toast } from 'react-toastify';

// export default function HashConnectButton() {
//   const { connectWallet, disconnectWallet, isConnected, account } = useHederaWallet();
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [copySuccess, setCopySuccess] = useState(false);
//   const [isConnecting, setIsConnecting] = useState(false);

//   const handleConnect = async () => {
//     try {
//       setIsConnecting(true);
//       await connectWallet();
//       toast.success('Wallet connected successfully!');
//     } catch (error: any) {
//       console.error('Error connecting to wallet:', error);
//       toast.error(error?.message || 'Failed to connect.');
//     } finally {
//       setIsConnecting(false);
//     }
//   };

//   const handleDisconnect = async () => {
//     try {
//       await disconnectWallet();
//       toast.info('Wallet disconnected');
//       setIsDropdownOpen(false);
//     } catch (error) {
//       console.error('Error disconnecting wallet:', error);
//       toast.error('Failed to disconnect.');
//     }
//   };

//   const copyToClipboard = async (text: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       setCopySuccess(true);
//       setTimeout(() => setCopySuccess(false), 2000);
//     } catch (err) {
//       console.error('Failed to copy:', err);
//     }
//   };

//   const truncateAddress = (address: string) => {
//     return `${address.slice(0, 8)}...${address.slice(-6)}`;
//   };

//   if (!isConnected) {
//     return (
//       <button
//         onClick={handleConnect}
//         disabled={isConnecting}
//         className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//       >
//         {isConnecting ? (
//           <>
//             <Loader2 size={16} className="animate-spin" /> Connecting...
//           </>
//         ) : (
//           'Connect Wallet'
//         )}
//       </button>
//     );
//   }

//   return (
//     <div className="relative inline-block text-left">
//       <button
//         onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//         className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white/30 hover:border-white rounded-lg text-white"
//       >
//         <span>{truncateAddress(account || '')}</span>
//         <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
//       </button>

//       {isDropdownOpen && (
//         <div className="absolute right-0 mt-2 w-64 bg-black border border-white/20 rounded-xl shadow-lg z-50 overflow-hidden">
//           <div className="p-4 border-b border-white/10">
//             <p className="text-white text-sm font-medium">Connected Account</p>
//             <p className="text-white/70 text-xs font-mono mt-1">{account}</p>
//             <div className="flex gap-2 mt-2">
//               <button
//                 onClick={() => account && copyToClipboard(account)}
//                 className="flex items-center gap-1 text-xs text-gray-300 hover:text-white"
//               >
//                 <Copy size={14} /> Copy
//                 {copySuccess && <span className="text-green-400 ml-1">Copied!</span>}
//               </button>
//               <button
//                 onClick={() => window.open(`https://hashscan.io/testnet/account/${account}`, '_blank')}
//                 className="flex items-center gap-1 text-xs text-gray-300 hover:text-white"
//               >
//                 <ExternalLink size={14} /> View
//               </button>
//             </div>
//           </div>

//           <button
//             onClick={handleDisconnect}
//             className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 border-t border-white/10 text-sm"
//           >
//             <LogOut size={16} /> Disconnect
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
