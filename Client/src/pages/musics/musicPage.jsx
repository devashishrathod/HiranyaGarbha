import React, { useState } from "react";

const MusicPage = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const musicData = [
    {
      id: 1,
      title: "Raga Yaman - Peaceful Morning",
      category: "Classical",
      duration: "15:30",
      description:
        "A soothing raga perfect for morning meditation and positive energy",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    },
    {
      id: 2,
      title: "Garbha Sanskar Mantras",
      category: "Mantras",
      duration: "20:00",
      description:
        "Sacred mantras for the spiritual development of the unborn child",
      image:
        "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop",
    },
    {
      id: 3,
      title: "Nature Sounds - Rain",
      category: "Nature",
      duration: "30:00",
      description:
        "Calming rain sounds to reduce stress and promote relaxation",
      image:
        "https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=300&h=300&fit=crop",
    },
    {
      id: 4,
      title: "Raga Bhairavi - Evening Calm",
      category: "Classical",
      duration: "18:45",
      description: "Evening raga to unwind and prepare for peaceful sleep",
      image:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
    },
    {
      id: 5,
      title: "Om Chanting",
      category: "Meditation",
      duration: "25:00",
      description:
        "Powerful Om chanting for spiritual connection and inner peace",
      image:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=300&fit=crop",
    },
    {
      id: 6,
      title: "Flute Melody",
      category: "Instrumental",
      duration: "12:30",
      description: "Gentle flute music for a soothing and peaceful atmosphere",
      image:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
    },
    {
      id: 7,
      title: "Pregnancy Lullabies",
      category: "Lullabies",
      duration: "22:00",
      description:
        "Soft lullabies to bond with your baby and promote relaxation",
      image:
        "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=300&h=300&fit=crop",
    },
    {
      id: 8,
      title: "Ocean Waves",
      category: "Nature",
      duration: "35:00",
      description: "Ocean wave sounds for deep relaxation and stress relief",
      image:
        "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=300&h=300&fit=crop",
    },
  ];

  const categories = [
    "All",
    "Classical",
    "Mantras",
    "Nature",
    "Meditation",
    "Instrumental",
    "Lullabies",
  ];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredMusic =
    selectedCategory === "All"
      ? musicData
      : musicData.filter((music) => music.category === selectedCategory);

  const handlePlay = (music) => {
    if (currentTrack?.id === music.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(music);
      setIsPlaying(true);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Music for Pregnancy
            </h1>
            <p className="text-gray-600">
              Soothing music and mantras for Garbha Sanskar and relaxation
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150">
            + Add New Music
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Music Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMusic.map((music) => (
            <div
              key={music.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="relative">
                <img
                  src={music.image}
                  alt={music.title}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => handlePlay(music)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-50 transition-all duration-200"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    {currentTrack?.id === music.id && isPlaying ? (
                      <svg
                        className="w-8 h-8 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-8 h-8 text-blue-500 ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>
                </button>
                <span className="absolute top-3 right-3 px-2 py-1 bg-white bg-opacity-90 rounded-full text-xs font-medium text-gray-700">
                  {music.duration}
                </span>
              </div>
              <div className="p-4">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-2">
                  {music.category}
                </span>
                <h3 className="font-semibold text-gray-800 mb-1 truncate">
                  {music.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {music.description}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      // Handle edit
                    }}
                    className="flex-1 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-150"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      // Handle delete
                    }}
                    className="flex-1 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors duration-150"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Now Playing Bar */}
        {currentTrack && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={currentTrack.image}
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {currentTrack.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {currentTrack.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-600 hover:text-gray-800">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isPlaying ? (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { MusicPage };
