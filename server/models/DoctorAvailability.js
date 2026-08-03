const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    slotDuration: {
      type: Number,
      enum: [10, 15, 20, 30, 45, 60],
      default: 30,
    },
    breakStart: { type: String, default: null },
    breakEnd: { type: String, default: null },
  },
  { _id: false },
);

const weeklyScheduleSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6],
      required: true,
    },
    isAvailable: { type: Boolean, default: true },
    shifts: { type: [shiftSchema], default: [] },
  },
  { _id: false },
);

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      unique: true,
      index: true,
    },
    timezone: { type: String, default: "Asia/Kolkata" },
    weeklySchedule: { type: [weeklyScheduleSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("DoctorAvailability", doctorAvailabilitySchema);
