import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, usePublicClient } from 'wagmi';
import { QUIVA_COMICS_ABI, QUIVA_MARKETPLACE_ABI, QUIVA_COMICS_ADDRESS, QUIVA_MARKETPLACE } from '../contracts/QuivaComics';
import { mainnet } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';
import { parseEther, decodeEventLog, Address, parseUnits } from 'viem';
import axiosInstance from '../redux/axios-instance';
import { addDecimalsToPrice } from '@/lib/formatedPrice';

interface ComicData {
  title: string;
  description: string;
  genre: string[];
  tags: string[];
  ageRating: string;
  coverImage: File | null;
  pages: any[];
}

interface MonetizationData {
  publishType: 'free' | 'paid';
  price?: number;
  mintAsNFT: boolean;
  nftCopies?: number;
  nftPrice?: number;
}

interface User {
  _id: string;
  email: string;
  walletAddress?: string;
}

interface PublishComicParams {
  comicData: ComicData;
  monetizationData: MonetizationData;
  user: User;
}

interface ApprovalStatus {
  isChecking: boolean;
  isApproving: boolean;
  isApproved: boolean;
  error: string | null;
}

type ListingStep = 'idle' | 'approving' | 'listing' | 'complete' | 'error';

const hederaTestnet = {
  id: 296,
  name: 'HederaTestnet',
  nativeCurrency: { name: 'Hedera Testnet', symbol: 'HBAR', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet/home' },
  },
} as const satisfies Chain;

export const useComicMinting = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  
  // Main state
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mintingProgress, setMintingProgress] = useState(0);
  const [mintError, setMintError] = useState<Error | null>(null);
  const [tokenId, setTokenId] = useState<bigint | null>(null);
  const [sellerAddress, setSellerAddress] = useState<string | null>(null);
  const [pricePerToken, setPricePerToken] = useState<number | null>(null);
  const [comicId, setComicId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [savedMonetizationData, setSavedMonetizationData] = useState<MonetizationData | null>(null);
  
  // Approval and listing state
  const [listingStep, setListingStep] = useState<ListingStep>('idle');
  const [isApprovingMarketplace, setIsApprovingMarketplace] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>({
    isChecking: false,
    isApproving: false,
    isApproved: false,
    error: null,
  });

  // Wagmi hooks for NFT minting
  const { 
    data: mintHash, 
    writeContract: mintContract, 
    error: mintWriteError,
    isPending: isMintWritePending 
  } = useWriteContract();

  const { 
    isLoading: isMintConfirming, 
    isSuccess: isMintSuccess, 
    data: mintReceipt
  } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  // Wagmi hooks for marketplace approval
  const {
    data: approveHash,
    writeContract: approveContract,
    error: approveWriteError,
    isPending: isApproveWritePending
  } = useWriteContract();

  const { 
    isLoading: isApproveConfirming, 
    isSuccess: isApproveSuccess, 
    data: approveReceipt
  } = useWaitForTransactionReceipt({
    hash: approveHash
  });

  // Wagmi hooks for marketplace listing
  const {
    data: listHash,
    writeContract: listContract,
    error: listWriteError,
    isPending: isListWritePending
  } = useWriteContract();

  const { 
    isLoading: isListConfirming, 
    isSuccess: isListSuccess, 
    data: listReceipt
  } = useWaitForTransactionReceipt({
    hash: listHash
  });

  // Monitor mint transaction status
  useEffect(() => {
    if (mintHash) {
      console.log('🔗 Mint transaction hash received:', mintHash);
      console.log('⏳ Waiting for mint confirmation...');
      setMintingProgress(70);
    }
  }, [mintHash]);

  // Monitor approve transaction status
  useEffect(() => {
    if (approveHash) {
      console.log('🔗 Approve transaction hash received:', approveHash);
      setMintingProgress(75);
    }
  }, [approveHash]);

  // Monitor list transaction status
  useEffect(() => {
    if (listHash) {
      console.log('🔗 List transaction hash received:', listHash);
      setMintingProgress(85);
    }
  }, [listHash]);

  // Extract token ID from mint transaction receipt
  useEffect(() => {
    const extractTokenId = async () => {
      if (isMintSuccess && mintReceipt && !tokenId) {
        console.log('📄 Mint transaction receipt received:', mintReceipt);

        try {
          const mintedLog = mintReceipt.logs.find((log) => {
            try {
              const decoded = decodeEventLog({
                abi: QUIVA_COMICS_ABI,
                data: log.data,
                topics: log.topics,
              });
              return (decoded as any).eventName === 'NFTMinted';
            } catch {
              return false;
            }
          });

          if (mintedLog) {
            const decoded = decodeEventLog({
              abi: QUIVA_COMICS_ABI,
              data: mintedLog.data,
              topics: mintedLog.topics,
            });

            if ((decoded as any).eventName === 'NFTMinted') {
              const decodedEvent = decoded as { eventName: string; args: { tokenId: bigint } };
              const extractedTokenId = decodedEvent.args.tokenId;
              const extractedCreator = (decodedEvent.args as any).creator;
              console.log('✅ Token ID extracted from event:', extractedTokenId.toString());
              console.log('✅ Creator address extracted from event:', extractedCreator);
              setTokenId(extractedTokenId);
              return;
            }
          }

          console.warn('⚠️ Could not extract token ID from receipt');
        } catch (error) {
          console.error('❌ Error extracting token ID:', error);
          setMintError(new Error('Failed to extract token ID from transaction'));
        }
      }
    };

    extractTokenId();
  }, [isMintSuccess, mintReceipt, tokenId]);

  // Handle approval completion
  useEffect(() => {
    if (isApproveSuccess && approveReceipt) {
      console.log('✅ Marketplace approval confirmed');
      setListingStep('listing');
      setIsApprovingMarketplace(false);
      // The listing will be triggered by the main effect
    }
  }, [isApproveSuccess, approveReceipt]);

  // Handle listing completion
  useEffect(() => {
    if (isListSuccess && listReceipt) {
      console.log('✅ NFT listing confirmed');
      setListingStep('complete');
      setIsListing(false);
      setMintingProgress(90);
    }
  }, [isListSuccess, listReceipt]);

  // Main effect to handle post-mint operations
  useEffect(() => {
    const handlePostMintOperations = async () => {
      if (
        isMintSuccess && 
        mintHash && 
        comicId && 
        tokenId && 
        !isComplete && 
        savedMonetizationData && 
        address &&
        listingStep === 'idle'
      ) {
        console.log('✅ NFT minted successfully!');
        console.log('🔗 Transaction hash:', mintHash);
        console.log('🎫 Token ID:', tokenId.toString());
        
        try {
          // Check if we need to list on marketplace
          if (savedMonetizationData.mintAsNFT && savedMonetizationData.nftPrice) {
            console.log('📋 Starting marketplace listing process...');
            setIsListing(true);
            setListingStep('approving');
            setIsApprovingMarketplace(true);
            
            const currentChain = chainId === 296 ? hederaTestnet : mainnet;
            const pricePerToken = BigInt(savedMonetizationData.nftPrice || 0);
            const amountToList = BigInt(savedMonetizationData.nftCopies || 100);
            
            console.log('📋 Listing parameters:', {
              tokenId: tokenId.toString(),
              amount: amountToList.toString(),
              pricePerToken: pricePerToken.toString(),
            });

            // Step 1: Approve marketplace to spend NFTs
            console.log('📋 Step 1: Approving marketplace...');
            await approveContract({
              address: QUIVA_COMICS_ADDRESS,
              abi: QUIVA_COMICS_ABI,
              functionName: 'setApprovalForAll',  
              args: [QUIVA_MARKETPLACE, true],
              account: address,
              chain: currentChain
            });

            // Note: The actual listing will happen in the approval success effect
            
          } else {
            // No marketplace listing needed, go straight to backend update
            setListingStep('complete');
          }
          
        } catch (error) {
          console.error('⚠️ Error in post-mint operations:', error);
          setListingStep('error');
          setIsListing(false);
          setIsApprovingMarketplace(false);
          // Don't throw - minting succeeded, user can list manually later
        }
      }
    };

    handlePostMintOperations();
  }, [
    isMintSuccess, 
    mintHash, 
    comicId, 
    tokenId, 
    isComplete, 
    savedMonetizationData, 
    address, 
    listingStep,
    chainId,
    approveContract
  ]);

  // Handle marketplace listing after approval
  useEffect(() => {
    const performListing = async () => {
      if (
        listingStep === 'listing' && 
        tokenId && 
        savedMonetizationData && 
        address &&
        isApproveSuccess
      ) {
        try {
          console.log('📋 Step 2: Listing NFT on marketplace...');
          
          const currentChain = chainId === 296 ? hederaTestnet : mainnet;
          const pricePerToken = BigInt(savedMonetizationData.nftPrice || 0);
          const amountToList = BigInt(savedMonetizationData.nftCopies || 100);

          await listContract({
            address: QUIVA_MARKETPLACE,
            abi: QUIVA_MARKETPLACE_ABI,
            functionName: 'listItem',
            args: [
              QUIVA_COMICS_ADDRESS,
              tokenId,
              amountToList,
              BigInt(addDecimalsToPrice(pricePerToken.toString())),
            ],
            account: address,
            chain: currentChain,
          });

          console.log('✅ Listing transaction sent');
          
        } catch (listingError) {
          console.error('❌ Listing failed:', listingError);
          setListingStep('error');
          setIsListing(false);
          setMintError(listingError as Error);
        }
      }
    };

    performListing();
  }, [
    listingStep, 
    tokenId, 
    savedMonetizationData, 
    address, 
    isApproveSuccess,
    chainId,
    listContract
  ]);

  // Final backend update after everything is complete
  useEffect(() => {
    const finalizeProcess = async () => {
      if (
        (listingStep === 'complete' || (listingStep === 'idle' && isMintSuccess)) &&
        comicId && 
        tokenId && 
        !isComplete
      ) {
        try {
          console.log('💾 Updating backend with mint data...');
          await updateComicWithMintData(comicId, tokenId);
          setMintingProgress(100);
          setIsMinting(false);
          setIsComplete(true);
          console.log('🎉 All operations completed successfully!');
        } catch (error) {
          console.error('❌ Error updating backend:', error);
          setMintError(error as Error);
        }
      }
    };

    finalizeProcess();
  }, [listingStep, comicId, tokenId, isComplete, isMintSuccess]);

  // Monitor write errors
  useEffect(() => {
    if (mintWriteError) {
      console.error('❌ Mint contract error:', mintWriteError);
      setMintError(mintWriteError as Error);
      setIsMinting(false);
      setMintingProgress(0);
      setListingStep('error');
    }
  }, [mintWriteError]);

  useEffect(() => {
    if (approveWriteError) {
      console.error('❌ Approve contract error:', approveWriteError);
      setMintError(approveWriteError as Error);
      setIsListing(false);
      setIsApprovingMarketplace(false);
      setListingStep('error');
    }
  }, [approveWriteError]);

  useEffect(() => {
    if (listWriteError) {
      console.error('❌ List contract error:', listWriteError);
      setMintError(listWriteError as Error);
      setIsListing(false);
      setListingStep('error');
    }
  }, [listWriteError]);

  // Monitor confirmation status
  useEffect(() => {
    if (isMintConfirming) {
      console.log('⏳ Mint transaction confirming...');
      setMintingProgress(80);
    }
  }, [isMintConfirming]);

  useEffect(() => {
    if (isApproveConfirming) {
      console.log('⏳ Approve transaction confirming...');
    }
  }, [isApproveConfirming]);

  useEffect(() => {
    if (isListConfirming) {
      console.log('⏳ List transaction confirming...');
    }
  }, [isListConfirming]);

  /**
   * Check if the connected wallet is an approved creator
   */
  const checkCreatorApproval = async (): Promise<boolean> => {
    if (!address) return false;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get(`creators/check-approval/${address}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data.isApproved;
    } catch (error) {
      console.error('Error checking creator approval:', error);
      return false;
    }
  };

  /**
   * Request creator approval from backend
   */
  const requestCreatorApproval = async (): Promise<boolean> => {
    if (!address) return false;
    
    try {
      console.log('🔍 Requesting creator approval...');
      const token = localStorage.getItem('token');
      const response = await axiosInstance.post(
        '/creators/approve-creator',
        { creatorAddress: address },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('✅ Creator approval successful:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Error requesting creator approval:', error);
      return false;
    }
  };

  /**
   * Main function to publish comic and optionally mint NFT
   */
  const publishComic = async ({
    comicData,
    monetizationData,
    user,
  }: PublishComicParams) => {
    try {
      // Reset states
      setIsComplete(false);
      setTokenId(null);
      setComicId(null);
      setMintError(null);
      setListingStep('idle');
      
      // Save monetization data for later use in listing
      setSavedMonetizationData(monetizationData);
      
      setIsUploading(true);
      setUploadProgress(10);

      // Step 1: Create FormData for backend upload
      const formData = new FormData();

      // Add cover image if exists
      if (comicData.coverImage) {
        if (comicData.coverImage instanceof File) {
          formData.append('coverImage', comicData.coverImage);
        } else {
          const coverFile = new File(
            [comicData.coverImage],
            'cover.jpg',
            { type: (comicData.coverImage as Blob).type || 'image/jpeg' }
          );
          formData.append('coverImage', coverFile);
        }
      }

      // Add page images
      comicData.pages.forEach((page, index) => {
        if (page.blob) {
          const fileName = page.name || `page-${index + 1}.jpg`;
          const file = new File(
            [page.blob], 
            fileName, 
            { type: page.blob.type || 'image/jpeg' }
          );
          formData.append('pages', file);
        }
      }); 

      // Prepare comic data
      const comicPayload = {
        title: comicData.title,
        description: comicData.description,
        genre: comicData.genre,
        tags: comicData.tags,
        publishType: monetizationData.mintAsNFT ? 'nft' : monetizationData.publishType,
      };

      // Add NFT details if minting
      if (monetizationData.mintAsNFT) {
        (comicPayload as any).nftDetails = {
          price: monetizationData.nftPrice || 0,
          maxSupply: monetizationData.nftCopies || 100,
          royaltyPercentage: 10, // Default 10% royalty
        };
      }

      formData.append('comicData', JSON.stringify(comicPayload));
      setUploadProgress(30);

      // Step 2: Upload to backend (which handles IPFS upload and metadata generation)
      const token = localStorage.getItem('token');
      const response = await axiosInstance.post(
        '/comics/full',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 70) / progressEvent.total);
              setUploadProgress(30 + progress);
            }
          },
        }
      );

      setUploadProgress(100);
      setIsUploading(false);

      const createdComic = response.data.data.comic;
      const metadataCid = createdComic.nftMetadataCid;
      const dbComicId = createdComic._id;

      setComicId(dbComicId);

      console.log('✅ Comic created:', createdComic);
      console.log('📦 Metadata CID:', metadataCid);

      // Step 3: If NFT minting is enabled, interact with smart contract
      if (monetizationData.mintAsNFT && metadataCid && isConnected && address) {
        setIsMinting(true);
        setMintingProgress(10);
        
        // Check and request creator approval
        console.log('🔍 Checking creator approval status...');
        const isApproved = await checkCreatorApproval();
        if (!isApproved) {
          console.log('⚠️ Creator not approved. Requesting approval...');
          setMintingProgress(15);
          
          const approvalSuccess = await requestCreatorApproval();
          
          if (!approvalSuccess) {
            throw new Error('Failed to get creator approval. Please contact support.');
          }
          console.log('✅ Creator approved successfully!');
          // Wait for blockchain to process approval
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          console.log('✅ Creator already approved');
        }
        
        setMintingProgress(20);
        const currentChain = chainId === 296 ? hederaTestnet : mainnet;

        // Construct IPFS gateway URL for metadata
        const metadataURI = `https://jade-major-lobster-143.mypinata.cloud/ipfs/${metadataCid}`;

        // Prepare minting parameters
        const maxSupply = BigInt(monetizationData.nftCopies || 100);

        setMintingProgress(30);

        console.log('📄 Minting NFT with params:', {
          comicId: dbComicId,
          metadataURI,
          maxSupply: maxSupply.toString(),
          contractAddress: QUIVA_COMICS_ADDRESS,
          currentChain: currentChain,
        });

        try {
          console.log('🎨 Minting NFT...');
          await mintContract({
            address: QUIVA_COMICS_ADDRESS,
            abi: QUIVA_COMICS_ABI,
            functionName: 'mintComic',
            args: [metadataURI, maxSupply],
            account: address,
            chain: currentChain,
          });

          console.log('✅ Mint transaction sent, waiting for confirmation...');
          setMintingProgress(60);
          
        } catch (contractError) {
          console.error('❌ Contract write error:', contractError);
          throw contractError;
        }
      } else {
        console.log('⚠️ Skipping NFT minting:', {
          reason: !monetizationData.mintAsNFT ? 'mintAsNFT is false' :
                  !metadataCid ? 'No metadata CID' :
                  !isConnected ? 'Wallet not connected' :
                  !address ? 'No wallet address' : 'Unknown'
        });
        // If not minting NFT, mark as complete immediately
        setIsComplete(true);
      }

      return {
        success: true,
        comic: createdComic,
        metadataCid,
        requiresMinting: monetizationData.mintAsNFT && !mintHash,
      };
    } catch (error: any) {
      console.error('❌ Error publishing comic:', error);
      setMintError(error);
      throw error;
    } finally {
      setIsUploading(false);
      if (!mintWriteError) {
        setIsMinting(false);
      }
    }
  };

  /**
   * Update backend with minting results
   */
  const updateComicWithMintData = async (
    comicId: string,
    tokenId: bigint,
  ) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(
        `/comics/token/${comicId}`,
        {
          tokenId: tokenId.toString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ Comic updated with tokenId data');
    } catch (error) {
      console.error('❌ Error updating comic with tokenId data:', error);
      throw error;
    }
  };
  
  /**
   * Reset all states
   */
  const reset = () => {
    setIsUploading(false);
    setIsMinting(false);
    setIsListing(false);
    setUploadProgress(0);
    setMintingProgress(0);
    setMintError(null);
    setTokenId(null);
    setComicId(null);
    setIsComplete(false);
    setSavedMonetizationData(null);
    setListingStep('idle');
    setIsApprovingMarketplace(false);
    setApprovalStatus({
      isChecking: false,
      isApproving: false,
      isApproved: false,
      error: null,
    });
  };

  return {
    // Main functions
    publishComic,
    updateComicWithMintData,
    reset,
    
    // Upload states
    isUploading,
    uploadProgress,
    
    // Minting states
    isMinting,
    mintingProgress,
    isMintWritePending,
    isMintConfirming,
    isMintSuccess,
    
    // Listing states
    isListing,
    listingStep,
    isApprovingMarketplace,
    isApproveWritePending,
    isApproveConfirming,
    isApproveSuccess,
    isListWritePending,
    isListConfirming,
    isListSuccess,
    
    // Completion states
    isComplete,
    
    // Results
    tokenId,
    sellerAddress,
    pricePerToken,
    mintHash,
    approveHash,
    listHash,
    comicId,
    
    // Errors
    mintError: mintWriteError || approveWriteError || listWriteError || mintError,
    
    // Legacy compatibility
    isWritePending: isMintWritePending,
    isConfirming: isMintConfirming,
    
    // Wallet status
    walletStatus: {
      isConnected,
      address,
      chainId,
    },
    
    // Setters (for advanced usage)
    setTokenId,
  };
};