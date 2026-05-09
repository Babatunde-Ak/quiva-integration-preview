'use client'

import React, { useState } from 'react'
import { HbarIcon } from '@/components/ui/HbarIcon'
import { ChevronLeft, Lock, Heart, ChevronRight, Wallet, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import MintConfirmationModal from './MintConfirmationModal'
import MintProcessingModal from './MintProcessingModal'
import MintSuccessModal from './MintSuccessModal'
import { useAppDispatch, useAppSelector } from '@/redux/hook'
import { createTransaction } from '@/redux/slices/transactionSlice'

interface MintComicModalProps {
  title: string
  issueNumber: number
  author: {
    name: string
    avatar: string
  }
  coverImage: string
  description: string
  tags: string[]
  price?: number | string
  activeTab?: string
  onTabChange?: (tab: string) => void
  onBack?: () => void
  comicId?: string
  isWalletConnected?: boolean
  walletAddress?: string
  onMintComic?: () => void
  onAddToFavourite?: () => void
  onConnectWallet?: () => void
}

const MintComicModal: React.FC<MintComicModalProps> = ({
  title,
  walletAddress: walletAddressProp,
  issueNumber,
  author,
  coverImage,
  description,
  tags,
  price = '0.09 H',
  activeTab = 'details',
  onTabChange,
  onBack,
  comicId = '1'
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentComic, isLoading } = useAppSelector((state: any) => state.comic);
   const {user} = useAppSelector((state:any) => state.wallet);
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showConnectWallet, setShowConnectWallet] = useState(false)
  const [transactionHash, setTransactionHash] = useState('')
  const [editionNumber, setEditionNumber] = useState('#1,001')
  const [isMinting, setIsMinting] = useState(false)
  const [favourites, setFavourites] = useState(false)
  
  // Wallet states
  
  const [isWalletConnected, setIsWalletConnected] = useState(!!walletAddressProp)
  const [walletAddress, setWalletAddress] = useState(walletAddressProp || '')

  // Handle Connect Wallet
  const handleConnectWallet = () => {
    setIsWalletConnected(true)
    setWalletAddress(walletAddressProp || '')
    setShowConnectWallet(false)
  }

  // Disconnect Wallet
  const handleDisconnectWallet = () => {
    setIsWalletConnected(false)
    setWalletAddress('')
  }

  //  Mint Comic button click
  const handleMintClick = () => {
    if (!isWalletConnected) {
      handleConnectWallet()
    }
    
    setShowConfirmModal(true)
  }

  //confirm mint
  const handleConfirmMint = async () => {
    setShowConfirmModal(false)
    setShowProcessingModal(true)
    setIsMinting(true)

    const transaction = await dispatch(createTransaction({
      comicId:comicId,
      "walletAddress": user?.walletAddress || '',
      "txHash": currentComic?.nftId?.transactionId || "",
      "price": currentComic?.nftId?.price || 0,
      "currency": "HBAR"
    } as any));
    console.log('Transaction recorded in backend:', transaction);
    
    setTimeout(() => {
      setTransactionHash(currentComic?.nftId?.transactionId || "")
      setEditionNumber(currentComic?.episodeNumber || "1")
      setShowProcessingModal(false)
      setShowSuccessModal(true)
      setIsMinting(false)
    }, 1000)

  }

  //  view comic after success
  const handleViewComic = () => {
    setShowSuccessModal(false)
    router.push(`/reader?id=${comicId}`)
  }

  //  add to favourite
  const handleAddToFavourite = () => {
    setFavourites(true);
  }

  //  back button
  const handleBack = () => {
    router.push(`/marketplace`)
  }

  // tab change
  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans selection:bg-orange-500 selection:text-white pb-20">
        {/*  HERO SECTION  */}
        <div className="relative w-full overflow-hidden mb-10">
          {/* Background Blur Effect */}
          <div className="absolute inset-0 z-0">
            <img
              src={coverImage}
              alt="Background Blur"
              className="w-full h-full object-cover blur-2xl scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b opacity-90 from-[#0a0a0a]/60 via-[#0a0a0a]/90 to-[#0a0a0a]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center text-[#fff]/70 space-x-2 bg-[#000] backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-[#000]/70 transition-colors mb-8 text-sm font-medium"
            >
              <ChevronLeft size={16} />
              <span>Back to Marketplace</span>
            </button>

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
              {/* Cover Image */}
              <div className="w-full md:w-[320px] shrink-0 group perspective">
                <div className="relative rounded-xl w-[279px] h-[356px] overflow-hidden shadow-2xl shadow-black/50 transition-transform duration-300 hover:scale-[1.02]">
                  <img
                    src={coverImage}
                    alt="Avatar Cover"
                    className="w-[279px] h-[356px] object-cover border border-white/5"
                  />
                </div>
              </div>

              {/* Hero Info */}
              <div className="flex-1 pb-2 flex flex-col">
                <h1 className="text-3xl font-mono font-bold text-white mb-2 flex gap-2 items-center tracking-tight">
                  {title}
                
                </h1>

                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex font-mono items-center space-x-2">
                    <div className="w-8 h-8 rounded-sm bg-blue-600 overflow-hidden border border-white/10">
                      <img
                        src={author.avatar}
                        alt="creator"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="flex flex-col text-sm text-white/60">
                      <p className="leading-none text-[10px] tracking-wider">
                        Creator
                      </p>
                      <strong className="text-white">{author.name}</strong>
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 font-mono py-1.5 rounded-lg bg-[#000] border border-white/5 text-xs text-white/70 font-medium hover:bg-[#000]/70 cursor-default transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Price Display */}
                <div className="mb-4">
                  <div className="text-white/70 text-xs mb-1">Price</div>
                  <div className="text-white text-xl font-bold flex items-center gap-1">
                    {currentComic?.nftId?.price?.toFixed(2) || price}
                    <HbarIcon size={14} className="opacity-70" />
                  </div>
                </div>

                {/* Wallet Status Section */}
                <div className="mb-4">
                  {isWalletConnected ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                        <Wallet className="w-4 h-4 text-green-400" />
                        <span className="text-white text-sm">{walletAddress}</span>
                        <button 
                          onClick={handleDisconnectWallet}
                          className="text-white/60 hover:text-white ml-2"
                          title="Disconnect Wallet"
                        >
                          <LogOut className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowConnectWallet(true)}
                      className="text-white/60 text-sm hover:text-white transition-colors"
                    >
                      Connect your wallet to mint this comic
                    </button>
                  )}
                </div>

                {/* Action Buttons*/}
                <div className="flex gap-3 md:gap-4 font-mono max-w-md">
                  <button 
                    onClick={handleMintClick}
                    disabled={isMinting}
                    className="flex-1 bg-[#FAA31E] text-black font-bold py-2 px-1 md:py-2 md:px-1 rounded-full hover:brightness-110 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <span>{isMinting ? 'Minting...' : 'Mint Comic'}</span>
                    {!isMinting && <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />}
                  </button>
                  <button
                    onClick={handleAddToFavourite}
                    className="flex-1 bg-transparent border border-white text-white font-medium py-2 px-1 md:py-2 md:px-1 rounded-full hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <Heart className={`w-3 h-3 md:w-4 md:h-4 ${favourites ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{favourites ? 'Favourited' : 'Add to favourite'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*  MAIN CONTENT GRID */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-20">
          {/* Tabs */}
          <div className="flex space-x-1 bg-[#151515] font-mono p-1 rounded-full w-fit mb-8 border border-white/5">
            <button 
              onClick={() => handleTabChange('details')}
              className={`px-6 py-2 rounded-full text-sm transition-all ${
                activeTab === 'details' 
                  ? 'bg-[#FAA31E] text-[#000] font-bold shadow-md' 
                  : 'text-white hover:text-white/70 font-medium'
              }`}
            >
              Comic Details
            </button>
            <button 
              onClick={() => handleTabChange('activity')}
              className={`px-6 py-2 rounded-full text-sm transition-all ${
                activeTab === 'activity' 
                  ? 'bg-[#FAA31E] text-[#000] font-bold shadow-md' 
                  : 'text-white hover:text-white/70 font-medium'
              }`}
            >
              Activity
            </button>
          </div>

          <div className="grid grid-cols-1 text-white/70 font-mono lg:grid-cols-12 gap-6">
            {/* Details or Activity */}
            <div className="lg:col-span-7 space-y-6">
              {activeTab === 'details' ? (
                <>
                  {/* About Card */}
                  <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8">
                    <h3 className="text-xl font-medium mb-4">About</h3>
                    <p className="leading-relaxed text-sm md:text-base">
                      {description}
                    </p>
                  </div>

                  {/* Episode List */}
                  <div className="bg-[#111] border text-white/70 font-mono border-white/5 rounded-2xl p-6 md:p-8">
                    <h3 className="text-xl font-medium mb-6">Episode List</h3>
                    <div className="space-y-4">
                      {(currentComic?.chapters || []).length > 0 ? (
                        currentComic.chapters.map((chapter: any, idx: number) => (
                          <div
                            key={chapter._id || idx}
                            className="flex items-center justify-between group cursor-pointer"
                          >
                            <div className="flex items-center space-x-3 group-hover:text-orange-400 transition-colors">
                              <span className="font-mono text-sm">
                                Episode {chapter.chapterNumber || idx + 1} :
                              </span>
                              <span className="font-medium">{chapter.title || `Chapter ${chapter.chapterNumber}`}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] bg-[#1a1a1a] border border-white/10 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                                Open
                              </span>
                              <Lock size={12} className="text-yellow-500" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-white/40 text-sm">No episodes available yet.</p>
                      )}
                    </div>
                  </div>

                  {/* About Creator */}
                  <div className="bg-[#111] border text-white/70 font-mono border-white/5 rounded-2xl p-6 md:p-8">
                    <h3 className="text-xl font-medium mb-4">About Creator</h3>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center overflow-hidden">
                        <img
                          src={author.avatar}
                          alt="creator"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-bold text-white">{author.name}</span>
                    </div>
                    <p className="leading-relaxed text-sm">
                      {author.name} is a creator dedicated to pushing the boundaries of digital art and interactive narratives.
                    </p>
                  </div>
                </>
              ) : (
                /* ACTIVITY TAB CONTENT */
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8">
                  <h3 className="text-xl font-medium mb-4">Live Activity</h3>
                  <p className="text-white/60 text-sm mb-5">
                    See who is minting, listing and trading this comic
                  </p>
                  
                  {/* Activity Table - Horizontal scroll on mobile */}
                  <div className="overflow-x-auto md:overflow-visible">
                    <table className="w-full min-w-[600px] md:min-w-0">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-white/60 text-xs font-medium pb-3 px-2">Username</th>
                          <th className="text-left text-white/60 text-xs font-medium pb-3 px-2">Event</th>
                          <th className="text-left text-white/60 text-xs font-medium pb-3 px-2">Price</th>
                          <th className="text-left text-white/60 text-xs font-medium pb-3 px-2">Edition</th>
                          <th className="text-left text-white/60 text-xs font-medium pb-3 px-2">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-white/40 text-sm">
                            No activity yet.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN Stats */}
            <div className="lg:col-span-5 space-y-6">
              {/* Minting Details */}
              <div className="bg-[#111] border text-white/70 font-mono border-white/5 rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-medium mb-6">Minting Details</h3>

                <div className="grid grid-cols-3 gap-6 mb-6 border-b border-white/5 pb-6">
                  <div>
                    <p className="text-xs mb-1">Mint Price</p>
                    <p className="flex text-lg items-center font-bold text-white">
                      <span>{currentComic?.nftId?.price?.toFixed(2) || price}</span>
                      <HbarIcon size={14} className="opacity-70" />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1">Editions</p>
                    <p className="text-lg font-bold text-white">{currentComic?.nftId?.maxSupply?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Royalties</p>
                    <p className="text-lg font-bold text-white">
                      {currentComic?.nftId?.royaltyPercentage || 0}% <span className="text-sm font-normal">to creator</span>
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs mb-1">Blockchain</p>
                  <p className="text-lg font-bold text-white">Hedera</p>
                </div>
              </div>

              {/* Market Stats */}
              <div className="bg-[#111] border text-white/70 font-mono border-white/5 rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-medium mb-6">Market Stats</h3>

                <div className="grid grid-cols-3 gap-y-8 gap-x-4">
                  <div>
                    <p className="text-xs mb-1">Floor Price</p>
                    <div className="flex text-lg items-center font-bold text-white">
                      <p>{currentComic?.nftId?.price ? (currentComic.nftId.price * 0.94).toFixed(3) : '0'}</p>
                      <HbarIcon size={14} className="opacity-70" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs mb-1">Total Mints</p>
                    <p className="text-lg font-bold text-white">{currentComic?.nftId?.currentSupply || 0} / {currentComic?.nftId?.maxSupply?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1">Volume</p>
                    <div className="flex text-lg items-center font-bold text-white">
                      <p>{currentComic?.nftId?.price && currentComic?.nftId?.currentSupply ? (currentComic.nftId.price * currentComic.nftId.currentSupply).toFixed(1) : '0'}</p>
                      <HbarIcon size={14} className="opacity-70" />
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-xs mb-1">Collectors</p>
                    <p className="text-lg font-bold text-white">{currentComic?.nftId?.currentSupply ? Math.floor(currentComic.nftId.currentSupply * 0.54) : 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*  MORE FROM ADVENTURE  */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">
              More from Adventure
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <p className="text-white/40 text-sm col-span-3">No related comics found.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connect Wallet Modal */}
      {showConnectWallet && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative bg-[#1A1A1A] rounded-3xl max-w-md w-full overflow-hidden border border-white/10 shadow-2xl">
            <div className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-white mb-3">
                Connect Wallet
              </h2>
              
              <p className="text-white/70 text-sm mb-8 leading-relaxed">
                Connect your wallet to mint this comic and manage your NFTs.
              </p>

              <div className="space-y-3 mb-6">
                <button
                  onClick={handleConnectWallet}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-3"
                >
                  <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                    <HbarIcon size={20} />
                  </div>
                  <span>Hedera HashPack</span>
                </button>
                
                <button
                  onClick={handleConnectWallet}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-3"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">M</span>
                  </div>
                  <span>MetaMask</span>
                </button>
              </div>

              <button
                onClick={() => setShowConnectWallet(false)}
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MINTING MODALS */}
      <MintConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmMint}
        comicTitle={title}
        coverImage={coverImage}
        price={price.toString()}
        walletAddress={walletAddress}
        edition="1 of 1000"
      />
      
      <MintProcessingModal
        isOpen={showProcessingModal}
        transactionHash={transactionHash}
      />
      
      <MintSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onViewComic={handleViewComic}
        comicTitle={title}
        coverImage={coverImage}
        editionNumber={editionNumber}
        transactionHash={transactionHash}
        price={price.toString()}
      />
    </>
  )
}

export default MintComicModal
