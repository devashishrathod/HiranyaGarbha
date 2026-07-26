import React, { useState } from "react";

const PatientProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  // Dummy Patient Profile Data
  const patientData = {
    personalDetails: {
      fullName: "Priya Sharma",
      dateOfBirth: "1992-05-15",
      age: 32,
      bloodGroup: "O+",
      height: "165 cm",
      weight: "68 kg",
      email: "priya.sharma@email.com",
      phone: "+91 98765 43210",
      address:
        "123, Green Valley Apartments, Sector 15, Gurgaon, Haryana - 122001",
    },
    obstetricHistory: {
      lmp: "2024-02-15",
      edd: "2024-11-22",
      currentTrimester: "Third Trimester",
      gravida: 2,
      para: 1,
      abortions: 0,
      previousDeliveries: [
        {
          year: 2020,
          type: "Normal Delivery",
          babyWeight: "3.2 kg",
          complications: "None",
        },
      ],
    },
    medicalConditions: [
      "Gestational Diabetes (Controlled)",
      "Mild Hypothyroidism",
    ],
    medications: [
      {
        name: "Thyroxine 50mcg",
        dosage: "Once daily",
        frequency: "Morning",
      },
      {
        name: "Iron Supplement",
        dosage: "100mg",
        frequency: "Twice daily",
      },
      {
        name: "Calcium + Vitamin D3",
        dosage: "500mg",
        frequency: "Once daily",
      },
    ],
    doctorDetails: {
      primaryDoctor: "Dr. Anjali Gupta",
      specialization: "Obstetrician & Gynecologist",
      hospital: "City Hospital, Gurgaon",
      phone: "+91 98765 11111",
      email: "dr.anjali@cityhospital.com",
    },
    preferredLanguage: "Hindi, English",
    emergencyContact: {
      name: "Rajesh Sharma",
      relationship: "Husband",
      phone: "+91 98765 43211",
      address: "Same as patient",
    },
  };

  // Dummy Engagement Dashboard Data
  const engagementData = {
    lastLogin: "2024-08-10 09:30 AM",
    daysInactive: 2,
    videosWatched: 24,
    totalVideos: 45,
    meditationCompleted: 18,
    totalMeditations: 30,
    dailyChecklistCompletion: 85,
    missedSessions: 3,
    assessmentScores: {
      overall: 78,
      nutrition: 82,
      wellness: 75,
      knowledge: 76,
    },
    weeklyActivity: [
      { day: "Mon", videos: 3, meditation: 2, checklist: true },
      { day: "Tue", videos: 2, meditation: 1, checklist: true },
      { day: "Wed", videos: 4, meditation: 3, checklist: true },
      { day: "Thu", videos: 1, meditation: 0, checklist: false },
      { day: "Fri", videos: 3, meditation: 2, checklist: true },
      { day: "Sat", videos: 2, meditation: 1, checklist: true },
      { day: "Sun", videos: 0, meditation: 0, checklist: false },
    ],
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Patient Profile
            </h1>
            <p className="text-gray-600">
              View and manage patient information and engagement
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150">
            + Add New Patient
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === "profile"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Patient Profile
          </button>
          <button
            onClick={() => setActiveTab("engagement")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === "engagement"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Engagement Dashboard
          </button>
        </div>

        {/* Patient Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Personal Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Personal Details
                </h2>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
                    Edit
                  </button>
                  <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150">
                    Delete
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Full Name
                  </label>
                  <p className="text-gray-800 font-medium">
                    {patientData.personalDetails.fullName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Date of Birth
                  </label>
                  <p className="text-gray-800">
                    {patientData.personalDetails.dateOfBirth}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Age
                  </label>
                  <p className="text-gray-800">
                    {patientData.personalDetails.age} years
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Blood Group
                  </label>
                  <p className="text-gray-800">
                    {patientData.personalDetails.bloodGroup}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Height
                  </label>
                  <p className="text-gray-800">
                    {patientData.personalDetails.height}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Weight
                  </label>
                  <p className="text-gray-800">
                    {patientData.personalDetails.weight}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  <p className="text-gray-800">
                    {patientData.personalDetails.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Phone
                  </label>
                  <p className="text-gray-800">
                    {patientData.personalDetails.phone}
                  </p>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Address
                  </label>
                  <p className="text-gray-800">
                    {patientData.personalDetails.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Obstetric History Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Obstetric History
                </h2>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
                    Edit
                  </button>
                  <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150">
                    Delete
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    LMP (Last Menstrual Period)
                  </label>
                  <p className="text-gray-800">
                    {patientData.obstetricHistory.lmp}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    EDD (Expected Due Date)
                  </label>
                  <p className="text-gray-800">
                    {patientData.obstetricHistory.edd}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Current Trimester
                  </label>
                  <p className="text-gray-800">
                    {patientData.obstetricHistory.currentTrimester}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Gravida
                  </label>
                  <p className="text-gray-800">
                    {patientData.obstetricHistory.gravida}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Para
                  </label>
                  <p className="text-gray-800">
                    {patientData.obstetricHistory.para}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Abortions
                  </label>
                  <p className="text-gray-800">
                    {patientData.obstetricHistory.abortions}
                  </p>
                </div>
              </div>

              {/* Previous Deliveries */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Previous Deliveries
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {patientData.obstetricHistory.previousDeliveries.map(
                    (delivery, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Year
                          </label>
                          <p className="text-gray-800">{delivery.year}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Type
                          </label>
                          <p className="text-gray-800">{delivery.type}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Baby Weight
                          </label>
                          <p className="text-gray-800">{delivery.babyWeight}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Complications
                          </label>
                          <p className="text-gray-800">
                            {delivery.complications}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Medical Conditions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Medical Conditions
                </h2>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
                    Edit
                  </button>
                  <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150">
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {patientData.medicalConditions.map((condition, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>

            {/* Medications Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Medications
                </h2>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
                    Edit
                  </button>
                  <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150">
                    Delete
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {patientData.medications.map((medication, index) => (
                  <div
                    key={index}
                    className="flex items-start p-4 bg-blue-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-4 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">
                        {medication.name}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>Dosage: {medication.dosage}</span>
                        <span>•</span>
                        <span>{medication.frequency}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Doctor Details
                </h2>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
                    Edit
                  </button>
                  <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150">
                    Delete
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Primary Doctor
                  </label>
                  <p className="text-gray-800 font-medium">
                    {patientData.doctorDetails.primaryDoctor}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Specialization
                  </label>
                  <p className="text-gray-800">
                    {patientData.doctorDetails.specialization}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Hospital
                  </label>
                  <p className="text-gray-800">
                    {patientData.doctorDetails.hospital}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Phone
                  </label>
                  <p className="text-gray-800">
                    {patientData.doctorDetails.phone}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  <p className="text-gray-800">
                    {patientData.doctorDetails.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Preferred Language & Emergency Contact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Preferred Language
                  </h2>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
                      Edit
                    </button>
                    <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150">
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-gray-800">{patientData.preferredLanguage}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Emergency Contact
                  </h2>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
                      Edit
                    </button>
                    <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150">
                      Delete
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Name
                    </label>
                    <p className="text-gray-800 font-medium">
                      {patientData.emergencyContact.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Relationship
                    </label>
                    <p className="text-gray-800">
                      {patientData.emergencyContact.relationship}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Phone
                    </label>
                    <p className="text-gray-800">
                      {patientData.emergencyContact.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Dashboard Tab */}
        {activeTab === "engagement" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500">Last Login</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {engagementData.daysInactive}d ago
                </p>
                <p className="text-sm text-gray-500">
                  {engagementData.lastLogin}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
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
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500">Videos</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {engagementData.videosWatched}/{engagementData.totalVideos}
                </p>
                <p className="text-sm text-gray-500">Videos watched</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
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
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500">Meditation</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {engagementData.meditationCompleted}/
                  {engagementData.totalMeditations}
                </p>
                <p className="text-sm text-gray-500">Sessions completed</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-amber-600"
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
                  <span className="text-xs text-gray-500">Checklist</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {engagementData.dailyChecklistCompletion}%
                </p>
                <p className="text-sm text-gray-500">Daily completion rate</p>
              </div>
            </div>

            {/* Missed Sessions & Assessment Scores */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Missed Sessions
                </h2>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl font-bold text-red-600">
                        {engagementData.missedSessions}
                      </span>
                    </div>
                    <p className="text-gray-600">Sessions missed this month</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Assessment Scores
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Overall Score
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {engagementData.assessmentScores.overall}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${engagementData.assessmentScores.overall}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Nutrition
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {engagementData.assessmentScores.nutrition}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${engagementData.assessmentScores.nutrition}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Wellness
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {engagementData.assessmentScores.wellness}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${engagementData.assessmentScores.wellness}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Knowledge
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {engagementData.assessmentScores.knowledge}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${engagementData.assessmentScores.knowledge}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Weekly Activity
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Day
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                        Videos Watched
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                        Meditation
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                        Daily Checklist
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {engagementData.weeklyActivity.map((activity) => (
                      <tr
                        key={activity.day}
                        className="border-b border-gray-100"
                      >
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {activity.day}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                              activity.videos > 0
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {activity.videos}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                              activity.meditation > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {activity.meditation}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {activity.checklist ? (
                            <svg
                              className="w-6 h-6 text-green-600 mx-auto"
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
                          ) : (
                            <svg
                              className="w-6 h-6 text-red-500 mx-auto"
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
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { PatientProfilePage };
