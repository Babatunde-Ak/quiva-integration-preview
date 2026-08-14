'use client';

import React, {useState} from 'react';
import {useRouter, useParams} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Checkbox} from '@/components/ui/checkbox';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {ChevronLeft, Search, MoreVertical} from 'lucide-react';
import { hbar } from '../../../../../public/dev_images';

interface Episode {
    _id : string;
    title? : string;
    thumbnail : string;
    description?: string;
    publishDate?: string;
    isPublished?: boolean;
    bannerImage?: string;
    summary?: string;
    maturityRating?: string;
}

interface EpisodesListProps {
    collectionTitle?: string;
    episodes?: Episode[];
    onGoBack?: () => void;
    onUploadEpisode?: () => void;
    onCreateDrop?: (episodeId : string) => void;
    onListToMarketplace?: (episodeId : string) => void;
    onViewEpisodeDetails?: (episodeId : string) => void;
    onSelectEpisodes?: (selectedIds : string[]) => void;
}

const EpisodesList : React.FC < EpisodesListProps > = ({
    collectionTitle = "Galactic Ronin",
    episodes = [],
    onGoBack,
    onUploadEpisode,
    onCreateDrop,
    onListToMarketplace,
    onViewEpisodeDetails,
    onSelectEpisodes
}) => {
    const router = useRouter();
    const params = useParams();
    
    const [searchTerm,
        setSearchTerm] = useState('');
    const [selectedEpisodes,
        setSelectedEpisodes] = useState < string[] > ([]);

    const filteredEpisodes = episodes.filter(episode => episode.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleGoBack = () => {
        if (onGoBack) {
            onGoBack();
        } else {
            router.back();
        }
    };

    const handleUploadEpisode = () => {
        if (onUploadEpisode) {
            onUploadEpisode();
        } else {
            router.push(`/collections/${params
                ?.id}`);
        }
    };


    const handleSelectEpisode = (episodeId : string, checked : boolean) => {
        const newSelection = checked
            ? [
                ...selectedEpisodes,
                episodeId
            ]
            : selectedEpisodes.filter(id => id !== episodeId);

        setSelectedEpisodes(newSelection);
        onSelectEpisodes
            ?.(newSelection);
    };

    const handleSelectAll = (checked : boolean) => {
        const newSelection = checked
            ? filteredEpisodes.map(ep => ep._id)
            : [];
        setSelectedEpisodes(newSelection);
        onSelectEpisodes
            ?.(newSelection);
    };

    const isAllSelected = filteredEpisodes.length > 0 && filteredEpisodes.every(ep => selectedEpisodes.includes(ep._id));

    return (
        <div className="min-h-screen bg-transparent text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={handleGoBack}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                        <ChevronLeft size={20}/>
                        <span>Go back</span>
                    </button>
                </div>

                {/* Title and Description */}
                <div className="text-center mb-12 relative">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {collectionTitle}
                    </h1>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Select the Episodes you want to readers to start minting on the marketplace.
                    </p>
                </div>

                <div className='min-h-[40vh] bg-black-200 border border-black-50 rounded-lg p-8'>
                    {/* Episodes Count and Controls */}
                    <div
                        className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
                        <h2 className="text-xl font-semibold text-white">
                            You have {episodes.length} {" "}
                            Episode{episodes.length !== 1
                                ? 's'
                                : ''}
                        </h2>

                        <div
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                            {/* Search */}
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                                    size={16}/>
                                <Input
                                    placeholder="Search Episodes, title"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-black-400 border-black-50 text-white placeholder-white/40 pl-10 w-full sm:w-80 rounded-full"/>
                            </div>

                            {/* Upload Episode Button */}
                            <Button
                                onClick={handleUploadEpisode}
                                variant="outline"
                                className="border-primary-500 text-primary-500 hover:text-primary-500 hover:bg-primary-500/10 bg-transparent rounded-full whitespace-nowrap">
                                Upload Episode
                            </Button>
                        </div>
                    </div>

                    {/* Episodes Table */}
                    {filteredEpisodes.length > 0
                        ? (
                            <div className=" overflow-hidden">
                                {/* Table Header */}
                                <div
                                    className="grid grid-cols-12 gap-4 p-4 border-b border-black-50 text-white/60 text-sm font-medium">
                                    <div className="col-span-1 flex items-center">
                                        <Checkbox
                                            checked={isAllSelected}
                                            onCheckedChange={handleSelectAll}
                                            className="border-white/20"/>
                                    </div>
                                    <div className="col-span-8 lg:col-span-9">Episodes</div>
                                    <div className="col-span-3 lg:col-span-2 text-right">Action</div>
                                </div>

                                {/* Episodes List */}
                                <div className="divide-y divide-black-50">
                                    {filteredEpisodes.map((episode) => (
                                        <div
                                            key={episode._id}
                                            className="grid grid-cols-12 gap-4 p-4 hover:bg-black-300/50 transition-colors">
                                            {/* Checkbox */}
                                            <div className="col-span-1 flex items-center">
                                                <Checkbox
                                                    checked={selectedEpisodes.includes(episode._id)}
                                                    onCheckedChange={(checked) => handleSelectEpisode(episode._id, checked as boolean)}
                                                    className="border-white/20"/>
                                            </div>

                                            {/* Episode Info */}
                                            <div className="col-span-8 lg:col-span-9 flex items-center gap-4">
                                                <div className="relative flex-shrink-0">
                                                    <img
                                                        src={episode.bannerImage || episode.thumbnail}
                                                        alt={episode.title}
                                                        className="w-12 h-16 object-cover rounded"/> {/* Episode indicator */}
                                                    <div
                                                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-black-500 rounded-full border-2 border-black-400 flex items-center justify-center">
                                                        <img src={hbar.src} alt="hbar token" className='w-4 h-4 object-cover'/>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-medium">{episode.title}</h3>
                                                    {episode.summary && (
                                                        <p className="text-white/60 text-sm mt-1">{episode.summary}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Dropdown */}
                                            <div className="col-span-3 lg:col-span-2 flex items-center justify-end">
                                                <div className="flex items-center gap-2">

                                                    {/* Dropdown Menu */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10">
                                                                <MoreVertical className="h-4 w-4 text-white/60"/>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="bg-black-400 border-black-50 text-center text-white hover:text-white shadow-primary-500/30 shadow-lg gap-8 ">
                                                            <DropdownMenuItem
                                                                onClick={() => onCreateDrop
                                                                ?.(episode._id)}
                                                                className="hover:text-white hover:bg-white/10 focus:bg-white/10 border-b border-black-50 mb-2 py-1 text-center">
                                                                Create Drop
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => onListToMarketplace
                                                                ?.(episode._id)}
                                                                className="hover:text-white hover:bg-white/10 focus:bg-white/10 border-b border-black-50 mb-2 py-1 text-center">
                                                                List to Marketplace
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => onViewEpisodeDetails
                                                                ?.(episode._id)}
                                                                className="hover:text-white hover:bg-white/10 focus:bg-white/10 mb-2 py-1 text-center">
                                                                Episode details
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                        : (
                            <div className="text-center py-12">
                                <p className="text-white/60">
                                    {searchTerm
                                        ? `No episodes found matching "${searchTerm}"`
                                        : 'No episodes found'}
                                </p>
                            </div>
                        )}

                </div>
            </div>
        </div>
    );
};

export default EpisodesList;