
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
import { parseEther } from 'viem'
import { toast } from 'react-toastify'

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
  
  // Get comic ID from URL query params
  const id = searchParams.get('id')
  
  // Initialize purchase hook
  const {
    purchaseComic,
    isPurchasing,
    isWritePending,
    isConfirming,
    isPurchaseComplete,
    purchaseSuccess,
    purchaseError,
    purchaseHash,
    reset: resetPurchase,
    walletStatus,
    setComicId
  } = useComicPurchase()

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

  // Transform API data to match ComicDetail component interface
  const transformedComic = useMemo(() => {
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
      coverImage: comic.coverImage || "https://via.placeholder.com/400x600?text=No+Cover",
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
  }, [currentComic])

    const { hasClaimed, refetch: refetchClaimStatus } = useCheckComicClaim(
    transformedComic?.tokenId,
    walletStatus.address
  )
  //

  // Enhanced access verification using transaction slice
  useEffect(() => {
    const checkUserAccess = async () => {
      if (!transformedComic || !id) {
        setAccessCheckComplete(true)
        return
      }
      
      console.log('Checking user access for comic:', id, 'Type:', transformedComic.publishType)
      
      // ALL free comics require NFT claim
      if (transformedComic.publishType === 'free') {
        try {
          console.log('Free comic - verifying NFT claim status')
          
          const verificationResult = await dispatch(verifyNftPurchase({ comicId: id } as any)).unwrap()
          
          console.log('Claim verification result:', verificationResult)
          
          const hasClaimedNFT = verificationResult?.data?.purchased === true
          
          setHasNFTAccess(hasClaimedNFT)
          console.log(hasClaimedNFT ? 'User has claimed NFT' : 'User must claim NFT to read')
          
        } catch (error) {
          console.error('Error verifying claim:', error)
          setHasNFTAccess(false)
          
          if (error?.includes?.('not found') || error?.includes?.('No transaction')) {
            dispatch(clearTransactionError())
          }
        } finally {
          setAccessCheckComplete(true)
        }
        return
      }
      
      // If it's an NFT comic, verify purchase through transaction history
      if (transformedComic.publishType === 'nft') {
        try {
          console.log('NFT comic - checking transaction history')
          
          const verificationResult = await dispatch(verifyNftPurchase({ comicId: id } as any)).unwrap()
          
          console.log('Transaction verification result:', verificationResult)
          
          const hasSuccessfulPurchase = verificationResult?.data?.purchased === true
          
          setHasNFTAccess(hasSuccessfulPurchase)
          console.log(hasSuccessfulPurchase ? 'User has purchased this NFT' : 'User has not purchased this NFT')
          
        } catch (error) {
          console.error('Error verifying NFT purchase:', error)
          setHasNFTAccess(false)
          
          if (error?.includes?.('not found') || error?.includes?.('No transaction')) {
            dispatch(clearTransactionError())
          }
        } finally {
          setAccessCheckComplete(true)
        }
      } else {
        setAccessCheckComplete(true)
      }
    }

    checkUserAccess()
  }, [transformedComic, id, dispatch])

  // Handle purchase success - the hook already creates the transaction record
  useEffect(() => {
    if (purchaseSuccess) {
      console.log('Purchase successful - updating access status')
      setHasNFTAccess(true)
      setIsPurchaseModalOpen(false)
      resetPurchase()
      
      // Show success message and redirect to reader
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
      console.log('Claim successful - updating access status')
      setHasNFTAccess(true)
      refetchClaimStatus()
      
      // Show success for 2 seconds then redirect to reader
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

  // Wallet connection state monitoring
  useEffect(() => {
    if (!walletStatus.isConnected && !accessCheckComplete) {
      console.log('Wallet not connected')
    } else if (walletStatus.isConnected && !accessCheckComplete) {
      console.log('Wallet connected, checking access...')
    }
  }, [walletStatus.isConnected, accessCheckComplete])

    // Check if user has already claimed
 //Handle preview modal open
  const handlePreview = () => {
    if (!id) return
    setIsPreviewOpen(true)
    dispatch(getComicPreview({id: id} as any))
  }

  // Handle claim comic
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
    if (transformedComic.coverImage) {
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

    if (!transformedComic.price || transformedComic.price <= 0) {
      toast.error('Invalid comic price')
      return
    }

    try {
      console.log('Initiating purchase:', {
        tokenId: transformedComic.tokenId,
        price: transformedComic.price,
        creator: transformedComic.creatorWalletAddress
      })

      const priceInWei = parseEther(transformedComic.price.toString())
        const result = await purchaseComic({
          tokenId: transformedComic.tokenId,
          seller: transformedComic.creatorWalletAddress,
          amount: BigInt(1),
          pricePerToken: priceInWei,
        })

        console.log('Purchase initiated:', result);
       return result;

      
    } catch (error: any) {
      console.error('Purchase error:', error)
      toast.error(error.message || 'Failed to purchase comic')
    }
  }

  const handleBack = () => {
    router.back()
   }

  // Updated read issue handler
  const handleReadIssue = () => {
    if (!walletStatus.isConnected) {
      toast.error('Please connect your wallet to read this comic')
      return
    }

    if (!transformedComic) {
      toast.error('Comic data not available')
      return
    }

    // ALL free comics must claim NFT first
    if (transformedComic.publishType === 'free') {
      if (hasNFTAccess || hasClaimed) {
        // User has claimed, allow reading
        router.push(`/reader?id=${id}`)
      } else {
        // User hasn't claimed yet, show claim modal
        setIsClaimModalOpen(true)
      }
      return
    }

    // Paid/NFT comics - must purchase
    if (transformedComic.publishType === 'nft') {
      if (hasNFTAccess) {
        router.push(`/reader?id=${id}`)
      } else {
        setIsPurchaseModalOpen(true)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black-500 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm font-medium">Loading comic...</p>
        </div>
      </div>
    )
  }

  if (!transformedComic || !currentComic) {
    return (
      <div className="min-h-screen bg-black-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-white text-xl font-bold mb-2">Comic Not Found</h3>
          <p className="text-white/60 text-sm mb-6">
            The comic you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/marketplace')}
            className="bg-yellow-600 hover:bg-yellow-700 text-black font-medium px-6 py-3 rounded-full transition-all"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    )
  }

  //   // Calculate limited edition string
  const limitedEditionString = transformedComic.nftDetails 
    ? `${transformedComic.nftDetails.currentSupply || 0}/${transformedComic.nftDetails.maxSupply || 100}`
    : '0/100';

  // Check if NFT is ready for purchase
  const isNFTReady = transformedComic.publishType === 'nft' && 
                      transformedComic.tokenId && 
                      transformedComic.creatorWalletAddress;

  // Determine verification status for UI
  const isVerifying = isVerifyingTransaction || !accessCheckComplete

  // Determine if purchase is in progress (includes all stages)
  const isPurchaseInProgress = isPurchasing || isWritePending || isConfirming
  return (
    <>
      <ComicDetail
    
         {...transformedComic}
        onBack={handleBack}        
        onReadIssue={handleReadIssue}
        onPreviewIssue={handlePreview}
        onEnlargeCover={handleEnlargeCover}
        isVerifyingAccess={isVerifying || isVerifyingTransaction || !accessCheckComplete}
        hasNFTAccess={hasNFTAccess}
      />


       <ComicPreviewModal
       isOpen={isPreviewOpen}
      onClose={handleClosePreview}
      previewComic={previewComic}
      isLoading={isPreviewing}
    />

      {isNFTReady && (
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
          limitedEdition={limitedEditionString}
          onPurchase={handlePurchase}
          onPurchaseSuccess={() => setIsPurchaseModalOpen(false)}
          isPurchasing={isPurchaseInProgress}
          purchaseError={purchaseError}
          purchaseSuccess={purchaseSuccess}
          comicId={id}
        />
      )}

      {/* Claim Modal */}
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
