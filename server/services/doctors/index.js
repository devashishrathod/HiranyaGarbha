const { completeProfile } = require("./completeProfile");
const { getDoctorProfile } = require("./getDoctorProfile");
const { getAllDoctors } = require("./getAllDoctors");
const { createDoctor } = require("./createDoctor");
const { deleteDoctor } = require("./deleteDoctor");

module.exports = {
  completeProfile,
  getDoctorProfile,
  getAllDoctors,
  createDoctor,
  deleteDoctor,
};
