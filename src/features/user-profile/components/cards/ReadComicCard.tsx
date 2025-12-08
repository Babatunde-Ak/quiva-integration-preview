import React from 'react';

const ReadComicCard = ({
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
        <div className={`p-6 group relative flex bg-black-500 border-2 border-black-50 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/20 ${className}`}>
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
                                className="text-white text-xs font-light px-3 py-1 rounded-md bg-black-200 backdrop-blur-sm border border-black-50"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    {description}
                </p>

                {/* Creator Info */}
                <div className="flex items-center gap-3 mb-4">
                    <img
                        src={creatorAvatar}
                        alt={creator}
                        className="w-8 h-8 rounded-md border border-black-50"
                    />
                    <div className="flex flex-col">
                        <span className="text-xs text-white tracking-wide font-light">
                            Creator
                        </span>
                        <span className="text-sm text-white font-bold">
                            {creator}
                        </span>
                    </div>
                </div>

                {/* Spacer to push progress and button to bottom */}
                <div className="flex-1" />

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2 gap-4">
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-secondary-200 hover:bg-primary-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-sm font-bold text-white">{progress}%</span>
                    </div>
                    
                </div>

                {/* CTA Button */}
                <button
                    className="w-fit bg-secondary-200 hover:bg-primary-500 font-normal text-black-200 px-6 py-3 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/50 flex items-center justify-center gap-2"
                    onClick={onContinueReading}
                >
                    <span>Continue Reading</span>
                </button>
            </div>
        </div>
    );
};

export default ReadComicCard;