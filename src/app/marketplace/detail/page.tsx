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

// Exact dummy data 
const DUMMY_COMIC_DATA = {
  id: '2',
  title: 'Avatar - Book of Beginnings',
  issueNumber: 1,
  author: {
    name: 'Studio Kyra',
    avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&h=100&fit=crop'
  },
  coverImage: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&h=450&fit=crop',
  description: 'In a world torn between the elements, a young avatar rises to restore balance – not by choice, but by destiny. "Book of Beginnings" marks the first chapter of the Avatar Chronicles, where every mint helps since the legend.',
  tags: ['Fantasy', 'Adventure', 'On-chain Epic'],
  isFree: false,
  publishType: 'nft',
  price: 0.09,
  nftDetails: {
    tokenId: '2',
    maxSupply: 1000,
    currentSupply: 721,
    mintStatus: 'minting'
  },
  tokenId: '2',
  creatorWalletAddress: '0x1234567890abcdef1234567890abcdef12345678',
  issueDetails: {
    creators: 'Studio Kyra',
    pages: 32,
    publisher: 'Independent',
    publicationDate: 'December 9, 2024'
  },
  otherIssues: [
    {
      id: 'ep1',
      title: 'Episode 1 : The First Flame',
      image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=150&h=225&fit=crop',
      date: 'December 2, 2024',
      isFree: false
    },
    {
      id: 'ep2',
      title: 'Episode 2 : Whispers of the Wind',
      image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=150&h=225&fit=crop',
      date: 'December 9, 2024',
      isFree: false
    },
    {
      id: 'ep3',
      title: 'Episode 3 : Echoes Beneath the Earth',
      image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=150&h=225&fit=crop',
      date: 'December 16, 2024',
      isFree: false
    }
  ],
  views: 4500,
  likes: 230,
  status: "published",
  
  episodeList: [
    {
      id: 'ep1',
      title: 'Episode 1 : The First Flame',
      time: '8 min',
      stats: {
        floorPrice: '0.085 HBAR',
        totalMints: '721 / 1,000',
        volume: '45.8 HBAR'
      }
    },
    {
      id: 'ep2',
      title: 'Episode 2 : Whispers of the Wind',
      time: '8 min',
      stats: {
        floorPrice: '0.085 HBAR',
        totalMints: '721 / 1,000',
        volume: '45.8 HBAR'
      }
    },
    {
      id: 'ep3',
      title: 'Episode 3 : Echoes Beneath the Earth',
      time: '8 min',
      stats: {
        floorPrice: '0.085 HBAR',
        totalMints: '721 / 1,000',
        volume: '45.8 HBAR'
      }
    }
  ],
  marketStats: {
    floorPrice: '0.085 HBAR',
    totalMints: '721 / 1,000',
    volume: '45.8 HBAR'
  },
  mintingDetails: {
    mintPrice: '0.09 HBAR',
    edition: '1,000',
    royalties: '7% to creator'
  },
  collections: '389 Collections',
  studioInfo: {
    name: 'Studio Kyra',
    description: 'Studio Kyra is a visionary town of artists and storytellers dedicated to making the boundaries of digital art and interactive narratives.'
  },
  moreAdventureComics: [
    {
      id: 'ma1',
      title: 'Inosuke degen',
      subtitle: 'Chrome Extreme',
      image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=100&h=150&fit=crop'
    },
    {
      id: 'ma2',
      title: 'The son is also the father',
      subtitle: 'New York A.B.R.C.',
      image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=100&h=150&fit=crop'
    },
    {
      id: 'ma3',
      title: 'Spiderman: Mary Jane',
      subtitle: 'Catera Marathon',
      image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=100&h=150&fit=crop'
    },
    {
      id: 'ma4',
      title: 'John Pryce',
      subtitle: 'A.B.R.C.',
      image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=100&h=150&fit=crop'
    },
    {
      id: 'ma5',
      title: 'John Pryce',
      subtitle: 'A.B.R.C.',
      image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=100&h=150&fit=crop'
    },
    {
      id: 'ma6',
      title: 'John Pryce',
      subtitle: 'A.B.R.C.',
      image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=100&h=150&fit=crop'
    }
  ]
}

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
  
  // Getting comic ID from URL query params
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

    // Cleanup on unmount
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

  // Auto-use dummy data for development
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

  // Auto-use dummy data if loading fails
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
