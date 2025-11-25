const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [
        function () {
          return this.role === "admin";
        },
        "Password is required for admin users.",
      ],
      minlength: [6, "Password must be at least 6 characters long."],
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    name: { type: String },
    lmp: { type: String },
    edd: { type: String },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dateOfBirth: Date,
    mobile: String,
    profilePic: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/previews/008/442/086/non_2x/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg",
    },
    address: {
      city: String,
      pinCode: Number,
      location: String,
      State: String,
    },
    isVerified: { type: Boolean, default: false },
    otp: { code: String, expiresAt: Date },
    fcmToken: { type: String },
    isSubscribed: { type: Boolean, default: false },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
  },
  { timestamps: true, versionKey: false }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function (options = {}) {
  const { expiresIn, secret } = options;
  return jwt.sign({ id: this._id, role: this.role }, secret, { expiresIn });
};

module.exports = mongoose.model("User", UserSchema);
