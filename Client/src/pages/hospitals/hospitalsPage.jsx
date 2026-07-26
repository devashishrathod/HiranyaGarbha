import React, { useState } from "react";

const HospitalsPage = () => {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");

  const hospitalsData = [
    {
      id: 1,
      name: "City General Hospital",
      location: "Mumbai, Maharashtra",
      image:
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&h=200&fit=crop",
      rating: 4.5,
      totalDoctors: 45,
      totalPatients: 2500,
      established: "1995",
      type: "Multi-Specialty",
      license: "MH-12345",
      beds: 200,
      emergency: true,
      ambulance: true,
    },
    {
      id: 2,
      name: "Sunrise Medical Center",
      location: "Delhi, NCR",
      image:
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=300&h=200&fit=crop",
      rating: 4.8,
      totalDoctors: 60,
      totalPatients: 3200,
      established: "2005",
      type: "Super-Specialty",
      license: "DL-67890",
      beds: 350,
      emergency: true,
      ambulance: true,
    },
    {
      id: 3,
      name: "Care Hospital",
      location: "Bangalore, Karnataka",
      image:
        "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=300&h=200&fit=crop",
      rating: 4.2,
      totalDoctors: 35,
      totalPatients: 1800,
      established: "2010",
      type: "Multi-Specialty",
      license: "KA-54321",
      beds: 150,
      emergency: true,
      ambulance: false,
    },
  ];

  const hospitalDetails = {
    profile: {
      name: "City General Hospital",
      location: "Mumbai, Maharashtra",
      established: "1995",
      type: "Multi-Specialty",
      license: "MH-12345",
      beds: 200,
      emergency: true,
      ambulance: true,
      description:
        "A leading multi-specialty hospital providing comprehensive healthcare services with state-of-the-art facilities and experienced medical professionals.",
      specialties: [
        "Cardiology",
        "Neurology",
        "Orthopedics",
        "Pediatrics",
        "Gynecology",
        "Oncology",
      ],
      facilities: [
        "24/7 Emergency",
        "ICU & CCU",
        "Operation Theaters",
        "Radiology & Imaging",
        "Laboratory Services",
        "Pharmacy",
      ],
    },
    engagement: {
      totalDoctors: 45,
      totalPatients: 2500,
      activePatients: 1800,
      appointmentsToday: 120,
      surgeriesThisMonth: 85,
      averageRating: 4.5,
      totalReviews: 450,
      bedOccupancy: 85,
      emergencyCases: 25,
    },
    doctors: [
      {
        id: 1,
        name: "Dr. Anjali Gupta",
        specialization: "Gynecology",
        experience: "15 years",
        rating: 4.8,
        patients: 850,
        image:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
      },
      {
        id: 2,
        name: "Dr. Rajesh Kumar",
        specialization: "Cardiology",
        experience: "20 years",
        rating: 4.9,
        patients: 1200,
        image:
          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop",
      },
      {
        id: 3,
        name: "Dr. Priya Sharma",
        specialization: "Pediatrics",
        experience: "12 years",
        rating: 4.7,
        patients: 650,
        image:
          "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop",
      },
    ],
    services: [
      {
        id: 1,
        name: "Maternity Care",
        description: "Complete pregnancy care and delivery services",
        price: "₹50,000 - ₹1,50,000",
        available: true,
      },
      {
        id: 2,
        name: "Fertility Treatment",
        description: "IVF and fertility consultation services",
        price: "₹1,00,000 - ₹3,00,000",
        available: true,
      },
      {
        id: 3,
        name: "Neonatal Care",
        description: "Specialized care for newborn babies",
        price: "₹30,000 - ₹80,000",
        available: true,
      },
    ],
    reviews: [
      {
        id: 1,
        patientName: "Sneha Patel",
        rating: 5,
        date: "2024-08-10",
        comment:
          "Excellent care and facilities. The doctors are very experienced and the staff is helpful.",
      },
      {
        id: 2,
        patientName: "Meera Reddy",
        rating: 4,
        date: "2024-08-05",
        comment:
          "Good hospital with modern equipment. Wait times can be long during peak hours.",
      },
      {
        id: 3,
        patientName: "Anita Desai",
        rating: 5,
        date: "2024-07-28",
        comment:
          "Had a wonderful experience with my delivery here. The maternity team is exceptional.",
      },
    ],
  };

  const handleAddHospital = () => {
    setModalType("add");
    setShowModal(true);
  };

  const handleEditHospital = (hospital) => {
    setSelectedHospital(hospital);
    setModalType("edit");
    setShowModal(true);
  };

  const handleDeleteHospital = (hospital) => {
    setSelectedHospital(hospital);
    setModalType("delete");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHospital(null);
  };

  const renderHospitalList = () => (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hospitals</h1>
          <p className="text-gray-600">
            Manage hospital profiles and engagement
          </p>
        </div>
        <button
          onClick={handleAddHospital}
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
          <span>Add New Hospital</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitalsData.map((hospital) => (
          <div
            key={hospital.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="relative h-48">
              <img
                src={hospital.image}
                alt={hospital.name}
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
                  {hospital.rating}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                {hospital.name}
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
                {hospital.location}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>{hospital.type}</span>
                <span>{hospital.beds} Beds</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedHospital(hospital)}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleEditHospital(hospital)}
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
                  onClick={() => handleDeleteHospital(hospital)}
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

  const renderHospitalDetails = () => {
    if (!selectedHospital) return null;

    const renderProfileTab = () => (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Hospital Information
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditHospital(selectedHospital)}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteHospital(selectedHospital)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
              >
                Delete
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Hospital Name
              </label>
              <p className="text-gray-800 font-medium">
                {hospitalDetails.profile.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Location
              </label>
              <p className="text-gray-800">
                {hospitalDetails.profile.location}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Established
              </label>
              <p className="text-gray-800">
                {hospitalDetails.profile.established}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Type
              </label>
              <p className="text-gray-800">{hospitalDetails.profile.type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                License No.
              </label>
              <p className="text-gray-800">{hospitalDetails.profile.license}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Total Beds
              </label>
              <p className="text-gray-800">{hospitalDetails.profile.beds}</p>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Description
            </label>
            <p className="text-gray-800">
              {hospitalDetails.profile.description}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Specialties
          </h2>
          <div className="flex flex-wrap gap-2">
            {hospitalDetails.profile.specialties.map((specialty, index) => (
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
            {hospitalDetails.profile.facilities.map((facility, index) => (
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
                <p className="text-sm text-gray-600 mb-1">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-800">
                  {hospitalDetails.engagement.totalDoctors}
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
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
                  {hospitalDetails.engagement.totalPatients}
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
                  {hospitalDetails.engagement.activePatients}
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
                <p className="text-sm text-gray-600 mb-1">Appointments Today</p>
                <p className="text-2xl font-bold text-gray-800">
                  {hospitalDetails.engagement.appointmentsToday}
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
                <p className="text-sm text-gray-600 mb-1">
                  Surgeries This Month
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {hospitalDetails.engagement.surgeriesThisMonth}
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
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
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
                  {hospitalDetails.engagement.averageRating}
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
                <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-800">
                  {hospitalDetails.engagement.totalReviews}
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
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Bed Occupancy</p>
                <p className="text-2xl font-bold text-gray-800">
                  {hospitalDetails.engagement.bedOccupancy}%
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
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    const renderDoctorsTab = () => (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Associated Doctors
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150">
            + Add Doctor
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitalDetails.doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">
                    {doctor.specialization}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Experience</span>
                  <span className="text-gray-800">{doctor.experience}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Patients</span>
                  <span className="text-gray-800">{doctor.patients}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rating</span>
                  <span className="text-gray-800 flex items-center">
                    <svg
                      className="w-4 h-4 text-yellow-500 mr-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {doctor.rating}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
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

    const renderServicesTab = () => (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Hospital Services
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150">
            + Add Service
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitalDetails.services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{service.name}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    service.available
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {service.available ? "Available" : "Unavailable"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {service.description}
              </p>
              <p className="text-sm font-semibold text-gray-800 mb-4">
                {service.price}
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
          {hospitalDetails.reviews.map((review) => (
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
          onClick={() => setSelectedHospital(null)}
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
          <span>Back to Hospitals</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {selectedHospital.name}
          </h1>
          <p className="text-gray-600">{selectedHospital.location}</p>
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
            onClick={() => setActiveTab("doctors")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === "doctors"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Doctors
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === "services"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Services
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
        {activeTab === "doctors" && renderDoctorsTab()}
        {activeTab === "services" && renderServicesTab()}
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
              Delete Hospital
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this hospital? This action cannot
              be undone.
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
            {modalType === "add" ? "Add New Hospital" : "Edit Hospital"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hospital Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter hospital name"
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
                <option>Multi-Specialty</option>
                <option>Super-Specialty</option>
                <option>General</option>
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
                Total Beds
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter total beds"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Enter hospital description"
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
                {modalType === "add" ? "Add Hospital" : "Update Hospital"}
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
        {selectedHospital ? renderHospitalDetails() : renderHospitalList()}
        {renderModal()}
      </div>
    </div>
  );
};

export default HospitalsPage;
