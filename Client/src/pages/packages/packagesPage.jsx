import React, { useState } from "react";

const PackagesPage = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);

  const packages = [
    {
      id: 1,
      name: "BASIC PACKAGE",
      subtitle: "Foundation",
      duration: "3 Months",
      idealFor: "First-time expecting mothers",
      price: "₹4,999",
      originalPrice: "₹7,999",
      color: "from-blue-500 to-blue-600",
      borderColor: "border-blue-500",
      badge: "Popular",
      modules: [
        "Introduction to Hiranyagarbha",
        "Pregnancy Month-wise Baby Development",
        "Healthy Pregnancy Lifestyle",
        "Nutrition & Diet Basics",
        "Pregnancy Yoga (Beginner)",
        "Breathing & Relaxation",
        "Meditation for Mother & Baby",
        "Garbha Samvad (Talking to Baby)",
        "Positive Affirmations",
        "Music Therapy",
        "Emotional Wellness",
        "Husband's Role in Pregnancy",
      ],
      includes: [
        "12 Recorded Video Modules",
        "Weekly Live Session",
        "Diet Charts",
        "Daily Affirmations",
        "Mobile App Access",
        "WhatsApp Support",
        "Pregnancy Journal (Digital)",
      ],
    },
    {
      id: 2,
      name: "PRO PACKAGE",
      subtitle: "Holistic Pregnancy Transformation",
      duration: "Entire Pregnancy",
      idealFor: "Mothers seeking comprehensive care",
      price: "₹9,999",
      originalPrice: "₹14,999",
      color: "from-purple-500 to-purple-600",
      borderColor: "border-purple-500",
      badge: "Best Value",
      isPopular: true,
      modules: [
        "Trimester-wise Masterclasses",
        "Advanced Pregnancy Yoga",
        "Ayurvedic Pregnancy Care",
        "Stress & Anxiety Management",
        "Couple Bonding Sessions",
        "Fetal Brain Development Activities",
        "Sanskrit Mantras & Meaning",
        "Mindfulness & Visualization",
        "Garbha Meditation Series",
        "Labour Preparation",
        "Breastfeeding Preparation",
        "Newborn Care Basics",
        "Parenting Psychology",
        "Family Counselling",
        "Nutrition Masterclass",
      ],
      includes: [
        "Everything in Basic Package",
        "Weekly Live Q&A",
        "Monthly Doctor Consultation",
        "Dietician Consultation",
        "Personalized Pregnancy Tracker",
        "Monthly Baby Growth Report",
        "Exclusive Community Access",
      ],
      exclusiveBenefits: [
        "Weekly Live Q&A Sessions",
        "Monthly Doctor Consultation",
        "Personal Dietician Consultation",
        "Personalized Pregnancy Tracker",
        "Monthly Baby Growth Reports",
        "Exclusive Community Access",
      ],
    },
    {
      id: 3,
      name: "ELITE PACKAGE",
      subtitle: "Complete Conscious Parenting Program",
      duration: "Entire Pregnancy + Postpartum",
      idealFor: "Complete pregnancy & parenting journey",
      price: "₹19,999",
      originalPrice: "₹29,999",
      color: "from-amber-500 to-orange-500",
      borderColor: "border-amber-500",
      badge: "Premium",
      isPremium: true,
      modules: [
        "Everything in Pro Package",
        "Chakra Healing Meditation",
        "Sound Healing",
        "Advanced Yoga",
        "Couple Meditation",
        "Parenting Coaching",
        "Birth Plan Creation",
        "Normal Delivery Preparation",
        "Labour Breathing Workshop",
        "Hospital Bag Checklist",
        "Emergency Preparedness",
        "Breastfeeding Coaching",
        "Postpartum Recovery",
        "Baby Massage Guidance",
        "Infant Development (0-6 Months)",
      ],
      includes: [
        "Everything in Pro Package",
        "Personalized Obstetric Consultation",
        "Nutrition Review",
        "Physiotherapy Guidance",
        "Mental Wellness Counselling",
        "High-Risk Pregnancy Guidance",
        "1:1 Mentor Support",
        "Priority WhatsApp Support",
        "Lifetime App Access",
        "Completion Certificate",
      ],
      premiumFeatures: {
        medicalCare: [
          "Personalized Obstetric Consultation",
          "Nutrition Review",
          "Physiotherapy Guidance",
          "Mental Wellness Counselling",
          "High-Risk Pregnancy Guidance (where appropriate)",
        ],
        holisticWellness: [
          "Chakra Healing Meditation",
          "Sound Healing",
          "Advanced Yoga",
          "Couple Meditation",
          "Parenting Coaching",
        ],
        birthPreparation: [
          "Birth Plan Creation",
          "Normal Delivery Preparation",
          "Labour Breathing Workshop",
          "Hospital Bag Checklist",
          "Emergency Preparedness",
        ],
        afterDelivery: [
          "Breastfeeding Coaching",
          "Postpartum Recovery",
          "Baby Massage Guidance",
          "Infant Development (0-6 Months)",
          "Parenting Masterclass",
          "Mother's Mental Health",
        ],
        premiumSupport: [
          "1:1 Mentor",
          "Priority WhatsApp Support",
          "Monthly Expert Panel",
          "Lifetime App Access",
          "Recorded Session Library",
          "E-books & Printable Resources",
          "Completion Certificate",
        ],
      },
    },
  ];

  const bonusCourses = [
    {
      name: "Pregnancy after IVF",
      price: "₹1,999",
    },
    {
      name: "Gestational Diabetes Management",
      price: "₹1,499",
    },
    {
      name: "High-Risk Pregnancy Support",
      price: "₹2,499",
    },
    {
      name: "Fertility Preparation (Pre-Conception)",
      price: "₹1,999",
    },
    {
      name: "Father-to-Be Masterclass",
      price: "₹999",
    },
    {
      name: "Grandparents' Orientation",
      price: "₹799",
    },
    {
      name: "Infant CPR & First Aid",
      price: "₹1,499",
    },
    {
      name: "Early Brain Development (0-2 Years)",
      price: "₹1,999",
    },
    {
      name: "Conscious Parenting Bootcamp",
      price: "₹2,499",
    },
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Pregnancy Care Packages
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              Choose the perfect package for your pregnancy journey. From
              foundational basics to complete conscious parenting.
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150">
            + Add New Package
          </button>
        </div>

        {/* Package Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                pkg.isPopular
                  ? "ring-2 ring-purple-500 transform scale-105"
                  : ""
              }`}
            >
              {pkg.badge && (
                <div
                  className={`absolute top-0 right-0 px-4 py-1 bg-gradient-to-r ${pkg.color} text-white text-sm font-semibold`}
                >
                  {pkg.badge}
                </div>
              )}

              {/* Header */}
              <div className={`bg-gradient-to-r ${pkg.color} p-6 text-white`}>
                <h2 className="text-2xl font-bold mb-1">{pkg.name}</h2>
                <p className="text-sm opacity-90 mb-2">{pkg.subtitle}</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold">{pkg.price}</span>
                  <span className="text-sm line-through opacity-75">
                    {pkg.originalPrice}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Duration: {pkg.duration}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>{pkg.idealFor}</span>
                  </div>
                </div>

                {/* Modules */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Course Modules ({pkg.modules.length})
                  </h3>
                  <ul className="space-y-2">
                    {pkg.modules.slice(0, 6).map((module, index) => (
                      <li
                        key={index}
                        className="flex items-start text-sm text-gray-600"
                      >
                        <svg
                          className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {module}
                      </li>
                    ))}
                    {pkg.modules.length > 6 && (
                      <li className="text-sm text-gray-500 italic">
                        +{pkg.modules.length - 6} more modules
                      </li>
                    )}
                  </ul>
                </div>

                {/* Includes */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Includes</h3>
                  <ul className="space-y-2">
                    {pkg.includes.slice(0, 4).map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start text-sm text-gray-600"
                      >
                        <svg
                          className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                    {pkg.includes.length > 4 && (
                      <li className="text-sm text-gray-500 italic">
                        +{pkg.includes.length - 4} more features
                      </li>
                    )}
                  </ul>
                </div>

                {/* Premium Features for Elite */}
                {pkg.premiumFeatures && (
                  <div className="mb-6 p-4 bg-amber-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3 text-amber-800">
                      Premium Features
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">
                          Medical Care:
                        </span>
                        <ul className="mt-1 space-y-1 text-gray-600">
                          {pkg.premiumFeatures.medicalCare.map(
                            (item, index) => (
                              <li key={index} className="flex items-start">
                                <svg
                                  className="w-3 h-3 mr-2 text-amber-500 flex-shrink-0 mt-0.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                {item}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          After Delivery:
                        </span>
                        <ul className="mt-1 space-y-1 text-gray-600">
                          {pkg.premiumFeatures.afterDelivery.map(
                            (item, index) => (
                              <li key={index} className="flex items-start">
                                <svg
                                  className="w-3 h-3 mr-2 text-amber-500 flex-shrink-0 mt-0.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                {item}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      // Handle edit
                    }}
                    className="flex-1 py-2 rounded-lg font-semibold text-blue-600 border border-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      // Handle delete
                    }}
                    className="flex-1 py-2 rounded-lg font-semibold text-red-600 border border-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
                <button
                  onClick={() => setSelectedPackage(pkg)}
                  className={`w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${pkg.color} hover:opacity-90 transition-opacity duration-200`}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bonus Courses Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Bonus Courses
            </h2>
            <p className="text-gray-600">
              Optional add-ons to enhance your pregnancy journey
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bonusCourses.map((course) => (
              <div
                key={course.name}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {bonusCourses.indexOf(course) + 1}
                  </div>
                  <span className="font-medium text-gray-800">
                    {course.name}
                  </span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {course.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Package Detail Modal */}
        {selectedPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div
                className={`bg-gradient-to-r ${selectedPackage.color} p-8 text-white sticky top-0`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-1">
                      {selectedPackage.name}
                    </h2>
                    <p className="text-lg opacity-90 mb-3">
                      {selectedPackage.subtitle}
                    </p>
                    <div className="flex items-baseline space-x-3">
                      <span className="text-4xl font-bold">
                        {selectedPackage.price}
                      </span>
                      <span className="text-xl line-through opacity-75">
                        {selectedPackage.originalPrice}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPackage(null)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-150"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <svg
                      className="w-6 h-6 mr-3 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-semibold text-gray-800">
                        {selectedPackage.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <svg
                      className="w-6 h-6 mr-3 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Ideal For</p>
                      <p className="font-semibold text-gray-800">
                        {selectedPackage.idealFor}
                      </p>
                    </div>
                  </div>
                </div>

                {/* All Modules */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Course Modules ({selectedPackage.modules.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedPackage.modules.map((module, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{module}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* All Includes */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    What's Included
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedPackage.includes.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-green-50 rounded-lg"
                      >
                        <svg
                          className="w-5 h-5 mr-3 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Premium Features for Elite */}
                {selectedPackage.premiumFeatures && (
                  <>
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Premium Features
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(selectedPackage.premiumFeatures).map(
                          ([category, features]) => (
                            <div
                              key={category}
                              className="p-4 bg-amber-50 rounded-lg"
                            >
                              <h4 className="font-semibold text-gray-800 mb-3 capitalize">
                                {category.replace(/([A-Z])/g, " $1").trim()}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {features.map((feature, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start text-sm text-gray-700"
                                  >
                                    <svg
                                      className="w-4 h-4 mr-2 text-amber-600 flex-shrink-0 mt-0.5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    {feature}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Exclusive Benefits for Pro */}
                {selectedPackage.exclusiveBenefits && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Exclusive Benefits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedPackage.exclusiveBenefits.map(
                        (benefit, index) => (
                          <div
                            key={index}
                            className="flex items-center p-3 bg-purple-50 rounded-lg"
                          >
                            <svg
                              className="w-5 h-5 mr-3 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedPackage(null)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-150"
                  >
                    Close
                  </button>
                  <button
                    className={`px-8 py-3 text-white bg-gradient-to-r ${selectedPackage.color} rounded-lg hover:opacity-90 transition-opacity duration-200 font-semibold`}
                  >
                    Choose {selectedPackage.name}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { PackagesPage };
