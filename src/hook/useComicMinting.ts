import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, usePublicClient } from 'wagmi';
import axios from 'axios';
import { QUIVA_COMICS_ABI, QUIVA_COMICS_ADDRESS } from '../contracts/QuivaComics';
import { mainnet } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';
import { parseEther, decodeEventLog, Address } from 'viem';
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

  // Monitor transaction status
  useEffect(() => {
    if (hash) {
      console.log('🔗 Transaction hash received:', hash);
      console.log('⏳ Waiting for blockchain confirmation...');
      setMintingProgress(70);
    }
  }, [hash]);

  // Extract token ID from transaction receipt
  useEffect(() => {
    const extractTokenId = async () => {
      if (isMintSuccess && receipt && !tokenId) {
        console.log('📄 Transaction receipt received:', receipt);

        try {
          // Method 1: Parse logs for ComicMinted event
          const mintedLog = receipt.logs.find((log) => {
            try {
              const decoded = decodeEventLog({
                abi: QUIVA_COMICS_ABI,
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
              abi: QUIVA_COMICS_ABI,
              data: mintedLog.data,
              topics: mintedLog.topics,
            });

            if ((decoded as any).eventName === 'ComicMinted') {
              const decodedEvent = decoded as { eventName: string; args: { tokenId: bigint } };
              const extractedTokenId = decodedEvent.args.tokenId;
              const extractedCreator = (decodedEvent.args as any).creator;
              console.log('✅ Token ID extracted from event:', extractedTokenId.toString());
              console.log('✅ Creator address extracted from event:', extractedCreator);
              setTokenId(extractedTokenId);
         
              return;
            }
          }

          // Method 2: If event parsing fails, try getting from return value
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


  

  // Auto-list NFT after successful minting and update backend
  useEffect(() => {
    const listAfterMint = async () => {
      if (isMintSuccess && hash && comicId && tokenId && !isComplete && savedMonetizationData && address) {
        console.log('✅ NFT minted successfully!');
        console.log('🔗 Transaction hash:', hash);
        console.log('🎫 Token ID:', tokenId.toString());
        setMintingProgress(70);
        
        // STEP 2: Automatically list the NFT for sale
        if (savedMonetizationData.mintAsNFT) {
          try {
            console.log('📋 Step 2: Listing NFT on marketplace...');
            setIsListing(true);
            
            const pricePerToken = BigInt(savedMonetizationData.nftPrice || 0);
            const amountToList = BigInt(savedMonetizationData.nftCopies || 100);
            const currentChain = chainId === 296 ? hederaTestnet : mainnet;
            
            console.log('📋 Listing parameters:', {
              tokenId: tokenId.toString(),
              amount: amountToList.toString(),
              pricePerToken: pricePerToken.toString(),
            });
            
            // Call listComic function
            await writeContract({
              address: QUIVA_COMICS_ADDRESS,
              abi: QUIVA_COMICS_ABI,
              functionName: 'listComic',
              args: [
                tokenId,
                amountToList,
                pricePerToken,
              ],
              account: address,
              chain: currentChain,
            });
            
            console.log('✅ Listing transaction sent, waiting for confirmation...');
            setMintingProgress(85);
            
            // Wait for listing to confirm
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            console.log('✅ Comic listed on marketplace!');
            setMintingProgress(90);
            setIsListing(false);
            
          } catch (listingError) {
            console.error('⚠️ Listing failed, but mint was successful:', listingError);
            setIsListing(false);
            // Don't throw - minting succeeded, user can list manually later
          }
        }
        
        // STEP 3: Update backend with mint data
        console.log('💾 Step 3: Updating backend with mint data...');
        try {
          await updateComicWithMintData(comicId, tokenId);
          setMintingProgress(100);
          setIsMinting(false);
          setIsComplete(true);
          console.log('🎉 All done! Comic is minted and listed!');
        } catch (error) {
          console.error('❌ Error updating backend:', error);
          setMintError(error as Error);
        }
      }
    };

    listAfterMint();
  }, [isMintSuccess, hash, comicId, tokenId, isComplete, savedMonetizationData, chainId, address, writeContract]);

  //   const extractedPriceCreator = async () => {
  //     if (isMintSuccess && receipt && !tokenId) {
  //       console.log('📄 Transaction receipt received:', receipt);

  //       try {
  //         // Method 1: Parse logs for ComicMinted event
  //         const mintedLog = receipt.logs.find((log) => {
  //           try {
  //             const decoded = decodeEventLog({
  //               abi: QUIVA_COMICS_ABI,
  //               data: log.data,
  //               topics: log.topics,
  //             });
  //             return (decoded as any).eventName ==='ComicListed';
  //           } catch {
  //             return false;
  //           }
  //         });

  //         if (mintedLog) {
  //           const decoded = decodeEventLog({
  //             abi: QUIVA_COMICS_ABI,
  //             data: mintedLog.data,
  //             topics: mintedLog.topics,
  //           });

  //           if ((decoded as any).eventName === 'ComicListed') {
  //             const decodedEvent = decoded as { eventName: string; args: { tokenId: bigint, pricePerToken: number,  seller: Address} };
  //             const extractedPrice = decodedEvent.args.pricePerToken;
  //             const extractedCreator = decodedEvent.args.seller;
  //             console.log('✅ Token ID extracted from event:', extractedPrice.toString());
  //             console.log('✅ Creator address extracted from event:', extractedCreator);
  //             setPricePerToken(Number(extractedPrice));
  //             setSellerAddress(extractedCreator);
         
  //             return;
  //           }
  //         }

  //         // Method 2: If event parsing fails, try getting from return value
  //         // if (publicClient && hash) {
  //         //   const transaction = await publicClient.getTransaction({ hash });
  //         //   console.log('📄 Transaction data:', transaction);
  //         // }

  //         // console.warn('⚠️ Could not extract token ID from receipt');
  //       } catch (error) {
  //         console.error('❌ Error extracting token ID:', error);
  //       }
  //     }
  //   };

  //   extractedPriceCreator();
  // }, [isMintSuccess, receipt, tokenId, publicClient, hash]);
  // Monitor write errors
  useEffect(() => {
    if (writeError) {
      console.error('❌ Write contract error:', writeError);
      setMintError(writeError as Error);
      setIsMinting(false);
      setIsListing(false);
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
   * Check if the connected wallet is an approved creator
   */
  const checkCreatorApproval = async (): Promise<boolean> => {
    if (!address) return false;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get(`creators/check-approval/${address}`, 
        // `http://localhost:5000/api/creators/check-approval/${address}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
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
      // const response = await axios.post(
        // 'http://localhost:5000/api/creators/approve-creator',
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
      setIsComplete(false);
      setTokenId(null);
      setComicId(null);
      setMintError(null);
      
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
      // const response = await axios.post(
      //   'http://localhost:5000/api/comics/full',
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

      console.log('🔍 NFT Minting Check:', {
        mintAsNFT: monetizationData.mintAsNFT,
        metadataCid: metadataCid,
        isConnected: isConnected,
        address: address,
        chainId: chainId,
      });

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
        const metadataURI = `https://gray-tough-elk-417.mypinata.cloud/ipfs/${metadataCid}`;

        // Prepare minting parameters
        const maxSupply = BigInt(monetizationData.nftCopies || 100);
        const royaltyBasisPoints = BigInt(10 * 100); // 10% royalty

        setMintingProgress(30);

        console.log('📄 Minting NFT with params:', {
          comicId: dbComicId,
          metadataURI,
          maxSupply: maxSupply.toString(),
          royaltyPercentage: royaltyBasisPoints.toString(),
          contractAddress: QUIVA_COMICS_ADDRESS,
          currentChain: currentChain,
        });

        try {
          // STEP 1: Mint the NFT (all copies to creator)
          console.log('🎨 Step 1: Minting NFT...');
          await writeContract({
            address: QUIVA_COMICS_ADDRESS,
            abi: QUIVA_COMICS_ABI,
            functionName: 'mintComic',
            args: [
              dbComicId,
              metadataURI,
              maxSupply,
              royaltyBasisPoints,
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
        requiresMinting: monetizationData.mintAsNFT && !hash,
      };
    } catch (error: any) {
      console.error('❌ Error publishing comic:', error);
      setMintError(error);
      throw error;
    } finally {
      setIsUploading(false);
      if (!writeError) {
        setIsMinting(false);
      }
    }
  };

  /**
   * Update backend with minting results
   */
  // const updateComicWithMintData = async (
  //   comicId: string,
  //   tokenId: bigint,
  //   transactionHash: string
  // ) => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     await axios.patch(
  //       `http://localhost:5000/api/comics/${comicId}`,
  //       {
  //         nftDetails: {
  //           mintStatus: 'minted',
  //           tokenId: tokenId.toString(),
  //           contractAddress: QUIVA_COMICS_ADDRESS,
  //           transactionHash,
  //         },
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     console.log('✅ Comic updated with mint data');
  //   } catch (error) {   
  //     console.error('❌ Error updating comic with mint data:', error);
  //   }
  // };

  //Reset function
  // 
  const updateComicWithMintData = async (
    comicId: string,
    tokenId: bigint,
    // transactionHash: string
  ) => {
    try {
      const token = localStorage.getItem('token');
      // await axios.put(
      //   `http://localhost:5000/api/comics/token/${comicId}`,
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
    }
  };
  
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
  };

  return {
    publishComic,
    updateComicWithMintData,
    reset,
    isUploading,
    isMinting,
    isListing,
    uploadProgress,
    mintingProgress,
    isWritePending,
    isConfirming,
    isComplete,
    isMintSuccess,
    mintError: writeError || mintError,
    tokenId,
    sellerAddress,
    pricePerToken,
    mintHash: hash,
    comicId,
    setTokenId,
    walletStatus: {
      isConnected,
      address,
      chainId,
    }
  };
};

