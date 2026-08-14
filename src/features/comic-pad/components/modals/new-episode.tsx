'use client';

import React, {useState, useRef, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Upload, X, Plus} from 'lucide-react';
import {IconToggleSwitch} from '@/components/switch/Switch';

interface EpisodeFormData {
    title : string;
    summary : string;
    episodeNumber : string;
    maturityRating : string;
    bannerImage : File | null;
    collaborators : string[];
}

interface CreateEpisodesFormProps {
    onSubmit : (data : EpisodeFormData) => void;
    onSaveDraft : (data : EpisodeFormData) => void;
    isLoading?: boolean;
}

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const CreateEpisodeForm : React.FC < CreateEpisodesFormProps > = ({
    onSubmit,
    onSaveDraft,
    isLoading = false
}) => {
    // Initial form data
    const initialFormData: EpisodeFormData = {
        title: '',
        summary: '',
        episodeNumber: '',
        maturityRating: '',
        bannerImage: null,
        collaborators: [],
    };

    const [formData, setFormData] = useState<EpisodeFormData>(initialFormData);
    const [isDraftLoaded, setIsDraftLoaded] = useState(false);
    const [showDraftNotification, setShowDraftNotification] = useState(false);

    const [newCollaborator, setNewCollaborator] = useState('');
    const [showCollaborators, setShowCollaborators] = useState(false);
    const fileInputRef = useRef < HTMLInputElement > (null);

    // Load draft from cookies on component mount
    useEffect(() => {
        const draftData = getCookie('collection_draft');
        if (draftData) {
            try {
                const parsedDraft = JSON.parse(decodeURIComponent(draftData));
                setFormData(prev => ({
                    ...prev,
                    ...parsedDraft,
                    bannerImage: null // Can't restore File object from cookie
                }));
                
                // Show collaborators section if there are any collaborators
                if (parsedDraft.collaborators && parsedDraft.collaborators.length > 0) {
                    setShowCollaborators(true);
                }
                
                setIsDraftLoaded(true);
                setShowDraftNotification(true);
                
                // Hide notification after 5 seconds
                setTimeout(() => setShowDraftNotification(false), 5000);
            } catch (error) {
                console.error('Error loading draft from cookies:', error);
                // Clear corrupted cookie
                deleteCookie('collection_draft');
            }
        }
    }, []);

    const handleImageUpload = (event : React.ChangeEvent < HTMLInputElement >) => {
        const file = event.target.files
            ?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                bannerImage: file
            }));
        }
    };

    const handleRemoveCollaborator = (index : number) => {
        setFormData(prev => ({
            ...prev,
            collaborators: prev
                .collaborators
                .filter((_, i) => i !== index)
        }));
    };

    const handleAddCollaborator = () => {
        if (newCollaborator.trim() && !formData.collaborators.includes(newCollaborator.trim())) {
            setFormData(prev => ({
                ...prev,
                collaborators: [...prev.collaborators, newCollaborator.trim()]
            }));
            setNewCollaborator('');
        }
    };

    const handleSaveDraftToCookies = () => {
        try {
            // Create draft object without File (can't serialize File objects)
            const draftToSave = {
                title: formData.title,
                collaborators: formData.collaborators,
                maturityRating: formData.maturityRating,
                episodeNumber: formData.episodeNumber,
                summary: formData.summary,
                // Note: bannerImage is excluded as File objects can't be stored in cookies
            };

            // Save to cookie with 7 days expiration
            setCookie('collection_draft', encodeURIComponent(JSON.stringify(draftToSave)), 7);
            
            // Call the original onSaveDraft prop
            onSaveDraft(formData);
            
            // Show success feedback
            alert('Draft saved successfully!');
        } catch (error) {
            console.error('Error saving draft to cookies:', error);
            alert('Failed to save draft. Please try again.');
        }
    };

    const handleSubmit = (e : React.FormEvent) => {
        e.preventDefault();
        
        // Clear draft cookie on successful submission
        deleteCookie('collection_draft');
        
        // Call the original onSubmit prop
        onSubmit(formData);
    };

    const clearDraft = () => {
        deleteCookie('collection_draft');
        setFormData(initialFormData);
        setIsDraftLoaded(false);
        setShowDraftNotification(false);
        setShowCollaborators(false); // Reset the toggle state
        setNewCollaborator(''); // Clear any pending collaborator input
        
        // Clear file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-white p-6 overflow-y-auto font-recursive">
            <div className="">
                {/* Draft notification */}
                {showDraftNotification && (
                    <div className="mb-4 p-4 bg-blue-600 border border-blue-500 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-white">📄</span>
                            <span className="text-white">Draft loaded successfully! Your previous work has been restored.</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearDraft}
                                className="border-blue-400 text-blue-100 hover:bg-blue-500"
                            >
                                Clear Draft
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDraftNotification(false)}
                                className="text-blue-100 hover:bg-blue-500"
                            >
                                <X size={16} />
                            </Button>
                        </div>
                    </div>
                )}

                <Card className="bg-black-500 border-none">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-white">
                            Create New Episode
                        </CardTitle>
                        <CardDescription className="text-white/40">
                            Upload your chapter files and set up episode details.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        <form onSubmit={handleSubmit} className="space-y-8 grid lg:grid-cols-2 gap-8">
                            {/* Episode Details Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-white">Episode details</h3>

                                <div className="">
                                    <div className="space-y-4">
                                        <div>
                                            <Input
                                                placeholder="Enter episode title"
                                                value={formData.title}
                                                onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                title: e.target.value
                                            }))}
                                                className="bg-black-500 border-black-50 text-white placeholder-white/40 focus:border-orange-500"/>
                                        </div>

                                        <div>
                                            <Input
                                                placeholder="Enter episode no"
                                                value={formData.episodeNumber}
                                                onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                episodeNumber: e.target.value
                                            }))}
                                                className="bg-black-500 border-black-50 text-white placeholder-white/40 focus:border-orange-500"/>
                                        </div>

                                        <div>
                                            <Textarea
                                                placeholder="Add an optional summary for this episode…"
                                                value={formData.summary}
                                                onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                summary: e.target.value
                                            }))}
                                                className="bg-black-500 border-black-50 text-white placeholder-white/40 focus:border-orange-500 min-h-[120px] resize-none"/>
                                        </div>
                                        
                                    </div>
                                </div>

                                {/* Collaborators Section - With Toggle */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                <IconToggleSwitch enabled={showCollaborators} onChange={() => setShowCollaborators(!showCollaborators)}/>
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">Add Collaborators</h3>
                                        </div>

                                        
                                        
                                    </div>

                                    {/* Collaborator Input - Only show when toggled on */}
                                    {showCollaborators && (
                                        <div className="space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                                            <div className="relative">
                                                <Input
                                                    placeholder="Add your collaborators"
                                                    value={newCollaborator}
                                                    onChange={(e) => setNewCollaborator(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddCollaborator();
                                                        }
                                                    }}
                                                    className="bg-black-500 border-black-50 text-white/60 placeholder-white/40 focus:border-orange-500 pr-4"
                                                />
                                            </div>

                                            {/* Display added collaborators */}
                                            {formData.collaborators.length > 0 && (
                                                <div className="flex flex-wrap gap-3">
                                                    {formData
                                                        .collaborators
                                                        .map((collaborator, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center gap-2 bg-black-300 border border-black-50 rounded-md pr-3 py-1">
                                                                {/* <Avatar className="w-7 h-7">
                                                                    <AvatarFallback className="bg-black-50 text-white text-xs font-semibold">
                                                                        {collaborator.charAt(0).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar> */}
                                                                <span className="text-sm text-white">{collaborator}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveCollaborator(index)}
                                                                    className="text-white/40 hover:text-white transition-colors ml-1 p-1">
                                                                    <X size={12}/>
                                                                </button>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* Banner Upload Section */}
                            <div className="space-y-4">
                                <div
                                    className="border border-black-50 bg-black-200 rounded-lg p-6 text-center h-full flex flex-col items-center justify-center">
                                    {formData.bannerImage ? (
                                        <div className="space-y-4">
                                            <div className="relative inline-block">
                                                <img
                                                    src={URL.createObjectURL(formData.bannerImage)}
                                                    alt="Banner preview"
                                                    className="object-cover w-full max-h-96 rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, bannerImage: null }))}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-400">{formData.bannerImage.name}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="mx-auto mb-4 text-white/50" size={48}/>
                                            <p className="text-white/40 mb-4 font-light max-w-xl">
                                                Please upload a valid image file (PNG, JPG).
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="bg-transparent border-primary-500 text-primary-500 hover:text-primary-500 hover:bg-primary-500/10 rounded-full"
                                                onClick={() => fileInputRef.current?.click()}>
                                                Upload Banner
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={handleImageUpload}
                                    className="hidden"/>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4 pt-4 col-span-1 lg:col-span-2 lg:self-start w-3/4 mx-auto">
                                <Button
                                    type="submit"
                                    disabled={isLoading || (!formData.title.trim() || !formData.episodeNumber.trim() || !formData.maturityRating.trim())}
                                    className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 disabled:opacity-50 rounded-full transition-colors">
                                    {isLoading
                                        ? 'Creating Series...'
                                        : 'Create Series'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleSaveDraftToCookies}
                                    disabled={isLoading}
                                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 font-semibold py-3 rounded-full transition-colors">
                                    Save as Draft
                                </Button>

                                {isDraftLoaded && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={clearDraft}
                                        className="w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 font-semibold py-3 rounded-full transition-colors">
                                        Clear Draft & Start Fresh
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CreateEpisodeForm;