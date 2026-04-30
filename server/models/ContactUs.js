const mongoose = require("mongoose");
const validator = require("validator");
const { isValidPhoneNumber } = require("../validator/common");

const contactUsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: (props) => `${props.value} is not a valid email address`,
      },
    },
    mobile: {
      type: Number,
      required: true,
      validate: {
        validator: isValidPhoneNumber,
        message: (props) => `${props.value} is not a valid mobile number`,
      },
    },
    city: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    isPermissionGiven: { type: Boolean, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("ContactUs", contactUsSchema);
