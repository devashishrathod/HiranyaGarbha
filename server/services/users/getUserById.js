const User = require("../../models/User");
const Patient = require("../../models/Patient");
const Doctor = require("../../models/Doctor");
const { ROLES } = require("../../constants");
const { throwError } = require("../../utils");

exports.getUserById = async (userId) => {
  const user = await User.findOne({ _id: userId, isDeleted: false }).select(
    "-password -otp -isDeleted"
  );
  if (!user) throwError(404, "User not found");

  let profile = null;
  const role = user.role?.toLowerCase();
  if (role === ROLES.USER || role === "patient") {
    profile = await Patient.findOne({ userId: user._id, isDeleted: false });
  } else if (role === ROLES.DOCTOR) {
    profile = await Doctor.findOne({ userId: user._id, isDeleted: false }).populate("hospital");
  }

  const userObj = user.toObject();
  userObj.profile = profile;

  return userObj;
};
