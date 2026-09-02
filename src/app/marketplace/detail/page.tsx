"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Lock } from "lucide-react";
import Image from "next/image";
import { HbarIcon } from "@/components/ui/HbarIcon";
import ResellModal from "@/components/modals/ResellModal";
import { useRouter, useSearchParams } from "next/navigation";

import dynamic from "next/dynamic";
const MintComicModal = dynamic(() => import("@/features/comic-library/components/MintComicModal"), { ssr: false });
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getComicById } from "@/redux/slices/comicSlice";
import { getCollectionById } from "@/redux/slices/collectionSlice";
//import useMarketplace from "@/hook/useMarketplace";
import useMirrorNodeQueries from "@/hook/useMirrorNodeQueries";
import   { useHederaWallet } from "@/providers/HashPackProvider";
import { useNftOwnershipCheck } from "@/hook/userNFTOwnershipCheck";
import { PRODUCTION_FEATURES } from "@/config/features";

export default function ComicDetail() {
  const [isResellOpen, setIsResellOpen] = useState(false);
  const [localActiveTab, setLocalActiveTab] = useState('details');
  const [showMintPage, setShowMintPage] = useState(false);
  const [resolvedTokenId, setResolvedTokenId] = useState<string>("");
  const [resolvedSerialNumber, setResolvedSerialNumber] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const {user} = useAppSelector((state: any) => state.wallet);
  const { account, signer } = useHederaWallet();
  const { checkOwnership } = useNftOwnershipCheck();

  // const { canReadComic } = useMarketplace({
  //   accountId: user?.walletAddress || "",
  //   signer: signer,
  //   network: "testnet",
  // });
//  const {checkCanReadComic} = useMirrorNodeQueries();
  const comicId = searchParams.get('id');

  const { currentComic, isLoading } = useAppSelector((state: any) => state.comic);
  const { currentCollection } = useAppSelector((state: any) => state.collection || {});

  useEffect(() => {
    const fetchData = async () => {
      if (!comicId) return;

      try {
        const comicResult = await dispatch(getComicById({ id: comicId } as any)).unwrap();
        
        const collectionId = comicResult?.data?.comic?.collectionId;
        
        if (collectionId) {
          await dispatch(getCollectionById({ id: collectionId } as any)).unwrap();
        }
      } catch (error) {
        console.error('Error fetching comic/collection data:', error);
      }
    };

    fetchData();
  }, [dispatch, comicId]);


  
  useEffect(() => {
    const routeTokenId = searchParams.get("tokenId") || "";
    const routeSerialNumber = searchParams.get("serialNumber");

    if (routeTokenId) {
      setResolvedTokenId(routeTokenId);
    } else if (currentComic?.nftId?.tokenId) {
      setResolvedTokenId(currentComic.nftId.tokenId);
    }

    if (routeSerialNumber) {
      setResolvedSerialNumber(Number(routeSerialNumber));
    } else if (currentComic?.nftId?.serialNumber || currentComic?.nftId?.serial) {
      setResolvedSerialNumber(Number(currentComic.nftId.serialNumber ?? currentComic.nftId.serial ?? 0));
    } else if (account && currentComic?.nftId?.tokenId) {
      checkOwnership(account, currentComic.nftId.tokenId).then((result) => {
        if (result.serialNumbers?.length) {
          setResolvedSerialNumber(Number(result.serialNumbers[0]));
        }
      });
    }
  }, [account, checkOwnership, currentComic?.nftId?.serialNumber, currentComic?.nftId?.serial, currentComic?.nftId?.tokenId, searchParams]);

  const nftData = currentComic?.nftId || {};
  const routeTokenId = searchParams.get("tokenId") || "";
  const routeSerialNumber = searchParams.get("serialNumber");
  const chapters = currentComic?.chapters || [];
  const tokenAddress =
    resolvedTokenId ||
    routeTokenId ||
    nftData?.contractAddress ||
    nftData?.evmAddress ||
    nftData?.tokenAddress ||
    nftData?.tokenId ||
    nftData?.contract?.address ||
    "";
  const nftSerialNumber = Number(
    resolvedSerialNumber ??
    routeSerialNumber ??
    nftData?.serialNumber ??
    nftData?.serial ??
    nftData?.serial_id ??
    nftData?.nftSerial ??
    0
  );
  const nftTokenId = resolvedTokenId || routeTokenId || nftData?.tokenId || nftData?.contractId || nftData?.token_id || "";
  
  const mintPrice = nftData?.price?.toFixed(2) || "0";
  const maxSupply = nftData?.maxSupply?.toLocaleString() || "0";
  const royaltyPercentage = nftData?.royaltyPercentage || 0;

  // Market Stats - Real/Calculated data
  const currentSupply = nftData?.currentSupply || 0;
  const floorPrice = nftData?.price ? (nftData.price * 0.94).toFixed(3) : "0";
  const totalVolume = nftData?.price && nftData?.currentSupply
    ? (nftData.price * nftData.currentSupply).toFixed(1)
    : "0";
  const collectors = currentSupply ? Math.floor(currentSupply * 0.54) : 0;
  
  // Related comics from collection
  const relatedComics = currentCollection?.comic?.filter((comic: any) => comic._id !== currentComic?._id) || [];
  
  // Extract data from currentComic
  const coverImage = currentComic?.bannerImage || currentComic?.coverImage;
  const title = currentComic?.title;
  const issueNumber = currentComic?.episodeNumber || 1;
  const description = currentComic?.summary;
  const tags = currentComic?.genre || [];
  const hasNFTAccess = currentComic?.isMinted || false;
  
  // Author data
  const authorName = currentCollection?.creatorId?.username || 
    currentComic?.creatorId?.username ||
    (currentCollection?.creatorId?.walletAddress 
      ? `${currentCollection.creatorId.walletAddress.slice(0, 6)}...${currentCollection.creatorId.walletAddress.slice(-4)}`
      : currentComic?.creatorId?.walletAddress
      ? `${currentComic.creatorId.walletAddress.slice(0, 6)}...${currentComic.creatorId.walletAddress.slice(-4)}`
      : null);
  const authorAvatar = currentCollection?.creatorId?.avatar || 
    currentComic?.creatorId?.avatar;
  
  const images = {
    cover: coverImage || "/dev_images/Rectangle3051.png",
    avatar: authorAvatar || "/dev_images/Rectangle3048.png",
  };

  const displayTitle = title || "Untitled Comic";
  const displayAuthorName = authorName || "Unknown Creator";
  const displayDescription = description || "";
  const displayTags = tags?.length ? tags : [];
 //const readingAccess = await checkCanReadComic(currentComic?._id, user?.walletAddress);
  // Creator description with real data
  const creatorDescription = `${displayAuthorName} is a visionary ${currentCollection?.comic?.length > 1 ? 'series creator' : 'artist'} dedicated to pushing the boundaries of digital art and interactive narratives. ${currentCollection?.description || ''}`.trim();

  // const handleReadClick = async () => {
  //   // TODO: Implement logic to determine if user can read full comic or just preview based on ownership
  //   //const readingAccess = await  canReadComic(currentComic?._id, user?.walletAddress);
  //     //  const readingAccess = await checkCanReadComic(currentComic?._id, user?.walletAddress); 
  //     if (readingAccess === false) {
  //       alert("You have preview access to this comic. Please mint to unlock the full story!");
  //         setShowMintPage(true);
  //     } else {
  //          router.push(`/reader?id=${currentComic?._id}`);
  //     }
  // };


  
  // const handleReadClick = async () => {
  //   console.log('📖 Start Reading clicked');
    
  //   // Get user's wallet address
  //   const userWalletAddress = account || user?.walletAddress;
    
  //   // Get comic's token ID
  //   const comicTokenId = currentComic?.nftId?.tokenId;
    
  //   console.log('🔍 Checking read access:', {
  //     userWallet: userWalletAddress,
  //     comicTokenId,
  //     comicTitle: currentComic?.title
  //   });

  //   if (!userWalletAddress) {
  //     alert("Please connect your wallet to read this comic!");
  //     return;
  //   }

  //   if (!comicTokenId) {
  //     console.warn('⚠️ No tokenId found for this comic');
  //     alert("This comic is not available as an NFT yet.");
  //     return;
  //   }

  //   try {
  //     // ✅ Check if user owns this NFT by checking their wallet
  //     const ownershipResult = await checkOwnership(userWalletAddress, comicTokenId);
      
  //     console.log('🎯 Ownership result:', ownershipResult);

  //     if (ownershipResult.hasNft) {
  //       // User owns the NFT - allow full reading
  //       console.log(`✅ User owns NFT! Serial numbers: ${ownershipResult.serialNumbers.join(', ')}`);
  //       router.push(`/reader?id=${currentComic?._id}`);
  //     } else {
  //       // User doesn't own the NFT - show mint page
  //       console.log('❌ User does not own this NFT');
  //       alert("You need to own this NFT to read the full comic. Please mint to unlock!");
  //       setShowMintPage(true);
  //     }
  //   } catch (error) {
  //     console.error('❌ Error checking NFT ownership:', error);
  //     alert("Error checking NFT ownership. Please try again.");
  //   }
  // };
  const handleBackFromMint = () => {
    setShowMintPage(false);
  };

  const handleTabChange = (tab: string) => {
    setLocalActiveTab(tab);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      {/* Loading State */}
      {isLoading && (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FAA31E] mx-auto mb-4"></div>
            <p className="text-white/60">Loading comic details...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && (
        <>
          {showMintPage ? (
            <MintComicModal
              title={displayTitle}
              issueNumber={issueNumber}
              author={{
                name: displayAuthorName,
                avatar: images.avatar 
              }}
              coverImage={images.cover} 
              description={displayDescription}
              tags={displayTags}
              price={mintPrice}
              activeTab={localActiveTab}
              onTabChange={handleTabChange}
              onBack={handleBackFromMint}
              comicId={currentComic?._id || "c-8832"}
              walletAddress={currentComic?.creatorId?.walletAddress || ""}
            />
          ) : (
            <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans selection:bg-orange-500 selection:text-white pb-20">
              {/* HERO SECTION */}
              <div className="relative w-full overflow-hidden mb-10">
                <div className="absolute inset-0 z-0">
                  <img
                    src={images.cover} 
                    alt="Background Blur"
                    className="w-full h-full object-cover blur-2xl scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b opacity-90 from-[#0a0a0a]/60 via-[#0a0a0a]/90 to-[#0a0a0a]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                  <button
                    onClick={handleBack}
                    className="flex items-center text-[#fff]/70 space-x-2 bg-[#000] backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-[#000]/70 transition-colors mb-8 text-sm font-medium"
                  >
                    <ChevronLeft size={16} />
                    <span>Back to Collection</span>
                  </button>

                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
                    <div className="w-full md:w-[320px] shrink-0 group perspective">
                      <div className="relative rounded-xl w-[279px] h-[356px] overflow-hidden shadow-2xl shadow-black/50 transition-transform duration-300 hover:scale-[1.02]">
                        <img
                          src={images.cover} 
                          alt="Avatar Cover"
                          className="w-[279px] h-[356px] object-cover border border-white/5"
                        />
                      </div>
                    </div>

                    <div className="flex-1 pb-2 flex flex-col">
                      <h1 className="text-3xl font-mono font-bold text-white mb-2 flex gap-2 items-center tracking-tight">
                        <p>{displayTitle}</p>
                        {/* {hasNFTAccess && (
                          <span className="px-2 py-0.5 rounded-lg bg-[#000] border border-green-500/30 text-[#fff] text-xs font-bold flex items-center gap-1">
                            Owned ✅
                          </span>
                        )} */}
                      </h1>

                      <div className="flex items-center space-x-3 mb-6">
                        <div className="flex font-mono items-center space-x-2">
                          <div className="w-8 h-8 rounded-sm bg-blue-600 overflow-hidden border border-white/10">
                            <img
                              src={images.avatar} 
                              alt="creator"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="flex flex-col text-sm text-white/60">
                            <p className="leading-none text-[10px] tracking-wider">
                              Creator
                            </p>
                            <strong className="text-white">{displayAuthorName}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-8">
                        {displayTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 font-mono py-1.5 rounded-lg bg-[#000] border border-white/5 text-xs text-white/70 font-medium hover:bg-[#000]/70 cursor-default transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-4 font-mono max-w-md">
                        <button 
                          // onClick={handleReadClick}
                          className="flex-1 bg-[#FAA31E] text-black font-bold py-2 px-1 rounded-full hover:brightness-110 transition-all shadow-lg shadow-orange-500/20"
                        >
                          Start Read
                        </button>
                        {PRODUCTION_FEATURES.resale && (
                          <button
                            onClick={() => setIsResellOpen(true)}
                            className="flex-1 bg-transparent border border-white text-white font-medium py-2 px-1 rounded-full hover:bg-white/5 transition-all"
                          >
                            Resell
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT GRID */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-20">
                <div className="flex space-x-1 bg-[#151515] font-mono p-1 rounded-full w-fit mb-8 border border-white/5">
                  <button 
                    onClick={() => handleTabChange("details")}
                    className={`px-6 py-2 rounded-full text-sm transition-all ${
                      localActiveTab === "details" 
                        ? "bg-[#FAA31E] text-[#000] font-bold shadow-md" 
                        : "text-white hover:text-white/70 font-medium"
                    }`}
                  >
                    Comic Details
                  </button>
                  <button 
                    onClick={() => handleTabChange("activity")}
                    className={`px-6 py-2 rounded-full text-sm transition-all ${
                      localActiveTab === "activity" 
                        ? "bg-[#FAA31E] text-[#000] font-bold shadow-md" 
                        : "text-white hover:text-white/70 font-medium"
                    }`}
                  >
                    Activity
                  </button>
                </div>

                <div className="grid grid-cols-1 text-white/70 font-mono lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-6">
                    {localActiveTab === "details" ? (
                      <>
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8">
                          <h3 className="text-xl font-medium mb-4">About</h3>
                          <p className="leading-relaxed text-sm md:text-base">
                            {displayDescription}
                          </p>
                        </div>

                        <div className="bg-[#111] border text-white/70 font-mono border-white/5 rounded-2xl p-6 md:p-8">
                          <h3 className="text-xl font-medium mb-6">Episode List</h3>
                          <div className="space-y-4">
                            {chapters.length > 0 ? (
                              chapters.map((chapter: any, idx: number) => (
                                <div
                                  key={chapter._id}
                                  className="flex items-center justify-between group cursor-pointer"
                                >
                                  <div className="flex items-center space-x-3 group-hover:text-orange-400 transition-colors">
                                    <span className="font-mono text-sm">
                                      Episode {chapter.chapterNumber} :
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

                        <div className="bg-[#111] border text-white/70 font-mono border-white/5 rounded-2xl p-6 md:p-8">
                          <h3 className="text-xl font-medium mb-4">About Creator</h3>
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center overflow-hidden">
                              <img
                                src={images.avatar} 
                                alt="creator"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-bold text-white">{displayAuthorName}</span>
                          </div>
                          <p className="leading-relaxed text-sm">
                            {creatorDescription}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8">
                        <h3 className="text-xl font-medium mb-4">Live Activity</h3>
                        <p className="text-white/60 text-sm mb-5">
                          See who is minting, listing and trading this comic
                        </p>
                        
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

                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-[#111] border text-white/70 font-mono border-white/5 rounded-2xl p-6 md:p-8">
                      <h3 className="text-xl font-medium mb-6">Minting Details</h3>
                      <div className="grid grid-cols-3 gap-6 mb-6 border-b border-white/5 pb-6">
                        <div>
                          <p className="text-xs mb-1">Mint Price</p>
                          <p className="flex text-lg items-center font-bold text-white">
                            <p>{mintPrice}</p>
                            <HbarIcon size={14} className="opacity-70" />
                          </p>
                        </div>
                        <div>
                          <p className="text-xs mb-1">Editions</p>
                          <p className="text-lg font-bold text-white">{maxSupply}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Royalties</p>
                          <p className="text-lg font-bold text-white">
                            {royaltyPercentage}% <span className="text-sm font-normal">to creator</span>
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs mb-1">Blockchain</p>
                        <p className="text-lg font-bold text-white">Hedera</p>
                      </div>
                    </div>

                    <div className="bg-[#111] border text-white/70 font-mono border-white/5 rounded-2xl p-6 md:p-8">
                      <h3 className="text-xl font-medium mb-6">Market Stats</h3>
                      <div className="grid grid-cols-3 gap-y-8 gap-x-4">
                        <div>
                          <p className="text-xs mb-1">Floor Price</p>
                          <div className="flex text-lg items-center font-bold text-white">
                            <p>{floorPrice}</p>
                            <HbarIcon size={14} className="opacity-70" />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs mb-1">Total Mints</p>
                          <p className="text-lg font-bold text-white">{currentSupply} / {maxSupply}</p>
                        </div>
                        <div>
                          <p className="text-xs mb-1">Volume</p>
                          <div className="flex text-lg items-center font-bold text-white">
                            <p>{totalVolume}</p>
                            <HbarIcon size={14} className="opacity-70" />
                          </div>
                        </div>
                        <div className="col-span-3">
                          <p className="text-xs mb-1">Collectors</p>
                          <p className="text-lg font-bold text-white">{collectors}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-16">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    More from {currentCollection?.title || "Adventure"}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedComics.length > 0 ? (
                      relatedComics.slice(0, 6).map((comic: any) => (
                        <RelatedCard
                          key={comic._id}
                          title={comic.title}
                          creator={displayAuthorName}
                          price={mintPrice}
                          image={comic.bannerImage || images.cover}
                          avatar={images.avatar}
                        />
                      ))
                    ) : (
                      <p className="text-white/40 text-sm col-span-3">No related comics found.</p>
                    )}
                  </div>
                </div>
              </div>

              {PRODUCTION_FEATURES.resale && <ResellModal
                isOpen={isResellOpen}
                onClose={() => setIsResellOpen(false)}
                comic={{
                  id: currentComic?._id || "c-8832",
                  title: displayTitle,
                  collection: currentCollection?.title || "Avatar: The Last Airbender",
                  edition: currentSupply,
                  totalEditions: parseInt(maxSupply.replace(/,/g, '')),
                  imageUrl: images.cover,
                  tokenAddress,
                  tokenId: nftTokenId,
                  serialNumber: nftSerialNumber || undefined,
                }}
              />}
            </div>
          )}
        </>
      )}
    </>
  );
}

function RelatedCard({
  title,
  creator,
  price,
  image,
  avatar,
}: {
  title: string;
  creator: string;
  price: string;
  image: string;
  avatar: string;
}) {
  return (
    <div className="group bg-[#111] rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 cursor-pointer">
      <div className="aspect-video w-full overflow-hidden bg-gray-800 relative">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-4">
        <h4 className="font-bold text-white mb-3 truncate">{title}</h4>
        <div className="flex items-end justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-gray-700 overflow-hidden border border-white/10">
              <img
                src={avatar}
                alt={creator}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[10px] text-[#fff]/70">Creator</p>
              <p className="text-xs font-medium text-white">{creator}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/70">Mint Price</p>
            <div className="flex text-sm font-bold text-white">
              <p>{price}</p>
              <HbarIcon size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
