const mongoose = require("mongoose");

const previousDeliverySchema = new mongoose.Schema(
  {
    year: { type: Number },
    type: { type: String }, // e.g. "Normal Delivery", "C-Section"
    babyWeight: { type: String },
    complications: { type: String, default: "None" },
  },
  { _id: false }
);

const medicationSchema = new mongoose.Schema(
  {
    name: { type: String },
    dosage: { type: String },
    frequency: { type: String },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Personal Details
    fullName: { type: String, trim: true },
    husbandOrParentName: { type: String, trim: true },
    profession: { type: String, trim: true }, // e.g. "Housewife", "Teacher"
    dateOfBirth: { type: String },
    age: { type: Number },
    bloodGroup: { type: String },
    height: { type: String },
    weight: { type: String },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: { type: String },
    whatsappNumber: { type: String },
    address: { type: String },

    // Obstetric History
    lmp: { type: String }, // Last Menstrual Period
    edd: { type: String }, // Expected Due Date
    currentTrimester: { type: String },
    gravida: { type: Number, default: 0 },
    para: { type: Number, default: 0 },
    abortions: { type: Number, default: 0 },
    previousDeliveries: [previousDeliverySchema],

    // Medical Conditions & Medications
    medicalConditions: [{ type: String }],
    medications: [medicationSchema],

    // Primary Doctor Details
    primaryDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: false,
    },
    doctorDetails: {
      doctorName: { type: String },
      specialization: { type: String },
      hospital: { type: String },
      phone: { type: String },
      email: { type: String },
    },

    // Preferences & Emergency Contact
    preferredLanguage: { type: String },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
      address: { type: String },
    },
    // Garbhsanskar Background (asked while onboarding the patient)
    heardAboutGarbhsanskar: { type: String }, // "Yes" / "No"
    expectationsFromHiranyagarbha: { type: String },

    image: { type: String },
    // Status Flags
    isProfileCompleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Patient", patientSchema);
