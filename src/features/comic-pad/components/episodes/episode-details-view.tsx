'use client';

import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MainButton } from '@/components/button';
import Picture from '@/components/picture/Index';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { hbarIcon } from '../../../../../public/dev_images';

type TabType = 'overview' | 'editing' | 'analytics';

interface EpisodeDetailsViewProps {
    episode: any;
    collectionId: string;
    onGoBack: () => void;
}

const EpisodeDetailsView: React.FC<EpisodeDetailsViewProps> = ({
    episode,
    collectionId,
    onGoBack,
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const router = useRouter();

    const tabs: { key: TabType; label: string }[] = [
        { key: 'overview', label: 'Overview' },
        { key: 'editing', label: 'Continue Editing' },
        { key: 'analytics', label: 'Analytics' },
    ];

    const coverImage = episode.bannerImage || episode.coverImage || '/dev_images/avatar-2.png';
    const title = episode.title || 'Untitled Episode';
    const description = episode.summary || episode.description || '';
    const genres = episode.genre || [];
    const collaborators = episode.collaborators || [];
    const supply = episode.nftId?.maxSupply ?? 'N/A';
    const price = episode.nftId?.price ?? 'N/A';
    const views = episode.views ?? 0;
    const likes = episode.likes ?? 0;
    const totalPages = episode.totalPages ?? 0;
    const episodeNumber = episode.episodeNumber;
    const maturityRating = episode.maturityRating || 'N/A';
    const status = episode.status || 'draft';

    // Determine rarity from supply
    const getRarity = () => {
        if (!episode.nftId?.maxSupply) return 'N/A';
        const s = episode.nftId.maxSupply;
        if (s <= 5000) return 'Legendary';
        if (s <= 8000) return 'Epic';
        return 'Common';
    };

    const handleEdit = () => {
        // Navigate to episode edit — for now go back to collection
        router.push(`/comic-pad/collections/${collectionId}`);
    };

    return (
        <div className="min-h-screen text-white p-4 md:p-8 font-recursive">
            {/* Back Button */}
            <button
                onClick={onGoBack}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm">Back to Collection</span>
            </button>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Left Column - Cover Image */}
                <div className="relative">
                    <div className="rounded-2xl overflow-hidden border-2 border-primary-500/30 shadow-lg shadow-primary-500/10">
                        <Picture
                            src={coverImage}
                            alt={title}
                            className="w-full h-auto min-h-[400px] max-h-[600px] object-cover"
                        />
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="flex flex-col">
                    {/* Tab Navigation */}
                    <div className="flex gap-3 mb-8 p-1 w-fit">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    activeTab === tab.key
                                        ? 'bg-primary-500 text-black-500'
                                        : 'text-white hover:text-white border border-black-50 hover:bg-white/30'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1">
                        {activeTab === 'overview' && (
                            <OverviewTab
                                title={title}
                                description={description}
                                rarity={getRarity()}
                                supply={supply}
                                price={price}
                                genres={genres}
                                collaborators={collaborators}
                                maturityRating={maturityRating}
                                episodeNumber={episodeNumber}
                            />
                        )}

                        {activeTab === 'editing' && (
                            <EditingTab status={status} />
                        )}

                        {activeTab === 'analytics' && (
                            <AnalyticsTab episode={episode} />
                        )}
                    </div>

                    {/* Edit Button */}
                    <div className="mt-8">
                        <MainButton
                            onClick={handleEdit}
                            className="w-full max-w-xs"
                        >
                            Edit
                        </MainButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Overview Tab ────────────────────────────────────────────────

interface OverviewTabProps {
    title: string;
    description: string;
    rarity: string;
    supply: number | string;
    price: number | string;
    genres: string[];
    collaborators: any[];
    maturityRating: string;
    episodeNumber?: number;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
    title,
    description,
    rarity,
    supply,
    price,
    genres,
    collaborators,
    maturityRating,
    episodeNumber,
}) => {
    const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div className="space-y-1">
            <p className="text-white/40 text-xs uppercase tracking-wider">{label}</p>
            <div className="text-white">{children}</div>
        </div>
    );

    return (
        <div className="space-y-6">
            <DetailRow label="Name">
                <h2 className="text-2xl font-bold">{title}</h2>
            </DetailRow>

            {description && (
                <DetailRow label="Description">
                    <p className="text-white/80 text-sm leading-relaxed">{description}</p>
                </DetailRow>
            )}

            <DetailRow label="Rarity">
                <p className="font-semibold">{rarity}</p>
            </DetailRow>

            <DetailRow label="Supply">
                <p className="font-semibold">{typeof supply === 'number' ? supply.toLocaleString() : supply}</p>
            </DetailRow>

            <DetailRow label="Price">
                <p className="font-semibold">{typeof price === 'number' ? price : price}</p>
            </DetailRow>

            <DetailRow label="Genres">
                {genres.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                        {genres.map((genre: string) => (
                            <Badge
                                key={genre}
                                variant="outline"
                                className="bg-transparent border-white/30 text-white/80 rounded-full px-3 py-1 text-xs font-normal"
                            >
                                {genre}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-white/50 text-sm">No genres</p>
                )}
            </DetailRow>

            <DetailRow label="Collaborators">
                {collaborators.length > 0 ? (
                    <p className="text-white/80 text-sm">
                        {collaborators.map((c: any) =>
                            `@${c.username || c.walletAddress?.slice(0, 8) || 'unknown'}`
                        ).join(' ')}
                    </p>
                ) : (
                    <p className="text-white/50 text-sm">No collaborators</p>
                )}
            </DetailRow>
        </div>
    );
};

// ─── Editing Tab ─────────────────────────────────────────────────

const EditingTab: React.FC<{ status: string }> = ({ status }) => (
    <div className="space-y-6">
        <div className="bg-black-200 border border-black-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Episode Status</h3>
            <p className="text-white/60 text-sm mb-4">
                Current status: <span className="text-primary-500 font-medium capitalize">{status}</span>
            </p>
            <p className="text-white/40 text-sm">
                Use the Edit button below to make changes to this episode.
            </p>
        </div>
    </div>
);

// ─── Analytics Tab ───────────────────────────────────────────────

const AnalyticsTab: React.FC<{ episode: any }> = ({ episode }) => {
    const nft = episode.nftId || {};
    const mintPrice = nft.price ?? 0;
    const editions = nft.maxSupply ?? 0;
    const currentSupply = nft.currentSupply ?? 0;
    const royalty = nft.royalty ?? 0;
    const floorPrice = nft.floorPrice ?? mintPrice;
    const volume = nft.volume ?? 0;
    const collectors = nft.collectors ?? 0;
    const activities = episode.activities || [];

    const StatItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div>
            <p className="text-white/40 text-xs mb-1">{label}</p>
            <div className="text-white font-bold text-lg">{children}</div>
        </div>
    );

    const formatTime = (date: string) => {
        if (!date) return '';
        const diff = Date.now() - new Date(date).getTime();
        const seconds = Math.floor(diff / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="space-y-8">
            {/* Minting Details */}
            <div>
                <h3 className="text-xl font-bold mb-4">Minting Details</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <StatItem label="Mint Price">
                        <span className="flex items-center gap-1">
                            {Number(mintPrice).toFixed(2)} <span className=""><Image src={hbarIcon} alt="Hbar" className="w-4 h-4" /></span>
                        </span>
                    </StatItem>
                    <StatItem label="Editions">
                        {editions.toLocaleString()}
                    </StatItem>
                    <StatItem label="Royalties">
                        {royalty}% to creator
                    </StatItem>
                </div>
                <div>
                    <p className="text-white/40 text-xs mb-1">Blockchain</p>
                    <p className="text-white font-bold">Hedera</p>
                </div>
            </div>

            {/* Market Stats */}
            <div>
                <h3 className="text-xl font-bold mb-4">Market Stats</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <StatItem label="Floor Price">
                        <span className="flex items-center gap-1">
                            {Number(floorPrice).toFixed(3)} <span className="text-primary-500 text-sm">H</span>
                        </span>
                    </StatItem>
                    <StatItem label="Total Mints">
                        {currentSupply.toLocaleString()} / {editions.toLocaleString()}
                    </StatItem>
                    <StatItem label="Volume">
                        <span className="flex items-center gap-1">
                            {Number(volume).toFixed(1)} <span className="text-primary-500 text-sm">H</span>
                        </span>
                    </StatItem>
                </div>
                <StatItem label="Collectors">
                    {collectors.toLocaleString()}
                </StatItem>
            </div>

            {/* Live Activity */}
            <div>
                <h3 className="text-xl font-bold mb-1">Live Activity</h3>
                <p className="text-white/40 text-sm mb-4">See who is minting, listing and trading this comic</p>

                <div className="border border-black-50 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-black-50 text-white/40 text-xs">
                                <th className="text-left py-3 px-4 font-normal">Username</th>
                                <th className="text-left py-3 px-4 font-normal">Event</th>
                                <th className="text-left py-3 px-4 font-normal">Price</th>
                                <th className="text-left py-3 px-4 font-normal">Edition</th>
                                <th className="text-right py-3 px-4 font-normal">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.length > 0 ? (
                                activities.map((activity: any, index: number) => (
                                    <tr key={index} className="border-b border-black-50 last:border-b-0">
                                        <td className="py-3 px-4 text-white font-medium">
                                            @{activity.username || activity.walletAddress?.slice(0, 8) || 'unknown'}
                                        </td>
                                        <td className="py-3 px-4 text-white/80">{activity.event || 'Minted'}</td>
                                        <td className="py-3 px-4">
                                            <span className="flex items-center gap-1 text-white">
                                                {Number(activity.price || mintPrice).toFixed(2)} <span className="text-primary-500 text-xs">H</span>
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-primary-500 font-medium">
                                            #{activity.edition || (index + 1).toString().padStart(3, '0')}
                                        </td>
                                        <td className="py-3 px-4 text-right text-white/60">
                                            {formatTime(activity.createdAt)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-white/40">
                                        No activity yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EpisodeDetailsView;
