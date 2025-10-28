import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, usePublicClient, useReadContract } from 'wagmi';
import { QUIVA_FREE_COMICS_ADDRESS, QUIVA_FREE_COMICS_ABI } from '../contracts/QuivaComics';
import { mainnet } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';
import { decodeEventLog } from 'viem';
import axiosInstance from '../redux/axios-instance';

interface ComicData {
  title: string;
  description: string;
  genre: string[];
  tags: string[];
  ageRating: string;
  coverImage: File | null;
  pages: any[];
}

interface FreeComicData {
  maxSupply: number; // Maximum number of claims allowed
  royaltyPercentage?: number; // Optional royalty for future secondary sales
}

interface User {
  _id: string;
  email: string;
  walletAddress?: string;
}

interface PublishFreeComicParams {
  comicData: ComicData;
  freeComicData: FreeComicData;
  user: User;
}

interface ApprovalStatus {
  isChecking: boolean;
  isApproving: boolean;
  isApproved: boolean;
  error: string | null;
}

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

export const useFreeComicMinting = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  
  // State management
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mintingProgress, setMintingProgress] = useState(0);
  const [mintError, setMintError] = useState<Error | null>(null);
  const [tokenId, setTokenId] = useState<bigint | null>(null);
  const [comicId, setComicId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [savedFreeComicData, setSavedFreeComicData] = useState<FreeComicData | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>({
    isChecking: false,
    isApproving: false,
    isApproved: false,
    error: null,
  });

  // Wagmi hooks for contract interaction
  const { 
    data: hash, 
    writeContract, 
    error: writeError,
    isPending: isWritePending 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isMintSuccess, 
    data: receipt
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Read contract to check creator approval
  const { data: isCreatorApproved } = useReadContract({
    address: QUIVA_FREE_COMICS_ADDRESS,
    abi: QUIVA_FREE_COMICS_ABI,
    functionName: 'isApprovedCreator',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Monitor transaction status
  useEffect(() => {
    if (hash) {
      console.log('🔗 Free Comic Mint - Transaction hash received:', hash);
      console.log('⏳ Waiting for blockchain confirmation...');
      setMintingProgress(70);
    }
  }, [hash]);

  // Extract token ID from transaction receipt
  useEffect(() => {
    const extractTokenId = async () => {
      if (isMintSuccess && receipt && !tokenId) {
        console.log('📄 Free Comic Mint - Transaction receipt received:', receipt);

        try {
          // Parse logs for ComicMinted event
          const mintedLog = receipt.logs.find((log) => {
            try {
              const decoded = decodeEventLog({
                abi: QUIVA_FREE_COMICS_ABI,
                data: log.data,
                topics: log.topics,
              });
              return (decoded as any).eventName === 'ComicMinted';
            } catch {
              return false;
            }
          });

          if (mintedLog) {
            const decoded = decodeEventLog({
              abi: QUIVA_FREE_COMICS_ABI,
              data: mintedLog.data,
              topics: mintedLog.topics,
            });

            if ((decoded as any).eventName === 'ComicMinted') {
              const decodedEvent = decoded as { 
                eventName: string; 
                args: { 
                  tokenId: bigint;
                  creator: string;
                  comicId: string;
                  maxSupply: bigint;
                  isFree?: boolean;
                } 
              };
              const extractedTokenId = decodedEvent.args.tokenId;
              const extractedCreator = decodedEvent.args.creator;
              const isFreeComic = decodedEvent.args.isFree;
              
              console.log('✅ Token ID extracted from event:', extractedTokenId.toString());
              console.log('✅ Creator address:', extractedCreator);
              console.log('✅ Is Free Comic:', isFreeComic);
              
              setTokenId(extractedTokenId);
              return;
            }
          }

          // Fallback method
          if (publicClient && hash) {
            const transaction = await publicClient.getTransaction({ hash });
            console.log('📄 Transaction data:', transaction);
          }

          console.warn('⚠️ Could not extract token ID from receipt');
        } catch (error) {
          console.error('❌ Error extracting token ID:', error);
        }
      }
    };

    extractTokenId();
  }, [isMintSuccess, receipt, tokenId, publicClient, hash]);

  // Update backend after successful minting
  useEffect(() => {
    const updateBackend = async () => {
      if (isMintSuccess && hash && comicId && tokenId && !isComplete) {
        console.log('✅ Free Comic NFT minted successfully!');
        console.log('🔗 Transaction hash:', hash);
        console.log('🎫 Token ID:', tokenId.toString());
        setMintingProgress(85);
        
        try {
          console.log('💾 Updating backend with mint data...');
          await updateComicWithMintData(comicId, tokenId, hash);
          setMintingProgress(100);
          setIsMinting(false);
          setIsComplete(true);
          console.log('🎉 Free comic minted and ready for claiming!');
        } catch (error) {
          console.error('❌ Error updating backend:', error);
          setMintError(error as Error);
        }
      }
    };

    updateBackend();
  }, [isMintSuccess, hash, comicId, tokenId, isComplete]);

  // Monitor write errors
  useEffect(() => {
    if (writeError) {
      console.error('❌ Write contract error:', writeError);
      setMintError(writeError as Error);
      setIsMinting(false);
      setMintingProgress(0);
    }
  }, [writeError]);

  // Monitor confirmation status
  useEffect(() => {
    if (isConfirming) {
      console.log('⏳ Transaction confirming...');
      setMintingProgress(80);
    }
  }, [isConfirming]);

  /**
   * Check if current user is an approved creator
   */
  const checkCreatorApproval = async (): Promise<boolean> => {
    if (!address) {
      console.log('⚠️ No wallet address available');
      return false;
    }

    try {
      setApprovalStatus(prev => ({ ...prev, isChecking: true, error: null }));
      
      console.log('🔍 Checking creator approval for:', address);
       const token = localStorage.getItem('token');
            const response = await axiosInstance.get(`creators/check-free-approval/${address}`, 
      
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            
      const approved = response.data.isApproved as boolean;
      console.log('✅ Creator approval status:', approved);
      
      setApprovalStatus(prev => ({
        ...prev,
        isChecking: false,
        isApproved: approved,
      }));
      
      return approved;
    } catch (error) {
      console.error('❌ Error checking creator approval:', error);
      setApprovalStatus(prev => ({
        ...prev,
        isChecking: false,
        error: 'Failed to check creator approval',
      }));
      return false;
    }
  };

  /**
   * Request creator approval (users must contact admin)
   * This function informs the user about the approval process
   */
  const requestCreatorApproval = async (creatorAddress: string): Promise<boolean> => {
    setApprovalStatus(prev => ({ ...prev, isApproving: true, error: null }));
    
    try {
      console.log('✉️ Requesting creator approval for:', creatorAddress);
      const token = localStorage.getItem('token');
      const response = await axiosInstance.post('creators/approve-free-creator', 
        { creatorAddress: address },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // For now, we'll return false and let the user know they need approval
      
      
      return response.data.success as boolean;
    } catch (error) {
      console.error('❌ Error requesting creator approval:', error);
      setApprovalStatus(prev => ({
        ...prev,
        isApproving: false,
        error: 'Failed to request approval. Please try again.',
      }));
      return false;
    }
  };

  /**
   * Main function to publish a free comic
   */
  const publishFreeComic = async ({
    comicData,
    freeComicData,
    user,
  }: PublishFreeComicParams) => {
    try {
      console.log('🚀 Starting free comic publishing process...');
      
      // Validation
      if (!isConnected || !address) {
        throw new Error('Please connect your wallet to publish comics');
      }

      if (!user.walletAddress) {
        throw new Error('User wallet address not found');
      }

      // Save free comic data for later use
      setSavedFreeComicData(freeComicData);
      
      // Step 1: Upload comic data and create backend record
      setIsUploading(true);
      setUploadProgress(10);
      console.log('📤 Step 1: Uploading comic data to backend...');

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


      // Prepare comic payload with free comic specific data
      const comicPayload = {
        title: comicData.title,
        description: comicData.description,
        genre: comicData.genre,
        tags: comicData.tags,
        ageRating: comicData.ageRating,
        publishType: 'free', // Mark as free comic
        mintAsNFT: true, // We're minting as NFT
        isFree: true, // Explicitly mark as free
        nftDetails: {
          maxSupply: freeComicData.maxSupply,
          royaltyPercentage: freeComicData.royaltyPercentage || 10,
          isFree: true, // Free comic flag for backend
        },
      };

      formData.append('comicData', JSON.stringify(comicPayload));
      setUploadProgress(30);

      // Upload to backend (which handles IPFS upload and metadata generation)
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

      console.log('✅ Free comic created in database:', createdComic);
      console.log('📦 Metadata CID:', metadataCid);

      // Step 2: Mint NFT on blockchain
      if (!metadataCid) {
        throw new Error('Metadata CID not generated');
      }

      setIsMinting(true);
      setMintingProgress(10);
      
      // Check and request creator approval
      console.log('🔍 Checking creator approval status...');
      const isApproved = await checkCreatorApproval();
      
      if (!isApproved) {
        console.log('⚠️ Creator not approved. Requesting approval...');
        setMintingProgress(15);
        
        const approvalSuccess = await requestCreatorApproval(address);
        
        if (!approvalSuccess) {
          throw new Error(
            'Creator approval required. Please contact support to get approved before minting comics.'
          );
        }
        
        console.log('✅ Creator approved successfully!');
        // Wait for blockchain to process approval
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.log('✅ Creator already approved');
      }
      
      setMintingProgress(25);
      const currentChain = chainId === 296 ? hederaTestnet : mainnet;

      // Construct IPFS gateway URL for metadata
      const metadataURI = `https://gray-tough-elk-417.mypinata.cloud/ipfs/${metadataCid}`;

      // Prepare minting parameters
      const maxSupply = BigInt(freeComicData.maxSupply);
      const royaltyPercentage = BigInt((freeComicData.royaltyPercentage || 10) * 100); // Convert to basis points
      const isFree = true; // Mark as free comic

      setMintingProgress(35);

      console.log('🎨 Minting Free Comic NFT with params:', {
        comicId: dbComicId,
        metadataURI,
        maxSupply: maxSupply.toString(),
        royaltyPercentage: royaltyPercentage.toString(),
        isFree: true,
        contractAddress: QUIVA_FREE_COMICS_ADDRESS,
        currentChain: currentChain.name,
      });

      try {
        console.log('🎨 Calling mintComic on smart contract...');
        
        // Call the smart contract's mintComic function with isFree parameter
        await writeContract({
          address: QUIVA_FREE_COMICS_ADDRESS,
          abi: QUIVA_FREE_COMICS_ABI,
          functionName: 'mintFreeComic',
          args: [
            dbComicId,           // comicId (from MongoDB)
            metadataURI,         // metadataURI (IPFS link)
            maxSupply,           // maxSupply (how many can be claimed)
          ],
          account: address,
          chain: currentChain,
        });

        console.log('✅ Mint transaction sent, waiting for confirmation...');
        setMintingProgress(60);
        
      } catch (contractError) {
        console.error('❌ Contract write error:', contractError);
        throw contractError;
      }

      return {
        success: true,
        comic: createdComic,
        metadataCid,
        requiresConfirmation: true,
      };
      
    } catch (error: any) {
      console.error('❌ Error publishing free comic:', error);
      setMintError(error);
      setIsUploading(false);
      setIsMinting(false);
      throw error;
    }
  };

  /**
   * Update backend with minting results
   */
  const updateComicWithMintData = async (
    comicId: string,
    tokenId: bigint,
    transactionHash: string
  ) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(
        `/comics/token/${comicId}`,
        {
          tokenId: tokenId.toString(),
          mintStatus: 'minted',
          transactionHash: transactionHash,
          isFree: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ Free comic updated with mint data');
    } catch (error) {
      console.error('❌ Error updating comic with mint data:', error);
      throw error;
    }
  };

  /**
   * Reset all states
   */
  const reset = () => {
    setIsUploading(false);
    setIsMinting(false);
    setUploadProgress(0);
    setMintingProgress(0);
    setMintError(null);
    setTokenId(null);
    setComicId(null);
    setIsComplete(false);
    setSavedFreeComicData(null);
    setApprovalStatus({
      isChecking: false,
      isApproving: false,
      isApproved: false,
      error: null,
    });
  };

  return {
    // Main functions
    publishFreeComic,
    updateComicWithMintData,
    reset,
    checkCreatorApproval,
    savedFreeComicData,
    
    // Upload states
    isUploading,
    uploadProgress,
    
    // Minting states
    isMinting,
    mintingProgress,
    isWritePending,
    isConfirming,
    isMintSuccess,
    isComplete,
    
    // Results
    tokenId,
    mintHash: hash,
    comicId,
    mintError: writeError || mintError,
    
    // Approval states
    approvalStatus,
    isCreatorApproved: isCreatorApproved as boolean,
    
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