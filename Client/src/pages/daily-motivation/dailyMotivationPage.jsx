import React, { useState } from "react";

const DailyMotivationPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const motivationData = [
    {
      id: 1,
      category: "pregnancy",
      title: "Embrace the Miracle Within",
      content:
        "You are creating life. Every cell, every heartbeat, every movement is a miracle. Trust your body's wisdom and embrace this beautiful journey of motherhood.",
      author: "Ancient Wisdom",
      image:
        "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=400&fit=crop",
      date: "2024-08-01",
    },
    {
      id: 2,
      category: "mindfulness",
      title: "Peace Begins With You",
      content:
        "The peace you seek for your child begins within you. When you are calm, your baby feels calm. When you are happy, your baby feels joy. Your emotions are their first teacher.",
      author: "Mindful Motherhood",
      image:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop",
      date: "2024-08-02",
    },
    {
      id: 3,
      category: "strength",
      title: "You Are Stronger Than You Know",
      content:
        "Women have been bringing life into this world since the beginning of time. You carry within you the strength of generations of mothers. Trust in your power.",
      author: "Empowered Birth",
      image:
        "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&h=400&fit=crop",
      date: "2024-08-03",
    },
    {
      id: 4,
      category: "nutrition",
      title: "Nourish to Flourish",
      content:
        "Every bite you take is building your baby's future. Choose foods that love you back. Your body is doing incredible work - treat it with kindness and nourish it well.",
      author: "Nutrition Wisdom",
      image:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop",
      date: "2024-08-04",
    },
    {
      id: 5,
      category: "bonding",
      title: "The Connection Starts Now",
      content:
        "Talk to your baby, sing to them, share your dreams. The bond you're building today will last a lifetime. Your voice is already their favorite sound.",
      author: "Bonding Moments",
      image:
        "https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?w=600&h=400&fit=crop",
      date: "2024-08-05",
    },
    {
      id: 6,
      category: "positivity",
      title: "Positive Thoughts, Healthy Baby",
      content:
        "Your baby hears your thoughts before they hear your voice. Fill your mind with positivity, hope, and love. What you think, they feel. What you feel, they become.",
      author: "Positive Pregnancy",
      image:
        "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?w=600&h=400&fit=crop",
      date: "2024-08-06",
    },
    {
      id: 7,
      category: "pregnancy",
      title: "Trust the Process",
      content:
        "Your body knows exactly what to do. Every discomfort, every change is part of a perfect design. Surrender to the process and let nature guide you.",
      author: "Trust Your Body",
      image:
        "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=600&h=400&fit=crop",
      date: "2024-08-07",
    },
    {
      id: 8,
      category: "mindfulness",
      title: "Breathe and Be Present",
      content:
        "In this moment, everything is perfect. Your baby is safe, you are loved, and life is unfolding exactly as it should. Take a deep breath and be here, now.",
      author: "Present Moment",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
      date: "2024-08-08",
    },
  ];

  const categories = [
    { id: "all", name: "All", color: "from-gray-500 to-gray-600" },
    { id: "pregnancy", name: "Pregnancy", color: "from-pink-500 to-rose-500" },
    {
      id: "mindfulness",
      name: "Mindfulness",
      color: "from-purple-500 to-indigo-500",
    },
    { id: "strength", name: "Strength", color: "from-red-500 to-orange-500" },
    {
      id: "nutrition",
      name: "Nutrition",
      color: "from-green-500 to-emerald-500",
    },
    { id: "bonding", name: "Bonding", color: "from-blue-500 to-cyan-500" },
    {
      id: "positivity",
      name: "Positivity",
      color: "from-yellow-500 to-amber-500",
    },
  ];

  const filteredMotivation =
    selectedCategory === "all"
      ? motivationData
      : motivationData.filter((item) => item.category === selectedCategory);

  const getCategoryColor = (category) => {
    const cat = categories.find((c) => c.id === category);
    return cat ? cat.color : "from-gray-500 to-gray-600";
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Daily Motivation
            </h1>
            <p className="text-gray-600">
              Daily inspiration for your pregnancy journey
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150">
            + Add New Motivation
          </button>
        </div>

        {/* Today's Featured Quote */}
        <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg
                className="w-12 h-12 opacity-80"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-medium mb-4 leading-relaxed">
                "You are not just carrying a child, you are carrying the future.
                Every thought, every emotion, every choice shapes the life
                within you."
              </p>
              <p className="text-sm opacity-90">— Today's Inspiration</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-md`
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Motivation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMotivation.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="relative h-48">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 bg-gradient-to-r ${getCategoryColor(item.category)} text-white text-xs font-medium rounded-full`}
                  >
                    {categories.find((c) => c.id === item.category)?.name ||
                      item.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">{item.date}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        // Handle edit
                      }}
                      className="text-blue-600 hover:text-blue-700 transition-colors duration-150"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        // Handle delete
                      }}
                      className="text-red-600 hover:text-red-700 transition-colors duration-150"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {item.content}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">— {item.author}</span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Read more
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMotivation.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <p className="text-gray-500">
              No motivation found for this category
            </p>
          </div>
        )}

        {/* Daily Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Daily Tips for a Healthy Pregnancy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800">
                  Stay Hydrated
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Drink at least 8-10 glasses of water daily
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800">Rest Well</span>
              </div>
              <p className="text-sm text-gray-600">
                Get plenty of rest and sleep on your left side
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800">
                  Listen to Music
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Soothing music benefits both you and your baby
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DailyMotivationPage };
