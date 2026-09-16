const mongoose = require("mongoose");

const doctorLeaveSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      enum: ["FULL_DAY", "HALF_DAY", "CUSTOM"],
      default: "FULL_DAY",
    },
    leaveDate: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      default: null,
    },
    endTime: {
      type: String,
      default: null,
    },
    reason: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,

      enum: ["ACTIVE", "CANCELLED"],

      default: "ACTIVE",

      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,

      refPath: "createdByModel",

      required: true,
    },

    createdByModel: {
      type: String,

      enum: ["Doctor", "Admin"],

      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

doctorLeaveSchema.index({
  doctor: 1,

  leaveDate: 1,

  status: 1,
});

doctorLeaveSchema.index({
  leaveDate: 1,
});

module.exports = mongoose.model("DoctorLeave", doctorLeaveSchema);
