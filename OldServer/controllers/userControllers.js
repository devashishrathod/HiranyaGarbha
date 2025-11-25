const User = require("../models/userModel");
const { sendEmail } = require("../helpers/emailHelper");
const { generateOTP } = require("../helpers/otpHelper");
const { urlSendTestOtp, urlVerifyOtp } = require("../helpers/twoFactorOtp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const DreamChildPlanModel = require("../models/DreamChildPlanModel");
const Subscription = require("../models/Subscription");

exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, role: "customer" });
      await user.save();
    }
    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
    await user.save();
    const otpHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dddddd; border-radius: 10px;">
        <h2 style="color: #333;">OTP Verification</h2>
        <p style="color: #555;">
          Your OTP is
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <p style="font-size: 18px; font-weight: bold; color: #007BFF;">${otp}</p>
        </div>
        <p style="color: #999; font-size: 12px;">
          Best regards,<br>
          Your Service Team
        </p>
      </div>
    `;
    await sendEmail(email, "Verify Your Account", otpHtml);
    res.status(201).json({
      success: true,
      message: "OTP has been sent to your email. Please check your inbox.",
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phoneNumber } =
      req.body;
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: "admin",
      phoneNumber,
    });
    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
    await user.save();
    const otpHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dddddd; border-radius: 10px;">
          <h2 style="color: #333;">OTP Verification</h2>
          <p style="color: #555;">
            You OTP is
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <p style="font-size: 18px; font-weight: bold; color: #007BFF;">${otp}</p>
          </div>
          <p style="color: #999; font-size: 12px;">
            Best regards,<br>
            Your Service Team
          </p>
        </div>
      `;
    await sendEmail(email, "Verify Your Account", otpHtml);
    res.status(201).json({
      success: true,
      message: "User registered. Please check your email for OTP.",
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { email, password, name, lmp, edd, phoneNumber } = req.body;
    /* if (role == "admin") {
      return res.status(400).json({ success: false, message: "Admin registration is not allowed." });
    } */
    const user = await User.create({
      email,
      password,
      name,
      lmp,
      edd,
      phoneNumber,
    });
    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
    await user.save();
    const otpHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dddddd; border-radius: 10px;">
          <h2 style="color: #333;">OTP Verification</h2>
          <p style="color: #555;">
            You OTP is
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <p style="font-size: 18px; font-weight: bold; color: #007BFF;">${otp}</p>
          </div>
          <p style="color: #999; font-size: 12px;">
            Best regards,<br>
            Your Service Team
          </p>
        </div>
      `;
    await sendEmail(email, "Verify Your Account", otpHtml);
    res.status(201).json({
      success: true,
      message: "User registered. Please check your email for OTP.",
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password, fcmToken } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ success: false, message: "Please verify your account first" });
    }
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    if (fcmToken) {
      user.fcmToken = fcmToken;
      await user.save();
    }
    // const otp = generateOTP();
    // user.otp = {
    //   code: otp,
    //   expiresAt: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
    // };
    // await user.save();
    // const otpHtml = `
    //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dddddd; border-radius: 10px;">
    //       <h2 style="color: #333;">OTP Verification</h2>
    //       <p style="color: #555;">
    //         You OTP is
    //       </p>
    //       <div style="text-align: center; margin: 20px 0;">
    //         <p style="font-size: 18px; font-weight: bold; color: #007BFF;">${otp}</p>
    //       </div>
    //       <p style="color: #999; font-size: 12px;">
    //         Best regards,<br>
    //         Your Service Team
    //       </p>
    //     </div>
    //   `;
    // await sendEmail(email, "Verify Your Account", otpHtml);
    const token = user.getSignedJwtToken({
      expiresIn: "30d",
      secret: process.env.JWT_SECRET,
    });
    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.loginOrSignInWithMobile = async (req, res) => {
  const mobile = req.body?.mobile;
  let isFirst = false;
  try {
    let checkUser = await User.findOne({ mobile });
    if (!checkUser) {
      isFirst = true;
      checkUser = await User.create({ mobile });
    }
    let result = await urlSendTestOtp(mobile);
    return res.status(200).json({ success: true, result, isFirst });
  } catch (error) {
    console.log("error on requistOtp: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.verifyOtpWithMobile = async (req, res) => {
  const sessionId = req.body.sessionId;
  const otp = req.body.otp;
  const mobile = req.body?.mobile;
  const fcmToken = req.body?.fcmToken;
  try {
    const checkUser = await User.findOne({ mobile });
    if (!checkUser) {
      return res.status(400).json({ success: false, msg: "User not found!" });
    }
    let result = await urlVerifyOtp(sessionId, otp);
    if (result?.Status == "Success") {
      const token = checkUser.getSignedJwtToken({
        expiresIn: "30d",
        secret: process.env.JWT_SECRET,
      });
      checkUser.isVerified = true;
      if (fcmToken) checkUser.fcmToken = fcmToken;
      await checkUser.save();
      res.status(200).json({
        success: true,
        message: "Account Verified and Login successfully",
        token,
      });
    } else {
      return res.status(400).json({ success: false, msg: "Invalid OTP" });
    }
  } catch (error) {
    console.log("error on verifyOtp: ", error);
    return res
      .status(500)
      .json({ error: error, success: false, msg: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, fcmToken } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.otp.code !== otp || user.otp.expiresAt < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }
    const token = user.getSignedJwtToken({
      expiresIn: "30d",
      secret: process.env.JWT_SECRET,
    });
    user.isVerified = true;
    user.otp = undefined;
    if (fcmToken) {
      user.fcmToken = fcmToken;
    }
    await user.save();
    res.status(200).json({
      success: true,
      message: "Account Verified and Login successfully",
      token,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
    await user.save();
    await sendEmail(
      email,
      "New OTP for Account Verification",
      `Your new OTP is: ${otp}`
    );
    res
      .status(200)
      .json({ success: true, message: "New OTP sent to your email" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select(" -otp -__v -password")
      .populate("subscription");
    let isSubscriptionActive = false;
    if (user.isSubscribed && user.subscription) {
      isSubscriptionActive = false;
      const checkSubscriptionHistory = await Subscription.findById(
        user.subscription
      );
      if (!checkSubscriptionHistory) {
        return res
          .status(404)
          .json({ success: false, msg: "Subscription history not found" });
      }
      const currentDate = new Date();
      if (
        checkSubscriptionHistory.endDate &&
        checkSubscriptionHistory.endDate > currentDate
      ) {
        isSubscriptionActive = true;
      } else {
        isSubscriptionActive = false;
        user.isSubscribed = false;
        user.subscription = null;
        checkSubscriptionHistory.status = "inactive";
        await checkSubscriptionHistory.save();
        await user.save();
      }
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;
    const users = await User.find({ role: "customer" })
      .skip(skip)
      .limit(limitNumber)
      .select(" -otp -__v");
    const totalUsers = await User.countDocuments({ role: "customer" });
    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        totalUsers,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalUsers / limitNumber),
        limit: limitNumber,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { password, role, isVerified, otp, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect old password" });
    }
    user.password = newPassword;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const resetToken = user.getSignedJwtToken({
      expiresIn: "1h",
      secret: process.env.RESET_SECRET,
    });
    const resetLink = `http://localhost:5173/auth/reset-password?token=${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dddddd; border-radius: 10px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #555;">
          You requested to reset your password. Please use the following link to reset it:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetLink}" style="font-size: 18px; font-weight: bold; color: #007BFF;">Reset Password</a>
        </div>
        <p style="color: #555;">
          If you did not request this password reset, please ignore this email.
        </p>
        <p style="color: #999; font-size: 12px;">
          Best regards,<br>
          Your Service Team
        </p>
      </div>
    `;
    await sendEmail(email, "Password Reset Request", html);
    res
      .status(200)
      .json({ success: true, message: "Password reset link sent to email" });
  } catch (error) {
    console.error("Error in forgotPassword function:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.RESET_SECRET);
    const user = await User.findById(decoded.id).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required." });
    }
    const user = await User.findById(userId).select("-password -otp -__v");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.dashboardDetails = async (req, res) => {
  try {
    const [vendor, active, inactive, rate] = await Promise.all([
      userModel.countDocuments({ role: "customer" }),
      userModel.countDocuments({ role: "customer", isVerified: true }),
      User.countDocuments({ role: "vendor", isApproved: true }),
      Rate.countDocuments(),
    ]);
  } catch (error) {
    console.error("Error dashboardDetails:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await DreamChildPlanModel.countDocuments();
    const totalLiveSessions = await DreamChildPlanModel.aggregate([
      { $unwind: "$features.liveSessions" },
      { $match: { "features.liveSessions.isAvailable": true } },
      { $count: "totalLiveSessions" },
    ]);
    const user = await userModel.countDocuments({ role: "customer" });
    const totalWorkshops = await DreamChildPlanModel.aggregate([
      { $unwind: "$features.workshops" },
      { $match: { "features.workshops.isAvailable": true } },
      { $count: "totalWorkshops" },
    ]);
    const totalSales = await DreamChildPlanModel.aggregate([
      { $group: { _id: null, totalSales: { $sum: "$price.discounted" } } },
    ]);
    const recentWorkshops = await DreamChildPlanModel.aggregate([
      { $unwind: "$features.workshops" },
      { $match: { "features.workshops.isAvailable": true } },
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
    ]);
    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalLiveSessions: totalLiveSessions[0]?.totalLiveSessions || 0,
        totalWorkshops: totalWorkshops[0]?.totalWorkshops || 0,
        totalSales: totalSales[0]?.totalSales || 0,
        recentWorkshops,
        user,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
