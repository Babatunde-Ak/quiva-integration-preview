'use client'

import ComicDetail from '@/features/comic-library/components/ComicDetail'
import ComicPreviewModal from '@/features/comic-library/components/ComicPreviewModal'
import PurchaseNFTModal from '@/features/comic-library/components/PurchaseModal'
import ClaimModal from '@/features/comic-library/components/ClaimModal'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/redux/hook'
import { 
  getComicById, 
  clearCurrentComic, 
  getComicPreview, 
  clearPreviewComic 
} from '@/redux/slices/comicSlice'
import {
  verifyNftPurchase,
  clearError as clearTransactionError,
  selectIsVerifying,
  selectTransactionError,
  clearCurrentTransaction
} from '@/redux/slices/transactionSlice'
import { Loader2 } from 'lucide-react'
import { useComicPurchase } from '../../../hook/usePurchaseComic'
import { useClaimFreeComic, useCheckComicClaim } from '@/hook/useClaimFreeComic'
import { toast } from 'react-toastify'
import { QUIVA_COMICS_ADDRESS } from '@/contracts/QuivaComics'
// Import dummy data
import { DUMMY_COMIC_DATA } from '@/components/utils/dummy-data'

function Page() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  
   // Comic state
  const { 
    currentComic, 
    previewComic, 
    isLoading, 
    isPreviewing 
  } = useAppSelector((state) => state.comic)
  
  // Transaction state
  const isVerifyingTransaction = useAppSelector(selectIsVerifying)
  const transactionError = useAppSelector(selectTransactionError)
  
  // Local state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [hasNFTAccess, setHasNFTAccess] = useState<boolean | null>(null)
  const [accessCheckComplete, setAccessCheckComplete] = useState(false)
  const [useDummyData, setUseDummyData] = useState(false)
  const [activeTab, setActiveTab] = useState('details') // 'details' or 'activity'
  
  const id = searchParams.get('id')
  
  // Initialize purchase hook
  const purchaseHookResult = useComicPurchase()
  
  // Destructure with fallback values in case hook returns undefined/void
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
  
  // Fetch comic data on mount
  useEffect(() => {
    if (id) {
      dispatch(getComicById({id:id} as any));
    }

    // unmount
    return () => {
      dispatch(clearCurrentComic())
      dispatch(clearPreviewComic())
      dispatch(clearCurrentTransaction())
    }
  }, [id, dispatch])

  // Set comicId in the purchase hook when comic loads
  useEffect(() => {
    if (id && currentComic) {
      setComicId(id)
    }
  }, [id, currentComic, setComicId])

  // Transforming API data to match ComicDetail component interface
  const transformedComic = useMemo(() => {
    if (useDummyData) {
      // Return dummy data for development
      return DUMMY_COMIC_DATA
    }

    if (!currentComic) return null

    const comic = currentComic
    const nftData = comic.nftId || {}
    const tokenId = nftData?.tokenId
    const price = nftData?.price || 0
    const maxSupply = nftData?.maxSupply || 100
    const currentSupply = nftData?.currentSupply || 0

    return {
      title: comic.title || "Untitled Comic",
      issueNumber: comic.chapters?.[0]?.chapterNumber || 1,
      author: {
        name: comic.creatorId?.username || comic.creatorId?.walletAddress?.slice(0, 8) || "Unknown Creator",
        avatar: comic.creatorId?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
      },
      coverImage: comic.coverImage || "https://via.placeholder.com/300x450?text=No+Cover",
      description: comic.description || "No description available.",
      tags: comic.genre || [],
      isFree: comic.publishType === "free",
      publishType: comic.publishType,
      price: price,
      nftDetails: {
        tokenId: tokenId,
        maxSupply: maxSupply,
        currentSupply: currentSupply,
        mintStatus: nftData?.mintStatus || 'pending'
      },
      tokenId: tokenId,
      creatorWalletAddress: comic.creatorId?.walletAddress,
      issueDetails: {
        creators: comic.creatorId?.username || "Unknown",
        pages: comic.totalPages || 0,
        publisher: "Independent",
        publicationDate: new Date(comic.createdAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      },
      otherIssues: comic.chapters?.slice(0, 4).map((chapter: any, index: number) => ({
        id: chapter._id,
        title: `${comic.title} - ${chapter.title}`,
        image: chapter.pages?.[0]?.imageUrl || comic.coverImage,
        date: new Date(chapter.createdAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        isFree: comic.publishType === "free"
      })) || [],
      views: comic.views || 0,
      likes: comic.likes || 0,
      status: comic.status || "draft"
    }
  }, [currentComic, useDummyData])

  const { hasClaimed, refetch: refetchClaimStatus } = useCheckComicClaim(
    transformedComic?.tokenId,
    walletStatus.address
  )

  // Auto-use of dummy data for development
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

  // Auto-use of dummy data if loading fails
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        if (!currentComic) {
          setUseDummyData(true)
        }
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isLoading, currentComic])

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

  const handlePurchase = async () => {
    if (!transformedComic || !id) {
      toast.error('Comic data not available')
      return
    }

    if (!walletStatus.isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!transformedComic.tokenId) {
      toast.error('NFT token ID not available')
      return
    }

    try {
      if (useDummyData) {
        // Simulate purchase for demo
        toast.success('Demo purchase successful! Redirecting to reader...', { autoClose: 3000 })
        setTimeout(() => {
          router.push(`/reader?id=${id}`)
        }, 1500)
        return
      }
      
      const result = await purchaseComic({
        nftAddress: QUIVA_COMICS_ADDRESS,
        tokenId: BigInt(transformedComic.tokenId),
        amount: BigInt(1),
      });

      console.log('Purchase initiated:', result);
      return result;

    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to purchase comic');
    }
  };

  const handleBack = () => {
    router.back()
  }

  const handleReadIssue = () => {
    if (!walletStatus.isConnected && !useDummyData) {
      toast.error('Please connect your wallet to read this comic')
      return
    }

    if (!transformedComic) {
      toast.error('Comic data not available')
      return
    }

    // For demo/dummy data, to allow reading directly
    if (useDummyData) {
      router.push(`/reader?id=${id}`)
      return
    }

    if (transformedComic.publishType === 'free') {
      if (hasNFTAccess || hasClaimed) {
        router.push(`/reader?id=${id}`)
      } else {
        setIsClaimModalOpen(true)
      }
      return
    }

    if (transformedComic.publishType === 'nft') {
      if (hasNFTAccess) {
        router.push(`/reader?id=${id}`)
      } else {
        setIsPurchaseModalOpen(true)
      }
    }
  }

  const handleResell = () => {
    toast.info('Resell feature coming soon!')
  }

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

  // this determine if purchase is in progress
  const isPurchaseInProgress = isPurchasing || isConfirming

  return (
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

      {transformedComic.publishType === 'nft' && (
        <PurchaseNFTModal
          isOpen={isPurchaseModalOpen}
          onClose={handleClosePurchaseModal}
          comicTitle={transformedComic.title}
          comicImage={transformedComic.coverImage}
          creatorName={transformedComic.author.name}
          creatorAvatar={transformedComic.author.avatar}
          price={transformedComic.price}
          tokenId={transformedComic.tokenId}
          sellerAddress={transformedComic.creatorWalletAddress}
          limitedEdition={`${transformedComic.nftDetails?.currentSupply || 0}/${transformedComic.nftDetails?.maxSupply || 100}`}
          onPurchase={handlePurchase}
          onPurchaseSuccess={() => setIsPurchaseModalOpen(false)}
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
  )
}

export default Page
