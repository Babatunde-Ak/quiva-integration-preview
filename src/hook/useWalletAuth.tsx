'use client';

import { useAccount, useSignMessage } from "wagmi";
// import { useWallet, useEvmAddress, useAuthSignature, UserRefusedToSignAuthError } from '@buidlerlabs/hashgraph-react-wallets';
// import {  HashpackConnector } from '@buidlerlabs/hashgraph-react-wallets/connectors';
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { getAddress } from "viem";
import { walletAuth, walletVerifyAuth, setAuthenticated } from "@/redux/slices/walletSlice";
import { getUserProfile } from "@/redux/slices/authSlice";
import { useState, useEffect } from "react";
import { useHederaWallet } from '@/providers/HashPackProvider';
import { AccountId } from "@hiero-ledger/sdk";
export enum WalletType {
  ETHEREUM = 'ethereum',
  HEDERA = 'hedera'
}

export function useWalletAuth() {
  // Ethereum/Rainbow wallet hooks
  const { address: ethAddress, isConnected: isEthConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [signature, setSignature] = useState({});
  
  // Hedera/HashPack wallet hooks
  // const { isConnected: isHederaConnected } = useWallet( HashpackConnector);
   const { isConnected: isHederaConnected, account, signMessage } = useHederaWallet();
  // const { data: hederaEvmAddress } = useEvmAddress();
  // const { signAuth } = useAuthSignature();

  useEffect(() => {
    const storedSignature = localStorage.getItem("signature");
    if (storedSignature) {
      setSignature(storedSignature);
    }
  }, []);
  
  const dispatch = useDispatch<AppDispatch>();

  // Determine which wallet is currently connected
  const getConnectedWallet = () => {
    if (isEthConnected && ethAddress) {
      return {
        type: WalletType.ETHEREUM,
        address: ethAddress,
        isConnected: isEthConnected
      };
    } else if (isHederaConnected && account) {
      return {
        type: WalletType.HEDERA,
        address: account,
        isConnected: isHederaConnected
      };
    }
    return null;
  };

  const loginWithEthereumWallet = async (walletAddress: string) => {
    try {
      const checksummedAddress = getAddress(walletAddress) as `0x${string}`;

      const msgRes = await dispatch(walletAuth({ walletAddress: checksummedAddress })).unwrap();

      // Backend may return a token directly (no-signature flow)
      if ((msgRes as any).accessToken) {
        localStorage.setItem("authToken", (msgRes as any).accessToken);
        dispatch(setAuthenticated({
          accessToken: (msgRes as any).accessToken,
          refreshToken: (msgRes as any).refreshToken,
          user: (msgRes as any).user,
        }));
        if ((msgRes as any).user) dispatch(getUserProfile((msgRes as any).user._id));
        return (msgRes as any).user;
      }

      const message = msgRes.message;
      if (!message) throw new Error("Backend did not return a message to sign");

      const signature = await signMessageAsync({ message, account: checksummedAddress });
      setSignature(signature);

      const verifyRes = await dispatch(
        walletVerifyAuth({ walletAddress: checksummedAddress, message, signature })
      ).unwrap();

      if (verifyRes.user) dispatch(getUserProfile(verifyRes.user._id));
      return verifyRes.user;
    } catch (error) {
      console.error("Ethereum wallet authentication failed:", error);
      throw error;
    }
  };

  const loginWithHederaWallet = async (evmAddress: string) => {
    try {
      let convertedAddress = evmAddress;
      if (!evmAddress.startsWith("0x")) {
        try {
          convertedAddress = `0x${AccountId.fromString(evmAddress).toEvmAddress()}`;
        } catch (err) {
          console.error("Failed to convert Hedera account to EVM address:", err);
          throw new Error("Invalid Hedera account format");
        }
      }

      const checksummedAddress = getAddress(convertedAddress) as `0x${string}`;
      const msgRes = await dispatch(walletAuth({ walletAddress: checksummedAddress })).unwrap();

      // Backend may return a token directly (no-signature flow)
      if ((msgRes as any).accessToken) {
        localStorage.setItem("authToken", (msgRes as any).accessToken);
        dispatch(setAuthenticated({
          accessToken: (msgRes as any).accessToken,
          refreshToken: (msgRes as any).refreshToken,
          user: (msgRes as any).user,
        }));
        if ((msgRes as any).user) dispatch(getUserProfile((msgRes as any).user._id));
        return (msgRes as any).user;
      }

      const message = msgRes.message;
      if (!message) throw new Error("Backend did not return a message to sign");

      const signature = await signHederaMessage(message) as `0x${string}`;

      const verifyRes = await dispatch(
        walletVerifyAuth({ walletAddress: checksummedAddress, message, signature })
      ).unwrap();

      if (verifyRes.user) dispatch(getUserProfile(verifyRes.user._id));
      return verifyRes.user;
    } catch (error) {
      console.error("Hedera wallet authentication failed:", error);
      throw error;
    }
  };

  // Helper function for Hedera message signing using useAuthSignature
  const signHederaMessage = async (message: string): Promise<any> => {
    try {
      const signerSignature = await signMessage(message);
      setSignature(signerSignature);
      return signerSignature;
    } catch (error) {
      console.error("Failed to sign message with HashPack:", error);
      throw new Error("Failed to sign message with HashPack");
    }
  };

  const loginWithWallet = async () => {
    const connectedWallet = getConnectedWallet();
    
    if (!connectedWallet) {
      throw new Error("No wallet connected");
    }

    try {
      switch (connectedWallet.type) {
        case WalletType.ETHEREUM:
          return await loginWithEthereumWallet(connectedWallet.address);
        
        case WalletType.HEDERA:
          return await loginWithHederaWallet(connectedWallet.address);
        
        default:
          throw new Error("Unsupported wallet type");
      }
    } catch (error) {
      console.error("Wallet authentication failed:", error);
      throw error;
    }
  };

  // Get current wallet info
  const getCurrentWallet = () => {
    return getConnectedWallet();
  };

  // Check if any wallet is connected
  const isAnyWalletConnected = () => {
    return isEthConnected || isHederaConnected;
  };

  // Get current wallet address (regardless of type)
  const getCurrentAddress = () => {
    const wallet = getConnectedWallet();
    return wallet?.address || null;
  };

  return { 
    loginWithWallet,
    loginWithEthereumWallet,
    loginWithHederaWallet,
    getCurrentWallet,
    isAnyWalletConnected,
    getCurrentAddress,
    connectedWalletType: getConnectedWallet()?.type || null,
    signature
  };
}

// 'use client';

// import { useAccount, useSignMessage } from "wagmi";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/redux/store";
// import { getAddress } from "viem";
// import { walletAuth, walletVerifyAuth, setAuthenticated } from "@/redux/slices/walletSlice";
// import { getUserProfile } from "@/redux/slices/authSlice";
// import { useState, useEffect } from "react";
// import { useHederaWallet } from "@/providers/HashPackProvider"; // ✅ NEW IMPORT

// export enum WalletType {
//   ETHEREUM = 'ethereum',
//   HEDERA = 'hedera'
// }

// export function useWalletAuth() {
//   // ✅ Ethereum (RainbowKit)
//   const { address: ethAddress, isConnected: isEthConnected } = useAccount();
//   const { signMessageAsync } = useSignMessage();

//   // ✅ Hedera (Hashinals Wallet)
//   const { account: hederaAccount, isConnected: isHederaConnected, signMessage } = useHederaWallet();

//   const [signature, setSignature] = useState<any>({});
//   const dispatch = useDispatch<AppDispatch>();

//   useEffect(() => {
//     const storedSignature = localStorage.getItem("signature");
//     if (storedSignature) setSignature(storedSignature);
//   }, []);

//   // ✅ Determine which wallet is currently connected
//   const getConnectedWallet = () => {
//     if (isEthConnected && ethAddress) {
//       return {
//         type: WalletType.ETHEREUM,
//         address: ethAddress,
//         isConnected: true
//       };
//     } else if (isHederaConnected && hederaAccount) {
//       return {
//         type: WalletType.HEDERA,
//         address: hederaAccount,
//         isConnected: true
//       };
//     }
//     return null;
//   };

//   // ✅ Ethereum Wallet Authentication
//   const loginWithEthereumWallet = async (walletAddress: string) => {
//     try {
//       const checksummedAddress = getAddress(walletAddress) as `0x${string}`;

//       // Request sign-in message from backend
//       const msgRes = await dispatch(walletAuth({ walletAddress: checksummedAddress })).unwrap();
//       const message = msgRes.message;

//       // Ask user to sign the message
//       const signature = await signMessageAsync({
//         message,
//         account: checksummedAddress,
//       });

//       setSignature(signature);
//       localStorage.setItem("signature", signature);

//       // Verify with backend
//       const verifyRes = await dispatch(
//         walletVerifyAuth({
//           walletAddress: checksummedAddress,
//           message,
//           signature
//         })
//       ).unwrap();

//       if (verifyRes.accessToken) localStorage.setItem("token", verifyRes.accessToken);
//       if (verifyRes.user) dispatch(getUserProfile(verifyRes.user._id));

//       return verifyRes.user;
//     } catch (error) {
//       console.error("Ethereum wallet authentication failed:", error);
//       throw error;
//     }
//   };

//   // ✅ Hedera Wallet Authentication (using Hashinals SDK)
//   const loginWithHederaWallet = async (walletAddress: string) => {
//     try {
//       const checksummedAddress = getAddress(walletAddress) as `0x${string}`;

//       // Get sign-in message from backend
//       const msgRes = await dispatch(walletAuth({ walletAddress: checksummedAddress })).unwrap();
//       const message = msgRes.message;

//       // Request signature from Hashinals Wallet
//       if (!sdk) throw new Error("Hashinals SDK not initialized");
//       const signature = await sdk.signMessage(message);

//       setSignature(signature);
//       localStorage.setItem("signature", signature);

//       // Verify with backend
//       const verifyRes = await dispatch(
//         walletVerifyAuth({
//           walletAddress: checksummedAddress,
//           message,
//           signature
//         })
//       ).unwrap();

//       if (verifyRes.accessToken) localStorage.setItem("token", verifyRes.accessToken);
//       if (verifyRes.user) dispatch(getUserProfile(verifyRes.user._id));

//       return verifyRes.user;
//     } catch (error) {
//       console.error("Hedera wallet authentication failed:", error);
//       throw error;
//     }
//   };

//   // ✅ Unified Login
//   const loginWithWallet = async () => {
//     const connectedWallet = getConnectedWallet();
//     if (!connectedWallet) throw new Error("No wallet connected");

//     try {
//       switch (connectedWallet.type) {
//         case WalletType.ETHEREUM:
//           return await loginWithEthereumWallet(connectedWallet.address);
//         case WalletType.HEDERA:
//           return await loginWithHederaWallet(connectedWallet.address);
//         default:
//           throw new Error("Unsupported wallet type");
//       }
//     } catch (error) {
//       console.error("Wallet authentication failed:", error);
//       throw error;
//     }
//   };

//   // ✅ Utility Functions
//   const getCurrentWallet = () => getConnectedWallet();
//   const isAnyWalletConnected = () => isEthConnected || isHederaConnected;
//   const getCurrentAddress = () => getConnectedWallet()?.address || null;

//   return {
//     loginWithWallet,
//     loginWithEthereumWallet,
//     loginWithHederaWallet,
//     getCurrentWallet,
//     isAnyWalletConnected,
//     getCurrentAddress,
//     connectedWalletType: getConnectedWallet()?.type || null,
//     signature
//   };
// }


// 'use client';

// import { useAccount, useSignMessage } from 'wagmi';
// import { useDispatch } from 'react-redux';
// import { AppDispatch } from '@/redux/store';
// import { getAddress } from 'viem';
// import { walletAuth, walletVerifyAuth } from '@/redux/slices/walletSlice';
// import { getUserProfile } from '@/redux/slices/authSlice';
// import { useState, useEffect } from 'react';
// import { useHederaWallet } from '@/providers/HashPackProvider';

// export enum WalletType {
//   ETHEREUM = 'ethereum',
//   HEDERA = 'hedera',
// }

// export function useWalletAuth() {
//   const { address: ethAddress, isConnected: isEthConnected } = useAccount();
//   const { signMessageAsync } = useSignMessage();
//   const { isConnected: isHederaConnected, account, signMessage } = useHederaWallet();
//   const dispatch = useDispatch<AppDispatch>();
//   const [signature, setSignature] = useState<any>(null);

//   const getConnectedWallet = () => {
//     if (isEthConnected && ethAddress)
//       return { type: WalletType.ETHEREUM, address: ethAddress };
//     if (isHederaConnected && account)
//       return { type: WalletType.HEDERA, address: account };
//     return null;
//   };

//   const loginWithEthereumWallet = async (walletAddress: string) => {
//     const checksummed = getAddress(walletAddress) as `0x${string}`;
//     const msgRes = await dispatch(walletAuth({ walletAddress: checksummed })).unwrap();
//     const message = msgRes.message;
//     const signature = await signMessageAsync({ message, account: checksummed });

//     const verifyRes = await dispatch(
//       walletVerifyAuth({ walletAddress: checksummed, message, signature }),
//     ).unwrap();

//     if (verifyRes.accessToken) localStorage.setItem('token', verifyRes.accessToken);
//     if (verifyRes.user) dispatch(getUserProfile(verifyRes.user._id));

//     setSignature(signature);
//     return verifyRes.user;
//   };

//   const loginWithHederaWallet = async (walletAddress: string) => {
//     const checksummed = getAddress(walletAddress) as `0x${string}`;
//     const msgRes = await dispatch(walletAuth({ walletAddress: checksummed })).unwrap();
//     const message = msgRes.message;
//     const signature = await signMessage(message);
//     const verifyRes = await dispatch(
//       walletVerifyAuth({ walletAddress: checksummed, message, signature }),
//     ).unwrap();
    

//     if (verifyRes.accessToken) localStorage.setItem('token', verifyRes.accessToken);
//     if (verifyRes.user) dispatch(getUserProfile(verifyRes.user._id));

//     setSignature(signature);
//     return verifyRes.user;
//   };

//   const loginWithWallet = async () => {
//     const wallet = getConnectedWallet();
//     if (!wallet) throw new Error('No wallet connected');

//     return wallet.type === WalletType.ETHEREUM
//       ? loginWithEthereumWallet(wallet.address)
//       : loginWithHederaWallet(wallet.address);
//   };

//   return {
//     loginWithWallet,
//     loginWithEthereumWallet,
//     loginWithHederaWallet,
//     signature,
//     connectedWalletType: getConnectedWallet()?.type || null,
//   };
// }
