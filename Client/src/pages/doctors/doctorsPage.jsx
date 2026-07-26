import React, { useState } from "react";

const DoctorsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Dummy Doctors List Data
  const doctorsList = [
    {
      id: 1,
      name: "Dr. Anjali Gupta",
      specialization: "Obstetrician & Gynecologist",
      experience: "15 years",
      hospital: "City Hospital, Gurgaon",
      rating: 4.8,
      reviews: 245,
      patients: 1200,
      status: "Active",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop"
    },
    {
      id: 2,
      name: "Dr. Rajesh Kumar",
      specialization: "Fetal Medicine Specialist",
      experience: "12 years",
      hospital: "Apollo Hospital, Delhi",
      rating: 4.7,
      reviews: 189,
      patients: 980,
      status: "Active",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop"
    },
    {
      id: 3,
      name: "Dr. Sunita Sharma",
      specialization: "Nutritionist & Dietician",
      experience: "10 years",
      hospital: "Fortis Hospital, Gurgaon",
      rating: 4.9,
      reviews: 312,
      patients: 1500,
      status: "Active",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop"
    }
  ];

  // Dummy Doctor Profile Data
  const doctorProfile = {
    personalDetails: {
      fullName: "Dr. Anjali Gupta",
      dateOfBirth: "1980-03-15",
      gender: "Female",
      bloodGroup: "B+",
      email: "dr.anjali@cityhospital.com",
      phone: "+91 98765 11111",
      address: "45, Medical Complex, Sector 14, Gurgaon, Haryana - 122001"
    },
    professionalDetails: {
      specialization: "Obstetrician & Gynecologist",
      qualifications: "MBBS, MD (Obstetrics & Gynecology)",
      experience: "15 years",
      licenseNumber: "MCI-12345",
      hospital: "City Hospital, Gurgaon",
      department: "Obstetrics & Gynecology",
      consultationFee: "₹1,500",
      availableDays: "Mon - Sat",
      availableTime: "9:00 AM - 5:00 PM"
    },
    expertise: [
      "High-Risk Pregnancy",
      "Normal Delivery",
      "C-Section",
      "Infertility Treatment",
      "PCOD/PCOS Management",
      "Menopause Care"
    ],
    languages: ["Hindi", "English", "Punjabi"]
  };

  // Dummy Engagement Dashboard Data
  const engagementData = {
    totalPatients: 1200,
    activePatients: 850,
    newPatientsThisMonth: 45,
    appointmentsToday: 12,
    appointmentsThisWeek: 68,
    appointmentsThisMonth: 245,
    averageRating: 4.8,
    totalReviews: 245,
    responseRate: 92,
    patientSatisfaction: 94
  };

  // Dummy Reviews Data
  const reviews = [
    {
      id: 1,
      patientName: "Priya Sharma",
      rating: 5,
      date: "2024-08-10",
      comment: "Dr. Anjali is extremely caring and knowledgeable. She guided me throughout my pregnancy and made the entire journey smooth. Highly recommended!",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop"
    },
    {
      id: 2,
      patientName: "Neha Verma",
      rating: 5,
      date: "2024-08-08",
      comment: "Best doctor ever! She explained everything clearly and was always available for queries. My delivery was smooth thanks to her expertise.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop"
    },
    {
      id: 3,
      patientName: "Sneha Kapoor",
      rating: 4,
      date: "2024-08-05",
      comment: "Very professional and experienced. The hospital staff is also cooperative. Would definitely recommend to others.",
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=50&h=50&fit=crop"
    },
    {
      id: 4,
      patientName: "Ritu Agarwal",
      rating: 5,
      date: "2024-08-02",
      comment: "Dr. Anjali is not just a doctor but a friend. She understands patient concerns and provides the best treatment.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop"
    }
  ];

  // Dummy Appointments Data
  const appointments = {
    today: [
      {
        id: 1,
        patientName: "Priya Sharma",
        time: "9:00 AM",
        type: "Checkup",
        status: "Confirmed",
        reason: "Regular checkup"
      },
      {
        id: 2,
        patientName: "Neha Verma",
        time: "10:30 AM",
        type: "Follow-up",
        status: "Confirmed",
        reason: "Post-delivery checkup"
      },
      {
        id: 3,
        patientName: "Sneha Kapoor",
        time: "12:00 PM",
        type: "Consultation",
        status: "Pending",
        reason: "First consultation"
      }
    ],
    upcoming: [
      {
        id: 4,
        patientName: "Ritu Agarwal",
        date: "2024-08-12",
        time: "11:00 AM",
        type: "Checkup",
        status: "Confirmed"
      },
      {
        id: 5,
        patientName: "Meera Joshi",
        date: "2024-08-14",
        time: "3:00 PM",
        type: "Ultrasound",
        status: "Confirmed"
      }
    ]
  };

  // Dummy Patient Attendance Data
  const patientAttendance = [
    {
      patientName: "Priya Sharma",
      totalSessions: 12,
      attended: 11,
      missed: 1,
      attendanceRate: 92
    },
    {
      patientName: "Neha Verma",
      totalSessions: 8,
      attended: 8,
      missed: 0,
      attendanceRate: 100
    },
    {
      patientName: "Sneha Kapoor",
      totalSessions: 15,
      attended: 13,
      missed: 2,
      attendanceRate: 87
    },
    {
      patientName: "Ritu Agarwal",
      totalSessions: 10,
      attended: 9,
      missed: 1,
      attendanceRate: 90
    }
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Doctors Management</h1>
          <p className="text-gray-600">View and manage doctor profiles, engagement, reviews, and appointments</p>
        </div>

        {!selectedDoctor ? (
          /* Doctors List View */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">All Doctors</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150">
                + Add New Doctor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctorsList.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Experience</span>
                      <span className="text-gray-800">{doctor.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hospital</span>
                      <span className="text-gray-800">{doctor.hospital}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rating</span>
                      <span className="text-gray-800 flex items-center">
                        ⭐ {doctor.rating} ({doctor.reviews})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Patients</span>
                      <span className="text-gray-800">{doctor.patients}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doctor.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {doctor.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Single Doctor Detail View */
          <div>
            <button
              onClick={() => setSelectedDoctor(null)}
              className="mb-6 flex items-center text-blue-600 hover:text-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Doctors List
            </button>

            {/* Doctor Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center space-x-6">
                <img
                  src={selectedDoctor.image}
                  alt={selectedDoctor.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white"
                />
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-1">{selectedDoctor.name}</h2>
                  <p className="text-lg opacity-90 mb-2">{selectedDoctor.specialization}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span>⭐ {selectedDoctor.rating} ({selectedDoctor.reviews} reviews)</span>
                    <span>•</span>
                    <span>{selectedDoctor.patients} patients</span>
                    <span>•</span>
                    <span>{selectedDoctor.experience}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors duration-150">
                    Edit Profile
                  </button>
                  <button className="px-4 py-2 bg-red-500 bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-colors duration-150">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "profile"
                    ? "bg-white text-teal-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("engagement")}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "engagement"
                    ? "bg-white text-teal-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Engagement
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "reviews"
                    ? "bg-white text-teal-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "appointments"
                    ? "bg-white text-teal-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Appointments
              </button>
              <button
                onClick={() => setActiveTab("attendance")}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "attendance"
                    ? "bg-white text-teal-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Patient Attendance
              </button>
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Personal Details</h2>
                    <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                      <p className="text-gray-800 font-medium">{doctorProfile.personalDetails.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                      <p className="text-gray-800">{doctorProfile.personalDetails.dateOfBirth}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                      <p className="text-gray-800">{doctorProfile.personalDetails.gender}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Blood Group</label>
                      <p className="text-gray-800">{doctorProfile.personalDetails.bloodGroup}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                      <p className="text-gray-800">{doctorProfile.personalDetails.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                      <p className="text-gray-800">{doctorProfile.personalDetails.phone}</p>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                      <p className="text-gray-800">{doctorProfile.personalDetails.address}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Professional Details</h2>
                    <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Specialization</label>
                      <p className="text-gray-800 font-medium">{doctorProfile.professionalDetails.specialization}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Qualifications</label>
                      <p className="text-gray-800">{doctorProfile.professionalDetails.qualifications}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Experience</label>
                      <p className="text-gray-800">{doctorProfile.professionalDetails.experience}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">License Number</label>
                      <p className="text-gray-800">{doctorProfile.professionalDetails.licenseNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Hospital</label>
                      <p className="text-gray-800">{doctorProfile.professionalDetails.hospital}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                      <p className="text-gray-800">{doctorProfile.professionalDetails.department}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Consultation Fee</label>
                      <p className="text-gray-800">{doctorProfile.professionalDetails.consultationFee}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Available Days</label>
                      <p className="text-gray-800">{doctorProfile.professionalDetails.availableDays}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Available Time</label>
                      <p className="text-gray-800">{doctorProfile.professionalDetails.availableTime}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">Expertise</h2>
                      <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
                        Edit
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doctorProfile.expertise.map((item, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">Languages</h2>
                      <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
                        Edit
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doctorProfile.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Engagement Tab */}
            {activeTab === "engagement" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{engagementData.totalPatients}</p>
                  <p className="text-sm text-gray-500">Total Patients</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{engagementData.activePatients}</p>
                  <p className="text-sm text-gray-500">Active Patients</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{engagementData.appointmentsToday}</p>
                  <p className="text-sm text-gray-500">Appointments Today</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{engagementData.averageRating}</p>
                  <p className="text-sm text-gray-500">Average Rating</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{engagementData.totalReviews}</p>
                  <p className="text-sm text-gray-500">Total Reviews</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{engagementData.patientSatisfaction}%</p>
                  <p className="text-sm text-gray-500">Patient Satisfaction</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{engagementData.responseRate}%</p>
                  <p className="text-sm text-gray-500">Response Rate</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{engagementData.newPatientsThisMonth}</p>
                  <p className="text-sm text-gray-500">New Patients (This Month)</p>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Patient Reviews</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150">
                    + Add Review
                  </button>
                </div>
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={review.image}
                        alt={review.patientName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-800">{review.patientName}</h3>
                            <p className="text-sm text-gray-500">{review.date}</p>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, index) => (
                              <svg
                                key={index}
                                className={`w-5 h-5 ${
                                  index < review.rating ? "text-amber-400" : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === "appointments" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Appointments</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150">
                    + Add Appointment
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Appointments</h3>
                  <div className="space-y-3">
                    {appointments.today.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                            {appointment.patientName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{appointment.patientName}</p>
                            <p className="text-sm text-gray-500">{appointment.reason}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium text-gray-800">{appointment.time}</p>
                            <p className="text-sm text-gray-500">{appointment.type}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            appointment.status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Appointments</h3>
                  <div className="space-y-3">
                    {appointments.upcoming.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                            {appointment.patientName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{appointment.patientName}</p>
                            <p className="text-sm text-gray-500">{appointment.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium text-gray-800">{appointment.date}</p>
                            <p className="text-sm text-gray-500">{appointment.time}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Patient Attendance Tab */}
            {activeTab === "attendance" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Patient Attendance</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150">
                    + Add Patient
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Patient Name</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Total Sessions</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Attended</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Missed</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Attendance Rate</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientAttendance.map((patient, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-800">{patient.patientName}</td>
                          <td className="py-3 px-4 text-center">{patient.totalSessions}</td>
                          <td className="py-3 px-4 text-center text-green-600">{patient.attended}</td>
                          <td className="py-3 px-4 text-center text-red-600">{patient.missed}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              patient.attendanceRate >= 90 ? "bg-green-100 text-green-700" : 
                              patient.attendanceRate >= 75 ? "bg-yellow-100 text-yellow-700" : 
                              "bg-red-100 text-red-700"
                            }`}>
                              {patient.attendanceRate}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button className="text-blue-600 hover:text-blue-700 mr-2">Edit</button>
                            <button className="text-red-600 hover:text-red-700">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { DoctorsPage };
