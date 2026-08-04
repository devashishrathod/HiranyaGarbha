const jwt = require("jsonwebtoken");
require("dotenv").config();
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const { ROLES } = require("../constants");
const { getUserById } = require("../services/users");
const { throwError, asyncWrapper } = require("../utils");

exports.verifyJwtToken = asyncWrapper(async (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token) throwError(401, "Access Denied! Missing authorization token");
  const splitToken = token.split(" ")[1];
  if (!splitToken) {
    throwError(403, "Access Denied! Invalid authorization token format");
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(splitToken, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throwError(401, "Your session has expired. Please log in again.");
    } else if (error.name === "JsonWebTokenError") {
      throwError(403, "Invalid or malformed token. Please log in again.");
    } else if (error.name === "NotBeforeError") {
      throwError(403, "Token not active yet. Please try again later.");
    } else {
      throwError(500, "Authentication failed due to an unexpected error.");
    }
  }
  if (!decodedToken) throwError(403, "Access Denied! Invalid token");
  const user = await getUserById(decodedToken?.id);
  if (!user) throwError(404, "Access Denied! User not found");
  req.userId = user._id;
  req.role = user.role;
  req.user = user;
  if (user.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: user._id });
    req.doctorId = doctor._id;
  } else if (user.role === ROLES.USER) {
    const patient = await Patient.findOne({ userId: user._id });
    req.patientId = patient._id;
  }
  next();
});
