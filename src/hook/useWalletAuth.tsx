import { useAccount, useSignMessage } from "wagmi";
import { useWallet, useEvmAddress, useAuthSignature, UserRefusedToSignAuthError } from '@buidlerlabs/hashgraph-react-wallets';
import { HashpackConnector } from '@buidlerlabs/hashgraph-react-wallets/connectors';
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { getAddress } from "viem";
import { walletAuth, walletVerifyAuth } from "@/redux/slices/walletSlice";
import { getUserProfile } from "@/redux/slices/authSlice";

export enum WalletType {
  ETHEREUM = 'ethereum',
  HEDERA = 'hedera'
}

export function useWalletAuth() {
  // Ethereum/Rainbow wallet hooks
  const { address: ethAddress, isConnected: isEthConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  
  // Hedera/HashPack wallet hooks
  const { isConnected: isHederaConnected } = useWallet(HashpackConnector);
  const { data: hederaEvmAddress } = useEvmAddress();
  const { signAuth } = useAuthSignature();
  
  const dispatch = useDispatch<AppDispatch>();

  // Determine which wallet is currently connected
  const getConnectedWallet = () => {
    if (isEthConnected && ethAddress) {
      return {
        type: WalletType.ETHEREUM,
        address: ethAddress,
        isConnected: isEthConnected
      };
    } else if (isHederaConnected && hederaEvmAddress) {
      return {
        type: WalletType.HEDERA,
        address: hederaEvmAddress,
        isConnected: isHederaConnected
      };
    }
    return null;
  };

  const loginWithEthereumWallet = async (walletAddress: string) => {
    try {
      const checksummedAddress = getAddress(walletAddress) as `0x${string}`;

      // Get message to sign from backend
      const msgRes = await dispatch(walletAuth({ walletAddress: checksummedAddress })).unwrap();
      const message = msgRes.message;

      // Sign the message with user's wallet
      const signature = await signMessageAsync({
        message,
        account: checksummedAddress,
      });

      // Verify signature with backend
      const verifyRes = await dispatch(
        walletVerifyAuth({ 
          walletAddress: checksummedAddress, 
          message, 
          signature 
        })
      ).unwrap();

      if (verifyRes.accessToken) {
        localStorage.setItem("token", verifyRes.accessToken);
      }

      if (verifyRes.user) {
        dispatch(getUserProfile(verifyRes.user._id));
      }

      return verifyRes.user;
    } catch (error) {
      console.error("Ethereum wallet authentication failed:", error);
      throw error;
    }
  };

  const loginWithHederaWallet = async (evmAddress: string) => {
    try {
      // Use the same backend APIs as Ethereum since we're using EVM addresses
      const checksummedAddress = getAddress(evmAddress) as `0x${string}`;

      // Get message to sign from backend (same API as Ethereum)
      const msgRes = await dispatch(walletAuth({ walletAddress: checksummedAddress })).unwrap();
      const message = msgRes.message;

      // HashPack signing using useAuthSignature hook
      const signature = await signHederaMessage(message) as `0x${string}`;

      // Verify signature with backend (same API as Ethereum)
      const verifyRes = await dispatch(
        walletVerifyAuth({ 
          walletAddress: checksummedAddress, 
          message, 
          signature
        })
      ).unwrap();

      if (verifyRes.accessToken) {
        localStorage.setItem("token", verifyRes.accessToken);
      }

      if (verifyRes.user) {
        dispatch(getUserProfile(verifyRes.user._id));
      }

      return verifyRes.user;
    } catch (error) {
      console.error("Hedera wallet authentication failed:", error);
      throw error;
    }
  };

  // Helper function for Hedera message signing using useAuthSignature
  const signHederaMessage = async (message: string): Promise<any> => {
    try {
      const signerSignature = await signAuth(message);
      return signerSignature;
    } catch (error) {
      if (error instanceof UserRefusedToSignAuthError) {
        throw new Error("User rejected the signature request");
      }
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
    connectedWalletType: getConnectedWallet()?.type || null
  };
}