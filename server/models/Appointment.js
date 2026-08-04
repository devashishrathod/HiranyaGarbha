const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: { type: String, unique: true, index: true },
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
    scheduledBy: {
      type: String,
      enum: ["PATIENT", "ADMIN", "DOCTOR"],
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByModel",
    },
    createdByModel: {
      type: String,
      enum: ["user", "admin", "doctor"],
    },
    appointmentDate: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, default: 30 },
    timezone: { type: String, default: "Asia/Kolkata" },
    appointmentType: {
      type: String,
      enum: ["VIDEO", "AUDIO", "CLINIC", "HOME_VISIT"],
      default: "CLINIC",
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "CHECKED_IN",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
        "RESCHEDULED",
      ],
      default: "PENDING",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    consultationFee: Number,
    symptoms: String,
    notes: String,
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      default: null,
    },
    meetingLink: String,
    cancelledBy: {
      type: String,
      enum: ["PATIENT", "DOCTOR", "ADMIN"],
      default: null,
    },
    cancellationReason: String,
    rescheduledFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

// appointmentSchema.index({
//   doctorId: 1,
//   appointmentDate: 1,
//   status: 1,
// });

// appointmentSchema.index({
//   doctorId: 1,
//   startTime: 1,
//   endTime: 1,
// });

// appointmentSchema.index({
//   patientId: 1,
//   appointmentDate: -1,
// });

// appointmentSchema.index({
//   hospitalId: 1,
//   appointmentDate: -1,
// });

// appointmentSchema.index({
//   appointmentNumber: 1,
// });

// appointmentSchema.index(
//   {
//     doctorId: 1,
//     startTime: 1,
//   },
//   {
//     unique: true,
//     partialFilterExpression: {
//       status: {
//         $nin: ["CANCELLED", "NO_SHOW"],
//       },
//     },
//   },
// );

appointmentSchema.index({
  doctorId: 1,
  appointmentDate: 1,
  status: 1,
});

appointmentSchema.index({
  doctorId: 1,
  startTime: 1,
  endTime: 1,
  status: 1,
});

appointmentSchema.index({
  patientId: 1,
  appointmentDate: -1,
});

appointmentSchema.index({
  hospitalId: 1,
  appointmentDate: -1,
});

module.exports = mongoose.model("Appointment", appointmentSchema);
