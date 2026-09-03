"use client";

import React, { useState } from "react";
import { ChevronLeft, Lock } from "lucide-react";
import Image from "next/image";
import { HbarIcon } from "@/components/ui/HbarIcon";
import ResellModal from "@/components/modals/ResellModal";
import { useRouter } from "next/navigation";
import { ACTIVITY_DATA } from "@/components/utils/dummy-data";
import dynamic from "next/dynamic";
import { PRODUCTION_FEATURES } from "@/config/features";
const MintComicModal = dynamic(() => import("@/features/comic-library/components/MintComicModal"), { ssr: false });

// PROPS INTERFACE FOR BACKWARD COMPATIBILITY
interface ComicIssue {
  id: string
  title: string
  image: string
  date: string
  isFree?: boolean
}

interface ComicDetailProps {
  title: string
  issueNumber: number
  author: {
    name: string
    avatar: string
  }
  coverImage: string
  description: string
  tags: string[]
  isFree?: boolean
  publishType?: string
  price?: number | string
  isVerifyingAccess?: boolean
  hasNFTAccess?: boolean | null
  issueDetails: {
    creators: string
    pages: number
    publisher: string
    publicationDate: string
  }
  otherIssues: ComicIssue[]
  activeTab?: string
  onTabChange?: (tab: string) => void
  onBack?: () => void
  onReadIssue?: () => void
  onResell?: () => void
  onPreviewIssue?: () => void
  onEnlargeCover?: () => void
}

export default function ComicDetail({
  title,
  issueNumber,
  author,
  coverImage,
  description,
  tags,
  isFree = false,
  publishType = 'free',
  price = 0,
  isVerifyingAccess = false,
  hasNFTAccess = null,
  issueDetails,
  otherIssues,
  activeTab = 'details',
  onTabChange,
  onBack,
  onReadIssue,
  onResell,
  onPreviewIssue,
  onEnlargeCover
}: ComicDetailProps) {
  const [isResellOpen, setIsResellOpen] = useState(false);
  const [localActiveTab, setLocalActiveTab] = useState(activeTab);
  const [showMintPage, setShowMintPage] = useState(false);
  const router = useRouter();

  
  const images = {
    cover: "/dev_images/Rectangle3051.png", 
    avatar: "/dev_images/Rectangle3048.png", 
    inosuke: "/dev_images/Image2.png",
    cross: "/dev_images/Group427320759.png",
    mj: "/dev_images/Grouup9.png",
  };

  // Use props for text content
  const displayTitle = title || "Avatar -Book of Beginnings #1";
  const displayAuthorName = author?.name || "Studio Kyra";
  const displayDescription = description || "In a world torn between the elements, a young avatar rises to restore balance – not by choice, but by destiny. 'Book of Beginnings' marks the first chapter of the Avatar Chronicles, where every mint helps since the legend.";
  const displayTags = tags?.length ? tags : ["Fantasy", "Adventure", "On-chain Epic"];

  //  Start Read button
  const handleReadClick = () => {
    setShowMintPage(true);
  };

  //  back from mint page
  const handleBackFromMint = () => {
    setShowMintPage(false);
  };

  //  tab change
  const handleTabChange = (tab: string) => {
    setLocalActiveTab(tab);
    onTabChange?.(tab);
  };

  // back button
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // SHOW MINT PAGE
  return (
    <>
      {showMintPage ? (
        // MINT COMIC MODAL 
        <MintComicModal
          title={displayTitle}
          issueNumber={issueNumber || 1}
          author={{
            name: displayAuthorName,
            avatar: images.avatar 
          }}
          coverImage={images.cover} 
          description={displayDescription}
          tags={displayTags}
          price={price.toString() || "0.09 H"}
          activeTab={localActiveTab}
          onTabChange={handleTabChange}
          onBack={handleBackFromMint}
          comicId="c-8832"
        />
      ) : (
        // COMIC DETAIL PAGE 
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
                    <span className="px-2 py-0.5 rounded-lg bg-[#000] border border-green-500/30 text-[#fff] text-xs font-bold flex items-center gap-1">
                      Owned ✅
                    </span>
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
                      onClick={handleReadClick}
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
                        {[
                          { title: "The First Flame", status: "Open" },
                          { title: "Whispers of the Wind", status: "Open" },
                          { title: "Echoes Beneath the Earth", status: "Open" },
                        ].map((ep, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between group cursor-pointer"
                          >
                            <div className="flex items-center space-x-3 group-hover:text-orange-400 transition-colors">
                              <span className="font-mono text-sm">
                                Episode {idx + 1} :
                              </span>
                              <span className="font-medium">{ep.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] bg-[#1a1a1a] border border-white/10 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                                {ep.status}
                              </span>
                              <Lock size={12} className="text-yellow-500" />
                            </div>
                          </div>
                        ))}
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
                        Studio Kyra is a visionary team of artists and storytellers
                        dedicated to pushing the boundaries of digital art and
                        interactive narratives.
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
                          {ACTIVITY_DATA.map((activity, index) => (
                            <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-3 px-2">
                                <span className="text-white text-sm font-medium">{activity.username}</span>
                              </td>
                              <td className="py-3 px-2">
                                <span className="text-white text-sm font-medium">{activity.event}</span>
                              </td>
                              <td className="py-3 px-2">
                                <span className="text-white text-sm font-medium flex items-center gap-1">
                                  {activity.price}
                                  <HbarIcon size={14} />
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                <span className="text-white text-sm font-medium">{activity.edition}</span>
                              </td>
                              <td className="py-3 px-2">
                                <span className="text-white/60 text-sm">{activity.time}</span>
                              </td>
                            </tr>
                          ))}
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
                        <p>0.09</p>
                        <HbarIcon size={14} className="opacity-70" />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1">Editions</p>
                      <p className="text-lg font-bold text-white">1,000</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Royalties</p>
                      <p className="text-lg font-bold text-white">
                        7% <span className="text-sm font-normal">to creator</span>
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
                        <p>0.085</p>
                        <HbarIcon size={14} className="opacity-70" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs mb-1">Total Mints</p>
                      <p className="text-lg font-bold text-white">721 / 1,000</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1">Volume</p>
                      <div className="flex text-lg items-center font-bold text-white">
                        <p>45.8</p>
                        <HbarIcon size={14} className="opacity-70" />
                      </div>
                    </div>
                    <div className="col-span-3">
                      <p className="text-xs mb-1">Collectors</p>
                      <p className="text-lg font-bold text-white">389</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16">
              <h2 className="text-2xl font-bold text-white mb-6">
                More from Adventure
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <RelatedCard
                  title="Inosuke degen"
                  creator="Estevao"
                  price="4.89K"
                  image={images.inosuke}
                  avatar={images.avatar}
                />
                <RelatedCard
                  title="The son is also the father"
                  creator="Mia den"
                  price="4.89K"
                  image={images.cross}
                  avatar={images.avatar}
                />
                <RelatedCard
                  title="Spiderman: Mary Jane"
                  creator="Mia den"
                  price="4.89K"
                  image={images.mj}
                  avatar={images.avatar}
                />
                <RelatedCard
                  title="Inosuke degen"
                  creator="Estevao"
                  price="4.89K"
                  image={images.inosuke}
                  avatar={images.avatar}
                />
                <RelatedCard
                  title="The son is also the father"
                  creator="Mia den"
                  price="4.89K"
                  image={images.cross}
                  avatar={images.avatar}
                />
                <RelatedCard
                  title="Spiderman: Mary Jane"
                  creator="Mia den"
                  price="4.89K"
                  image={images.mj}
                  avatar={images.avatar}
                />
              </div>
            </div>
          </div>

          {PRODUCTION_FEATURES.resale && <ResellModal
            isOpen={isResellOpen}
            onClose={() => setIsResellOpen(false)}
            comic={{
              id: "c-8832",
              title: displayTitle,
              collection: "Avatar: The Last Airbender",
              edition: 12,
              totalEditions: 100,
              imageUrl: images.cover, 
            }}
          />}
        </div>
      )}
    </>
  );
}

// RelatedCard component 
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
