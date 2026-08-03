const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    availabilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorAvailability",
    },
    // Personal Details
    fullName: { type: String, trim: true },
    dateOfBirth: { type: String },
    gender: { type: String },
    bloodGroup: { type: String },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: { type: String },
    address: { type: String },
    image: { type: String },

    // Professional Details
    specialization: { type: String },
    qualifications: { type: String },
    experience: { type: String },
    licenseNumber: { type: String },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: false,
    },
    department: { type: String },
    consultationFee: { type: String },
    availableDays: { type: String },
    availableTime: { type: String },

    // Expertise & Languages
    expertise: [{ type: String }],
    languages: [{ type: String }],

    // Ratings & Engagement Stats
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    patientsCount: { type: Number, default: 0 },
    status: { type: String, default: "Active" },

    // Status Flags
    isProfileCompleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Doctor", doctorSchema);
