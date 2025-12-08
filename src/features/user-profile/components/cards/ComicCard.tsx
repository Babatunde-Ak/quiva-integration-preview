import React from 'react';

const ComicCard = ({
    title = "Inosuke degen",
    description = "Read through the fun adventure and real life drama that happens in the world.",
    creator = "Estevao",
    creatorAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Estevao",
    coverImage = "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400&h=300&fit=crop",
    progress = 20,
    genres = ["Drama", "Fantasy", "Comedy"],
    onContinueReading = () => {},
    className = "",
    variant = "default"
}) => {
    return (
        <div className={`group relative flex bg-zinc-900 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/20 ${className}`}>
            {/* Cover Image - Left Side */}
            <div className="relative w-64 flex-shrink-0">
                <img
                    src={coverImage}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Content - Right Side */}
            <div className="flex-1 p-6 flex flex-col">
                

                <div className='flex justify-between items-center'>
                    {/* Title */}
                    <h3 className="text-3xl font-bold text-white mb-3 leading-tight">
                        {title}
                    </h3>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {genres.map((genre, index) => (
                            <span
                                key={index}
                                className="text-white text-xs font-medium px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                    {description}
                </p>

                {/* Creator Info */}
                <div className="flex items-center gap-3 mb-4">
                    <img
                        src={creatorAvatar}
                        alt={creator}
                        className="w-8 h-8 rounded-full border-2 border-orange-500"
                    />
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                            Creator
                        </span>
                        <span className="text-sm text-gray-300 font-medium">
                            {creator}
                        </span>
                    </div>
                </div>

                {/* Spacer to push progress and button to bottom */}
                <div className="flex-1" />

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Progress</span>
                        <span className="text-sm font-bold text-orange-500">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/50 flex items-center justify-center gap-2"
                    onClick={onContinueReading}
                >
                    <span>Continue Reading</span>
                    <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    >
                        <path d="M8 5v14l11-7z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ComicCard;