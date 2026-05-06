import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useWalletAuth } from "@/hook/useWalletAuth";
import { useAccount, useDisconnect } from "wagmi";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { logout } from "@/redux/slices/walletSlice";
import { setWalletAddress } from "@/redux/slices/walletSlice";

// Import your Avatar components (adjust path as needed)
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MainButton } from ".";
import { useRouter } from "next/navigation";
import { FaCog, FaSignOutAlt, FaStore } from "react-icons/fa";
import { rainbow } from "../../../public/dev_images";
import Picture from "../picture/Index";

type RainbowConnectProps = {
  disabled?: boolean;
};

export const RainbowConnect: React.FC<RainbowConnectProps> = ({
  disabled = false,
}) => {
  const router = useRouter();
  const { loginWithWallet } = useWalletAuth();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const dispatch = useAppDispatch();

  const { isAuthenticated, error } = useAppSelector((state:any) => state.wallet);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
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
      }, {
          label: "Settings",
          icon: <FaCog className="w-4 h-4"/>,
          action: () => router.push("/comic-pad/settings")
      }
  ]

  // Ref-based guard so changing it never recreates the effect
  const isLoggingInRef = useRef(false);

  useEffect(() => {
    if (!isConnected || isAuthenticated || !address || isLoggingInRef.current) return;

    const run = async () => {
      isLoggingInRef.current = true;
      setIsLoggingIn(true);
      try {
        await dispatch(setWalletAddress(address));
        await loginWithWallet();
      } catch (err: any) {
        console.error("Auto-login failed:", err);
      } finally {
        isLoggingInRef.current = false;
        setIsLoggingIn(false);
      }
    };

    run();
    // loginWithWallet intentionally excluded — new reference every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isAuthenticated, address, dispatch]);

  const handleLogout = () => {
    // Disconnect wallet
    disconnect();
    // Clear redux + localStorage
    dispatch(logout());
  };

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

  // Close dropdown when clicking outside both trigger and panel
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
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Generate a unique avatar based on wallet address
  const getAvatarUrl = (address: string) => {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`;
  };

  const getInitials = (displayName?: string, address?: string) => {
    if (displayName) {
      return displayName.slice(0, 2).toUpperCase();
    }
    if (address) {
      return address.slice(2, 4).toUpperCase();
    }
    return "??";
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        // Get dynamic explorer URL based on chain
        const getExplorerUrl = () => {
          // if (!account) return "";
          // const baseUrl =
          //   chain?.blockExplorers?.default?.url || "https://etherscan.io";
          // return `${baseUrl}/address/${account.address}`;
          return 'https://github.com/shadcn.png';
        };

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
                width: "100%",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <MainButton
                    onClick={
                      disabled
                        ? undefined
                        : () => {
                            openConnectModal();
                          }
                    }
                    disabled={disabled || isLoggingIn}
                    className={`w-full px-4 py-2 rounded-xl font-medium border transition-colors flex items-center justify-center gap-2
                      ${
                        disabled || isLoggingIn
                          ? "bg-gray-400 text-gray-200 cursor-not-allowed border-gray-400"
                          : "bg-transparent text-white border-white/30 hover:border-white hover:bg-white/10"
                      }`}
                  >
                    <Picture src={rainbow} alt='rainbow icon' width={16} height={16}/>
                    {isLoggingIn ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Rainbowkit "
                    )}
                  </MainButton>
                );
              }

              if (chain.unsupported) {
                return (
                  <MainButton
                    onClick={disabled ? undefined : openChainModal}
                    disabled={disabled}
                    className={`w-full px-4 py-2 rounded-xl font-medium border transition-colors
                      ${
                        disabled
                          ? "bg-gray-400 text-gray-200 cursor-not-allowed border-gray-400"
                          : "bg-transparent text-red-500 border-red-500 hover:bg-red-500/10"
                      }`}
                  >
                    Wrong network
                  </MainButton>
                );
              }

              return (
                <div className="relative" ref={dropdownRef}>
                  {/* Avatar MainButton */}
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
                        src={getAvatarUrl(account.address)}
                        alt="User Avatar"
                      />
                      <AvatarFallback className="bg-secondary-200 text-white text-xs font-medium">
                        {getInitials(account.displayName, account.address)}
                      </AvatarFallback>
                    </Avatar>

                    <span className="text-white text-sm font-medium hidden sm:block">
                      {truncateAddress(account.address)}
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
                              src={getAvatarUrl(account.address)}
                              alt="User Avatar"
                            />
                            <AvatarFallback className="bg-secondary-200 text-white text-sm font-medium">
                              {getInitials(account.displayName, account.address)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium text-sm">
                              {account.displayName || truncateAddress(account.address)}
                            </p>
                            {account.displayBalance && (
                              <p className="text-white/60 text-xs">
                                {account.displayBalance}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Wallet Address */}
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/60 text-xs mb-1">
                              Wallet Address
                            </p>
                            <p className="text-white font-mono text-sm">
                              {truncateAddress(account.address)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <MainButton
                              onClick={() => copyToClipboard(account.address)}
                              className="!p-2 hover:bg-white/10 rounded-lg transition-colors relative"
                              title="Copy address"
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
                              title="View on explorer"
                            >
                              <ExternalLink size={14} className="text-white/60" />
                            </MainButton>
                          </div>
                        </div>
                      </div>

                      {/* Chain Info */}
                      <div className="p-4 border-b border-white/10">
                        <button
                          onClick={disabled ? undefined : openChainModal}
                          disabled={disabled}
                          className="flex items-center justify-between w-full hover:bg-white/5 p-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {chain.hasIcon && chain.iconUrl && (
                              <div
                                className="w-5 h-5 rounded-full overflow-hidden"
                                style={{ background: chain.iconBackground }}
                              >
                                <img
                                  alt={chain.name ?? "Chain icon"}
                                  src={chain.iconUrl}
                                  className="w-5 h-5"
                                />
                              </div>
                            )}
                            <div className="text-left">
                              <p className="text-white/60 text-xs">Network</p>
                              <p className="text-white text-sm font-medium">
                                {chain.name}
                              </p>
                            </div>
                          </div>
                          <ChevronDown
                            size={14}
                            className="text-white/60 -rotate-90"
                          />
                        </button>
                      </div>

                      {userMenuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                item.action()
                                setIsDropdownOpen(false);
                            }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black-300 transition-colors ${index === 0
                                ? 'rounded-t-lg'
                                : ''} ${index === userMenuItems.length - 1
                                    ? 'rounded-b-lg'
                                    : 'border-b border-white/10'} text-white`}>
                                {item.icon}
                                <span className="text-sm">{item.label}</span>
                            </button>
                        ))}

                      {/* Actions */}
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
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};