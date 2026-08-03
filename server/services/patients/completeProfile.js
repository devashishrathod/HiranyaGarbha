const Patient = require("../../models/Patient");
const User = require("../../models/User");
const { throwError } = require("../../utils");
const { uploadImage, deleteImage } = require("../uploads");

exports.completeProfile = async (userId, data, image) => {
  let patient = await Patient.findOne({ userId, isDeleted: false });

  if (!patient) patient = new Patient({ userId });

  if (image) {
    if (patient.image) await deleteImage(patient.image)
    patient.image = await uploadImage(image)
  }

  // Merge top-level or nested personalDetails
  if (data.personalDetails) {
    if (data.personalDetails.fullName !== undefined) patient.fullName = data.personalDetails.fullName;
    if (data.personalDetails.dateOfBirth !== undefined) patient.dateOfBirth = data.personalDetails.dateOfBirth;
    if (data.personalDetails.age !== undefined) patient.age = data.personalDetails.age;
    if (data.personalDetails.bloodGroup !== undefined) patient.bloodGroup = data.personalDetails.bloodGroup;
    if (data.personalDetails.height !== undefined) patient.height = data.personalDetails.height;
    if (data.personalDetails.weight !== undefined) patient.weight = data.personalDetails.weight;
    if (data.personalDetails.email !== undefined) patient.email = data.personalDetails.email;
    if (data.personalDetails.phone !== undefined) patient.phone = data.personalDetails.phone;
    if (data.personalDetails.address !== undefined) patient.address = data.personalDetails.address;
  }

  if (data.fullName !== undefined) patient.fullName = data.fullName;
  if (data.dateOfBirth !== undefined) patient.dateOfBirth = data.dateOfBirth;
  if (data.age !== undefined) patient.age = data.age;
  if (data.bloodGroup !== undefined) patient.bloodGroup = data.bloodGroup;
  if (data.height !== undefined) patient.height = data.height;
  if (data.weight !== undefined) patient.weight = data.weight;
  if (data.email !== undefined) patient.email = data.email;
  if (data.phone !== undefined) patient.phone = data.phone;
  if (data.address !== undefined) patient.address = data.address;

  // Merge obstetricHistory
  if (data.obstetricHistory) {
    if (data.obstetricHistory.lmp !== undefined) patient.lmp = data.obstetricHistory.lmp;
    if (data.obstetricHistory.edd !== undefined) patient.edd = data.obstetricHistory.edd;
    if (data.obstetricHistory.currentTrimester !== undefined) patient.currentTrimester = data.obstetricHistory.currentTrimester;
    if (data.obstetricHistory.gravida !== undefined) patient.gravida = data.obstetricHistory.gravida;
    if (data.obstetricHistory.para !== undefined) patient.para = data.obstetricHistory.para;
    if (data.obstetricHistory.abortions !== undefined) patient.abortions = data.obstetricHistory.abortions;
    if (data.obstetricHistory.previousDeliveries !== undefined) patient.previousDeliveries = data.obstetricHistory.previousDeliveries;
  }

  if (data.lmp !== undefined) patient.lmp = data.lmp;
  if (data.edd !== undefined) patient.edd = data.edd;
  if (data.currentTrimester !== undefined) patient.currentTrimester = data.currentTrimester;
  if (data.gravida !== undefined) patient.gravida = data.gravida;
  if (data.para !== undefined) patient.para = data.para;
  if (data.abortions !== undefined) patient.abortions = data.abortions;
  if (data.previousDeliveries !== undefined) patient.previousDeliveries = data.previousDeliveries;

  // Medical conditions & medications
  if (data.medicalConditions !== undefined) patient.medicalConditions = data.medicalConditions;
  if (data.medications !== undefined) patient.medications = data.medications;

  // Doctor Details
  if (data.primaryDoctor !== undefined) patient.primaryDoctor = data.primaryDoctor || null;
  if (data.doctorDetails !== undefined) patient.doctorDetails = { ...patient.doctorDetails, ...data.doctorDetails };

  // Language & Emergency Contact
  if (data.preferredLanguage !== undefined) patient.preferredLanguage = data.preferredLanguage;
  if (data.emergencyContact !== undefined) patient.emergencyContact = { ...patient.emergencyContact, ...data.emergencyContact };

  patient.isProfileCompleted = true;
  await patient.save();

  // Update user flags
  await User.findByIdAndUpdate(userId, {
    isSignUpCompleted: true,
    currentScreen: "HOME_SCREEN",
  });

  return patient;
};
