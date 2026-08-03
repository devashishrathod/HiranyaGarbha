const Doctor = require("../../models/Doctor");
const User = require("../../models/User");
const { throwError } = require("../../utils");
const { uploadImage, deleteImage } = require("../uploads");

exports.completeProfile = async (userId, data, image) => {
  let doctor = await Doctor.findOne({ userId, isDeleted: false });

  if (!doctor) {
    doctor = new Doctor({ userId });
  }

  if (image) {
    if (doctor.image) await deleteImage(doctor.image)
    doctor.image = await uploadImage(image)
  }

  // Personal details merge
  if (data.personalDetails) {
    if (data.personalDetails.fullName !== undefined) doctor.fullName = data.personalDetails.fullName;
    if (data.personalDetails.dateOfBirth !== undefined) doctor.dateOfBirth = data.personalDetails.dateOfBirth;
    if (data.personalDetails.gender !== undefined) doctor.gender = data.personalDetails.gender;
    if (data.personalDetails.bloodGroup !== undefined) doctor.bloodGroup = data.personalDetails.bloodGroup;
    if (data.personalDetails.email !== undefined) doctor.email = data.personalDetails.email;
    if (data.personalDetails.phone !== undefined) doctor.phone = data.personalDetails.phone;
    if (data.personalDetails.address !== undefined) doctor.address = data.personalDetails.address;
  }

  if (data.fullName !== undefined) doctor.fullName = data.fullName;
  if (data.dateOfBirth !== undefined) doctor.dateOfBirth = data.dateOfBirth;
  if (data.gender !== undefined) doctor.gender = data.gender;
  if (data.bloodGroup !== undefined) doctor.bloodGroup = data.bloodGroup;
  if (data.email !== undefined) doctor.email = data.email;
  if (data.phone !== undefined) doctor.phone = data.phone;
  if (data.address !== undefined) doctor.address = data.address;

  // Professional details merge
  if (data.professionalDetails) {
    if (data.professionalDetails.specialization !== undefined) doctor.specialization = data.professionalDetails.specialization;
    if (data.professionalDetails.qualifications !== undefined) doctor.qualifications = data.professionalDetails.qualifications;
    if (data.professionalDetails.experience !== undefined) doctor.experience = data.professionalDetails.experience;
    if (data.professionalDetails.licenseNumber !== undefined) doctor.licenseNumber = data.professionalDetails.licenseNumber;
    if (data.professionalDetails.hospital !== undefined) doctor.hospital = data.professionalDetails.hospital || null;
    if (data.professionalDetails.department !== undefined) doctor.department = data.professionalDetails.department;
    if (data.professionalDetails.consultationFee !== undefined) doctor.consultationFee = data.professionalDetails.consultationFee;
    if (data.professionalDetails.availableDays !== undefined) doctor.availableDays = data.professionalDetails.availableDays;
    if (data.professionalDetails.availableTime !== undefined) doctor.availableTime = data.professionalDetails.availableTime;
  }

  if (data.specialization !== undefined) doctor.specialization = data.specialization;
  if (data.qualifications !== undefined) doctor.qualifications = data.qualifications;
  if (data.experience !== undefined) doctor.experience = data.experience;
  if (data.licenseNumber !== undefined) doctor.licenseNumber = data.licenseNumber;
  if (data.hospital !== undefined) doctor.hospital = data.hospital || null;
  if (data.department !== undefined) doctor.department = data.department;
  if (data.consultationFee !== undefined) doctor.consultationFee = data.consultationFee;
  if (data.availableDays !== undefined) doctor.availableDays = data.availableDays;
  if (data.availableTime !== undefined) doctor.availableTime = data.availableTime;

  // Expertise & Languages
  if (data.expertise !== undefined) doctor.expertise = data.expertise;
  if (data.languages !== undefined) doctor.languages = data.languages;

  doctor.isProfileCompleted = true;
  await doctor.save();

  // Update user flags
  await User.findByIdAndUpdate(userId, {
    isSignUpCompleted: true,
    currentScreen: "HOME_SCREEN",
  });

  return doctor;
};
