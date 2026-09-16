const crypto = require("crypto");

const User = require("../../models/User");
const { ROLES, LOGIN_TYPES } = require("../../constants");
const { throwError } = require("../../utils");
const { completeProfile } = require("./completeProfile");

/**
 * Admin flow: create the login account and the doctor profile in one shot.
 * The profile merge itself is delegated to completeProfile so both flows stay in sync.
 */
exports.createDoctor = async (data, image) => {
  const { name, password, ...profileData } = data;

  const email = data.email ? String(data.email).toLowerCase() : undefined;
  const mobile = data.mobile ? Number(data.mobile) : undefined;

  if (!email && !mobile) {
    throwError(422, "Email or mobile number, any one of these is required");
  }

  if (email) {
    const existing = await User.findOne({
      email,
      role: ROLES.DOCTOR,
      isDeleted: false,
    });
    if (existing) throwError(409, "A doctor with this email already exists");
  }

  if (mobile) {
    const existing = await User.findOne({
      mobile,
      role: ROLES.DOCTOR,
      isDeleted: false,
    });
    if (existing) {
      throwError(409, "A doctor with this mobile number already exists");
    }
  }

  const fullName = profileData.fullName || name || "";

  const user = await User.create({
    name: fullName.toLowerCase(),
    email,
    mobile,
    // Admin-created accounts get a throwaway password, doctor resets it on first login
    password: password || crypto.randomBytes(12).toString("hex"),
    role: ROLES.DOCTOR,
    loginType: LOGIN_TYPES.PASSWORD,
    isPermissionGiven: true,
  });

  const payload = { ...profileData };
  delete payload.mobile;
  if (payload.fullName === undefined && fullName) payload.fullName = fullName;
  if (payload.email === undefined && email) payload.email = email;
  if (payload.phone === undefined && mobile) payload.phone = String(mobile);

  const doctor = await completeProfile(user._id, payload, image);

  return { user, doctor };
};
