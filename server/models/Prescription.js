const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: true,
      trim: true,
    },

    dosage: {
      type: String,
      required: true,
      trim: true,
    },

    frequency: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: String,
      required: true,
      trim: true,
    },

    route: {
      type: String,
      default: "ORAL",
      trim: true,
    },

    instructions: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { _id: true },
);

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionNumber: {
      type: String,
      unique: true,
      index: true,
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
      index: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      index: true,
    },

    diagnosis: {
      type: String,
      trim: true,
      default: null,
    },

    symptoms: {
      type: String,
      trim: true,
      default: null,
    },

    medicines: {
      type: [medicineSchema],
      default: [],
    },

    labTests: {
      type: [
        {
          testName: {
            type: String,
            required: true,
            trim: true,
          },

          instructions: {
            type: String,
            default: null,
            trim: true,
          },
        },
      ],
      default: [],
    },

    advice: {
      type: String,
      trim: true,
      default: null,
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
      index: true,
    },

    prescribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

prescriptionSchema.index({
  patientId: 1,
  createdAt: -1,
});

prescriptionSchema.index({
  doctorId: 1,
  createdAt: -1,
});

prescriptionSchema.index({
  hospitalId: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
