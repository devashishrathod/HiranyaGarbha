const express = require("express");
const router = express.Router();
const {
  requestOTP,
  verifyOTP,
  resendOTP,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  updatePassword,
  getAllUser,
  getUserById,
  login,
  loginOrSignInWithMobile,
  verifyOtpWithMobile,
  register,
  registerUser,
  getDashboardStats,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

router.post("/sign-in", requestOTP);
router.post("/login", login);
router.post("/login-with-mobile", loginOrSignInWithMobile);
router.put("/verify-otp-mobile", verifyOtpWithMobile);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/profile", protect, getProfile);
router.get("/get-all-users", protect, getAllUser);
router.put("/profile", protect, updateProfile);
router.put("/update-password", protect, updatePassword);

router.get("/dashboard", getDashboardStats);
router.post("/register", registerUser);
// router.post('/admin-register', register)
router.get("/:userId", getUserById);

module.exports = router;
