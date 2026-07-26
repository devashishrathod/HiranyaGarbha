import React, { useState } from "react";

const LabsPage = () => {
  const [selectedLab, setSelectedLab] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");

  const labsData = [
    {
      id: 1,
      name: "Pathology Diagnostics Lab",
      location: "Mumbai, Maharashtra",
      image:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&h=200&fit=crop",
      rating: 4.6,
      totalTests: 150,
      totalPatients: 5000,
      established: "2000",
      type: "Pathology",
      license: "MH-LAB-12345",
      accreditation: "NABL",
      homeCollection: true,
      onlineReports: true,
    },
    {
      id: 2,
      name: "Advanced Imaging Center",
      location: "Delhi, NCR",
      image:
        "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=300&h=200&fit=crop",
      rating: 4.7,
      totalTests: 200,
      totalPatients: 6200,
      established: "2008",
      type: "Radiology & Imaging",
      license: "DL-LAB-67890",
      accreditation: "NABH",
      homeCollection: false,
      onlineReports: true,
    },
    {
      id: 3,
      name: "Genetic Research Lab",
      location: "Bangalore, Karnataka",
      image:
        "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=300&h=200&fit=crop",
      rating: 4.4,
      totalTests: 80,
      totalPatients: 2800,
      established: "2015",
      type: "Genetics",
      license: "KA-LAB-54321",
      accreditation: "NABL",
      homeCollection: true,
      onlineReports: true,
    },
  ];

  const labDetails = {
    profile: {
      name: "Pathology Diagnostics Lab",
      location: "Mumbai, Maharashtra",
      established: "2000",
      type: "Pathology",
      license: "MH-LAB-12345",
      accreditation: "NABL",
      homeCollection: true,
      onlineReports: true,
      description:
        "A state-of-the-art pathology laboratory providing comprehensive diagnostic services with accurate and timely results.",
      specialties: [
        "Blood Tests",
        "Urine Analysis",
        "Biopsy",
        "Microbiology",
        "Immunology",
        "Biochemistry",
      ],
      facilities: [
        "24/7 Sample Collection",
        "Home Collection Service",
        "Online Report Access",
        "Quality Control",
        "Expert Pathologists",
        "Emergency Testing",
      ],
    },
    engagement: {
      totalTests: 150,
      totalPatients: 5000,
      activePatients: 3500,
      testsToday: 180,
      reportsGenerated: 4500,
      averageRating: 4.6,
      totalReviews: 320,
      homeCollectionOrders: 120,
      onlineReportViews: 3800,
    },
    tests: [
      {
        id: 1,
        name: "Complete Blood Count (CBC)",
        category: "Hematology",
        price: "₹350",
        sampleType: "Blood",
        turnaround: "4 hours",
        available: true,
      },
      {
        id: 2,
        name: "Lipid Profile",
        category: "Biochemistry",
        price: "₹500",
        sampleType: "Blood",
        turnaround: "6 hours",
        available: true,
      },
      {
        id: 3,
        name: "Thyroid Function Test",
        category: "Immunology",
        price: "₹450",
        sampleType: "Blood",
        turnaround: "8 hours",
        available: true,
      },
      {
        id: 4,
        name: "Urine Routine & Microscopy",
        category: "Clinical Pathology",
        price: "₹150",
        sampleType: "Urine",
        turnaround: "2 hours",
        available: true,
      },
    ],
    equipment: [
      {
        id: 1,
        name: "Automated Hematology Analyzer",
        brand: "Sysmex",
        model: "XN-1000",
        status: "Operational",
        lastMaintenance: "2024-07-15",
      },
      {
        id: 2,
        name: "Biochemistry Analyzer",
        brand: "Roche",
        model: "Cobas c311",
        status: "Operational",
        lastMaintenance: "2024-07-20",
      },
      {
        id: 3,
        name: "Microscope",
        brand: "Olympus",
        model: "BX53",
        status: "Operational",
        lastMaintenance: "2024-07-10",
      },
    ],
    reviews: [
      {
        id: 1,
        patientName: "Rajesh Verma",
        rating: 5,
        date: "2024-08-12",
        comment:
          "Very accurate results and quick turnaround. Home collection service is excellent.",
      },
      {
        id: 2,
        patientName: "Kavita Singh",
        rating: 4,
        date: "2024-08-08",
        comment:
          "Good lab with professional staff. Online reports are easy to access.",
      },
      {
        id: 3,
        patientName: "Suresh Kumar",
        rating: 5,
        date: "2024-08-02",
        comment:
          "Best pathology lab in the area. NABL accredited and very reliable.",
      },
    ],
  };

  const handleAddLab = () => {
    setModalType("add");
    setShowModal(true);
  };

  const handleEditLab = (lab) => {
    setSelectedLab(lab);
    setModalType("edit");
    setShowModal(true);
  };

  const handleDeleteLab = (lab) => {
    setSelectedLab(lab);
    setModalType("delete");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLab(null);
  };

  const renderLabList = () => (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Labs</h1>
          <p className="text-gray-600">
            Manage laboratory profiles and engagement
          </p>
        </div>
        <button
          onClick={handleAddLab}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-md flex items-center justify-center space-x-2"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Add New Lab</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {labsData.map((lab) => (
          <div
            key={lab.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="relative h-48">
              <img
                src={lab.image}
                alt={lab.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm">
                <svg
                  className="w-4 h-4 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-semibold text-gray-800">
                  {lab.rating}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                {lab.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {lab.location}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>{lab.type}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {lab.accreditation}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedLab(lab)}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleEditLab(lab)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
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
                  onClick={() => handleDeleteLab(lab)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
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
          </div>
        ))}
      </div>
    </div>
  );

  const renderLabDetails = () => {
    if (!selectedLab) return null;

    const renderProfileTab = () => (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Laboratory Information
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditLab(selectedLab)}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteLab(selectedLab)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
              >
                Delete
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Lab Name
              </label>
              <p className="text-gray-800 font-medium">
                {labDetails.profile.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Location
              </label>
              <p className="text-gray-800">{labDetails.profile.location}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Established
              </label>
              <p className="text-gray-800">{labDetails.profile.established}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Type
              </label>
              <p className="text-gray-800">{labDetails.profile.type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                License No.
              </label>
              <p className="text-gray-800">{labDetails.profile.license}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Accreditation
              </label>
              <p className="text-gray-800">
                {labDetails.profile.accreditation}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Description
            </label>
            <p className="text-gray-800">{labDetails.profile.description}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Specialties
          </h2>
          <div className="flex flex-wrap gap-2">
            {labDetails.profile.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Facilities
          </h2>
          <div className="flex flex-wrap gap-2">
            {labDetails.profile.facilities.map((facility, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium"
              >
                {facility}
              </span>
            ))}
          </div>
        </div>
      </div>
    );

    const renderEngagementTab = () => (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tests</p>
                <p className="text-2xl font-bold text-gray-800">
                  {labDetails.engagement.totalTests}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                <p className="text-2xl font-bold text-gray-800">
                  {labDetails.engagement.totalPatients}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Patients</p>
                <p className="text-2xl font-bold text-gray-800">
                  {labDetails.engagement.activePatients}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tests Today</p>
                <p className="text-2xl font-bold text-gray-800">
                  {labDetails.engagement.testsToday}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Reports Generated</p>
                <p className="text-2xl font-bold text-gray-800">
                  {labDetails.engagement.reportsGenerated}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                <p className="text-2xl font-bold text-gray-800">
                  {labDetails.engagement.averageRating}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Home Collection</p>
                <p className="text-2xl font-bold text-gray-800">
                  {labDetails.engagement.homeCollectionOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Online Report Views
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {labDetails.engagement.onlineReportViews}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    const renderTestsTab = () => (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Available Tests
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150">
            + Add Test
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labDetails.tests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{test.name}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    test.available
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {test.available ? "Available" : "Unavailable"}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category</span>
                  <span className="text-gray-800">{test.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sample Type</span>
                  <span className="text-gray-800">{test.sampleType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Turnaround</span>
                  <span className="text-gray-800">{test.turnaround}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-4">
                {test.price}
              </p>
              <div className="flex space-x-2">
                <button className="flex-1 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-150">
                  Edit
                </button>
                <button className="flex-1 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors duration-150">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    const renderEquipmentTab = () => (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Laboratory Equipment
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150">
            + Add Equipment
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Equipment Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Last Maintenance
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {labDetails.equipment.map((equipment) => (
                <tr
                  key={equipment.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {equipment.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{equipment.brand}</td>
                  <td className="px-6 py-4 text-gray-600">{equipment.model}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        equipment.status === "Operational"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {equipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {equipment.lastMaintenance}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
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
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );

    const renderReviewsTab = () => (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Patient Reviews
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150">
            + Add Review
          </button>
        </div>
        <div className="space-y-4">
          {labDetails.reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {review.patientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {review.patientName}
                    </h3>
                    <p className="text-sm text-gray-600">{review.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? "text-yellow-500" : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-800">{review.comment}</p>
              <div className="flex space-x-2 mt-4">
                <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
                  Edit
                </button>
                <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <div>
        <button
          onClick={() => setSelectedLab(null)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back to Labs</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {selectedLab.name}
          </h1>
          <p className="text-gray-600">{selectedLab.location}</p>
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === "profile"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("engagement")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === "engagement"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Engagement
          </button>
          <button
            onClick={() => setActiveTab("tests")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === "tests"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Tests
          </button>
          <button
            onClick={() => setActiveTab("equipment")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === "equipment"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Equipment
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === "reviews"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Reviews
          </button>
        </div>

        {activeTab === "profile" && renderProfileTab()}
        {activeTab === "engagement" && renderEngagementTab()}
        {activeTab === "tests" && renderTestsTab()}
        {activeTab === "equipment" && renderEquipmentTab()}
        {activeTab === "reviews" && renderReviewsTab()}
      </div>
    );
  };

  const renderModal = () => {
    if (!showModal) return null;

    if (modalType === "delete") {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Delete Lab
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this lab? This action cannot be
              undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-150"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {modalType === "add" ? "Add New Lab" : "Edit Lab"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lab Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter lab name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Pathology</option>
                <option>Radiology & Imaging</option>
                <option>Genetics</option>
                <option>Multi-Specialty</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter license number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accreditation
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>NABL</option>
                <option>NABH</option>
                <option>CAP</option>
                <option>ISO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Enter lab description"
              />
            </div>
            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
              >
                {modalType === "add" ? "Add Lab" : "Update Lab"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {selectedLab ? renderLabDetails() : renderLabList()}
        {renderModal()}
      </div>
    </div>
  );
};

export default LabsPage;
