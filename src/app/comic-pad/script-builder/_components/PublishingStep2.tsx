"use client";
import React, { useState, useEffect } from "react";

const genres = [
  "Action & Adventure",
  "Fantasy",
  "Science Fiction",
  "Romance",
  "Horror",
  "Mystery & Thriller",
  "Slice of Life",
  "Historical & Biographical",
  "Superheroes",
  "Suspense",
  "Drama",
];

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const PublishingStep2 = ({ onNext, onBack, formData, setFormData }: Step2Props) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(formData.genres || []);
  const [audience, setAudience] = useState(formData.audience || "All Ages");
  const [title, setTitle] = useState(formData.title || "");
  const [episodeTitle, setEpisodeTitle] = useState(formData.episodeTitle || "");
  const [description, setDescription] = useState(formData.description || "");

  // 🔄 Sync with parent data when navigating back
  useEffect(() => {
    setTitle(formData.title || "");
    setEpisodeTitle(formData.episodeTitle || "");
    setDescription(formData.description || "");
    setAudience(formData.audience || "All Ages");
    setSelectedGenres(formData.genres || []);
  }, [formData]);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else if (selectedGenres.length < 3) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleNextClick = () => {
    setFormData({
      ...formData,
      title,
      episodeTitle,
      description,
      genres: selectedGenres,
      audience,
    });
    onNext();
  };

  return (
    <div className="max-w-3xl w-full mx-auto px-6 pt-8 pb-12 text-white animate-fadeIn">
      {/* Heading */}
      <p className="text-white text-sm font-medium tracking-wide mb-2">
            PUBLISH YOUR COMIC | STEP 2 OF 4
          </p>
      <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
        Tell the world about your story
      </h3>
      <p className="text-white/60 text-center mb-8">
        Help readers discover your comic. The more details, the better!
      </p>

      {/* Form Fields */}
      <div className="space-y-6">
        <input
          type="text"
          placeholder="Comic Series Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-4 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="text"
          placeholder="Episode Title"
          value={episodeTitle}
          onChange={(e) => setEpisodeTitle(e.target.value)}
          className="w-full p-4 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500"
        />
        <textarea
          rows={3}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-4 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500"
        ></textarea>

        {/* Genre Selector */}
        <div>
          <label className="block text-white font-medium mb-2">
            Select up to 3 genres
          </label>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`px-4 py-2 rounded-full text-sm border transition ${
                  selectedGenres.includes(genre)
                    ? "bg-orange-500 text-black border-orange-500"
                    : "bg-black/40 text-white/70 border border-white/20 hover:bg-white/10 hover:text-white"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white">Episode Title</label>
          <input
            type="text"
            value={formData.episodeTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, episodeTitle: e.target.value }))}
            placeholder="Enter episode title"
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-secondary-300 text-white placeholder:text-white/50"
          />
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={handleNextClick}
          className="w-full bg-orange-500 hover:bg-orange-400 text-black font-bold py-4 px-8 rounded-2xl shadow-lg transition text-lg"
        >
          Back
        </button>
        <button
          onClick={handleNextClick}
          className="px-8 py-3 bg-secondary-300 text-black font-bold rounded-lg transition-none"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PublishingStep2;
