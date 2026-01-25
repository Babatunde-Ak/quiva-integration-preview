'use client'

import ComicDetail from '@/features/comic-library/components/ComicDetail'
import ComicPreviewModal from '@/features/comic-library/components/ComicPreviewModal'
import PurchaseNFTModal from '@/features/comic-library/components/PurchaseModal'
import ClaimModal from '@/features/comic-library/components/ClaimModal'
import MintComicModal from '@/features/comic-library/components/MintComicModal'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/redux/hook'
import { 
  getComicById, 
  clearCurrentComic, 
  getComicPreview, 
  clearPreviewComic 
} from '@/redux/slices/comicSlice'
import { Loader2 } from 'lucide-react'
// import { useComicPurchase } from '../../../hook/usePurchaseComic'
// import { useClaimFreeComic, useCheckComicClaim } from '@/hook/useClaimFreeComic'
import { toast } from 'react-toastify'
import { QUIVA_COMICS_ABI as QUIVA_COMICS_ADDRESS } from '@/contracts/QuivaComics'
import { DUMMY_COMIC_DATA } from '@/components/utils/dummy-data'
import { useNFTMarketplace } from '@/hook/useMarkeplace';
import { useHederaWallet } from '@/providers/HashPackProvider'
//import {useNFTMarketplace} from '../../../hook/useMarkeplace';

function Page() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useAppDispatch()

  const useClaimFreeComic = () =>{
    return null;
  }

  const useCheckComicClaim = (tokenId: string | undefined, walletAddress: string | null) => {
    return {
      hasClaimed: false,
      refetch: () => {}
    };
  }

  const useComicPurchase = () => {
    return null;
  }

  // Comic state
  const { 
    currentComic, 
    previewComic, 
    isLoading, 
    isPreviewing 
  } = useAppSelector((state: any) => state.comic)
  
  // Local state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [showMintPage, setShowMintPage] = useState(false) // NEW: Controls which page to show
  const [hasNFTAccess, setHasNFTAccess] = useState<boolean | null>(null)
  const [useDummyData, setUseDummyData] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  
  // Getting comic ID from URL query params
  const id = searchParams.get('id')
  
  // Initialize purchase hook
  const purchaseHookResult = useComicPurchase()
  
  const {
    purchaseComic = async () => {},
    isPurchasing = false,
    isConfirming = false,
    purchaseSuccess = false,
    purchaseError = null,
    reset: resetPurchase = () => {},
    walletStatus = { isConnected: false, address: null },
    setComicId = () => {}
  } = purchaseHookResult ?? {}

  // Initialize claiming hook
  const {
    claimFreeComic,
    isClaiming,
    claimError,
    claimSuccess,
    claimProgress,
    transactionHash: claimHash,
    resetClaimState,
  } = useClaimFreeComic()
  
  // Fetch comic data
  useEffect(() => {
    if (id) {
      dispatch(getComicById({id:id} as any));
    }

    return () => {
      dispatch(clearCurrentComic())
      dispatch(clearPreviewComic())
    };
  }, [id, dispatch])


    const { 
          account,
          isConnected, 
          // connector,
          provider,
          signer,
          connectWallet 
      } = useHederaWallet();
  
      const { user } = useAppSelector((state:any) => state.wallet);
      
      const { 
          listNFT,
          createCollection,
          mintNFTs, 
          status, 
          error 
      } = useNFTMarketplace({
          accountId: account || user?.walletAddress || '',
          network: "testnet",
          marketplaceContractId: "0.0.7726588", // Your deployed marketplace contract
          signer: signer,
          //provider: provider,
      });
  

  // Set comicId in the purchase hook
  useEffect(() => {
    if (id && currentComic) {
      setComicId(id)
    }
  }, [id, currentComic, setComicId])

  // Transform comic data
  const transformedComic = useMemo(() => {
    if (useDummyData) {
      return DUMMY_COMIC_DATA
    }

    if (!currentComic) return null

    const comic = currentComic
    const nftData = comic.nftId || {}
    const tokenId = nftData?.tokenId
    const price = nftData?.price || 0.09

    return {
      title: comic.title || "Avatar - Book of Beginnings",
      issueNumber: comic.chapters?.[0]?.chapterNumber || 1,
      author: {
        name: comic.creatorId?.username || "Studio Kyra",
        avatar: comic.creatorId?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=kyra"
      },
      coverImage: comic.coverImage || "https://via.placeholder.com/300x450?text=Comic+Cover",
      description: comic.description || "In a world torn between the elements, a young avatar rises to restore balance – not by choice, but by destiny. 'Book of Beginnings' marks the first chapter of the Avatar Chronicles, where every mint helps since the legend.",
      tags: comic.genre || ['Fantasy', 'Adventure', 'On-chain Epic'],
      isFree: comic.publishType === "free",
      publishType: comic.publishType || "nft",
      price: price,
      tokenId: tokenId,
      creatorWalletAddress: comic.creatorId?.walletAddress,
      issueDetails: {
        creators: comic.creatorId?.username || "Studio Kyra",
        pages: comic.totalPages || 0,
        publisher: "Independent",
        publicationDate: new Date(comic.createdAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      },
      otherIssues: []
    }
  }, [currentComic, useDummyData])

  const { hasClaimed, refetch: refetchClaimStatus } = useCheckComicClaim(
    transformedComic?.tokenId,
    walletStatus.address
  )

  // Auto-use dummy data
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!transformedComic && id) {
        setUseDummyData(true)
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [transformedComic, id])

  // Handle purchase success
  useEffect(() => {
    if (purchaseSuccess) {
      setHasNFTAccess(true)
      setIsPurchaseModalOpen(false)
      setShowMintPage(false)
      resetPurchase()
      
      setTimeout(() => {
        if (id) {
          toast.success('Purchase successful! Redirecting to reader...', { autoClose: 2000 })
          router.push(`/reader?id=${id}`)
        }
      }, 2000)
    }
  }, [purchaseSuccess, id, router, resetPurchase])

  // Handle claim success
  useEffect(() => {
    if (claimSuccess && claimHash) {
      setHasNFTAccess(true)
      refetchClaimStatus()
      
      setTimeout(() => {
        setIsClaimModalOpen(false)
        resetClaimState()
        
        if (id) {
          toast.success('Comic claimed! Enjoy reading! 🎉', { autoClose: 2000 })
          router.push(`/reader?id=${id}`)
        }
      }, 2000)
    }
  }, [claimSuccess, claimHash, id, router, resetClaimState, refetchClaimStatus])

  // Event handlers
  const handlePreview = () => {
    if (!id) return
    setIsPreviewOpen(true)
    if (!useDummyData) {
      dispatch(getComicPreview({id: id} as any))
    }
  }

  const handleClaimComic = async () => {
    if (!walletStatus.isConnected) {
      toast.error('Please connect your wallet to claim this comic')
      return
    }

    if (!transformedComic?.tokenId || !id) {
      toast.error('Invalid comic data')
      return
    }

    try {
      await claimFreeComic({
        tokenId: transformedComic.tokenId,
        comicId: id,
      })
    } catch (error) {
      console.error('Error claiming comic:', error)
      toast.error('Failed to claim comic. Please try again.')
    }
  }

  const handleClosePurchaseModal = () => {
    setIsPurchaseModalOpen(false)
    resetPurchase()
  }

  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    dispatch(clearPreviewComic())
  }

  const handleEnlargeCover = () => {
    if (transformedComic?.coverImage) {
      window.open(transformedComic.coverImage, '_blank')
    }
  }

  // Handle minting from MintComicModal
  // const handleMintComic = async () => {
  //   if (!transformedComic || !id) {
  //     toast.error('Comic data not available')
  //     return
  //   }

  //   if (!walletStatus.isConnected) {
  //     toast.error('Please connect your wallet first')
  //     return
  //   }

  //   try {
  //     if (useDummyData) {
  //       // Simulate minting for demo
  //       toast.success('Demo mint successful! Redirecting to reader...', { autoClose: 3000 })
  //       setTimeout(() => {
  //         setShowMintPage(false)
  //         router.push(`/reader?id=${id}`)
  //       }, 1500)
  //       return
  //     }
      
  //     if (!transformedComic.tokenId) {
  //       toast.error('NFT token ID not available')
  //       return
  //     }

  //     const result = await purchaseComic({
  //       nftAddress: QUIVA_COMICS_ADDRESS,
  //       tokenId: BigInt(transformedComic.tokenId),
  //       amount: BigInt(1),
  //     });

  //     console.log('Mint initiated:', result);
  //     return result;

  //   } catch (error: any) {
  //     console.error('Mint error:', error);
  //     toast.error(error.message || 'Failed to mint comic');
  //   }
  // };
const handleMintComic = async () => {
  

  
  };
  const handleBack = () => {
    if (showMintPage) {
      setShowMintPage(false)
    } else {
      router.back()
    }
  }

  // Handle "Start Read" button click - SHOW MINT PAGE
  const handleReadIssue = () => {
    console.log('Opening mint page for:', transformedComic?.title)
    setShowMintPage(true)
  }

  const handleResell = () => {
    toast.info('Resell feature coming soon!')
  }

  // Loading state
  if (isLoading && !useDummyData) {
    return (
      <div className="min-h-screen bg-[#161614] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-3" />
          <p className="text-white/60 text-xs font-medium">Loading comic...</p>
        </div>
      </div>
    )
  }

  if (!transformedComic && !useDummyData) {
    return (
      <div className="min-h-screen bg-[#161614] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">❌</div>
          <h3 className="text-white text-lg font-bold mb-2">Comic Not Found</h3>
          <p className="text-white/60 text-xs mb-4">
            The comic you're looking for doesn't exist or has been removed.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/marketplace')}
              className="bg-yellow-600 hover:bg-yellow-700 text-black text-xs font-medium px-4 py-2 rounded transition-all"
            >
              Back to Marketplace
            </button>
            <button
              onClick={() => setUseDummyData(true)}
              className="bg-white hover:bg-gray-200 text-black text-xs font-medium px-4 py-2 rounded transition-all"
            >
              Show Demo Comic
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Determine if purchase is in progress
  const isPurchaseInProgress = isPurchasing || isConfirming

  // RENDER MINT PAGE OR COMIC DETAIL PAGE
  return (
    <>
      {showMintPage ? (
        // SHOW MINT COMIC PAGE
        <MintComicModal
          title={transformedComic.title}
          issueNumber={transformedComic.issueNumber}
          author={transformedComic.author}
          coverImage={transformedComic.coverImage}
          description={transformedComic.description}
          tags={transformedComic.tags}
          price={transformedComic.price || '0.09 ₽'}
          isWalletConnected={walletStatus.isConnected}
          walletAddress={walletStatus.address ? 
            `${walletStatus.address.slice(0, 6)}...${walletStatus.address.slice(-4)}` : 
            '0xA182...C3D4'
          }
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={() => setShowMintPage(false)}
          onMintComic={handleMintComic}
          onAddToFavourite={() => toast.info('Added to favourites!')}
          onConnectWallet={() => toast.info('Connect wallet clicked!')}
        />
      ) : (
        // SHOW REGULAR COMIC DETAIL PAGE
        <>
          <ComicDetail
            {...transformedComic}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onBack={handleBack}
            onReadIssue={handleReadIssue}
            onResell={handleResell}
            onPreviewIssue={handlePreview}
            onEnlargeCover={handleEnlargeCover}
            isVerifyingAccess={false}
            hasNFTAccess={useDummyData ? false : hasNFTAccess}
          />

          <ComicPreviewModal
            isOpen={isPreviewOpen}
            onClose={handleClosePreview}
            previewComic={previewComic}
            isLoading={isPreviewing}
          />

          {/* Keep PurchaseModal for backward compatibility */}
          {transformedComic.publishType === 'nft' && (
            <PurchaseNFTModal
              isOpen={isPurchaseModalOpen}
              onClose={handleClosePurchaseModal}
              comicTitle={transformedComic.title}
              comicImage={transformedComic.coverImage}
              creatorName={transformedComic.author.name}
              creatorAvatar={transformedComic.author.avatar}
              price={transformedComic.price}
              tokenId={BigInt(transformedComic.tokenId || 1)}
              sellerAddress={transformedComic.creatorWalletAddress}
              limitedEdition="1,000"
              onPurchase={handleMintComic}
              onPurchaseSuccess={() => {
                setIsPurchaseModalOpen(false)
                router.push(`/reader?id=${id}`)
              }}
              isPurchasing={isPurchaseInProgress}
              purchaseError={purchaseError}
              purchaseSuccess={purchaseSuccess}
              comicId={id}
            />
          )}

          <ClaimModal
            isOpen={isClaimModalOpen}
            onClose={() => setIsClaimModalOpen(false)}
            onClaim={handleClaimComic}
            comicTitle={transformedComic.title}
            isClaiming={isClaiming}
            claimSuccess={claimSuccess}
            claimError={claimError}
            claimProgress={claimProgress}
            transactionHash={claimHash}
          />
        </>
      )}
    </>
  )
}

export default Page
