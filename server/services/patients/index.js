const { completeProfile } = require("./completeProfile");
const { getPatientProfile } = require("./getPatientProfile");
const { getAllPatients } = require("./getAllPatients");
const { createPatient } = require("./createPatient");
const { deletePatient } = require("./deletePatient");

module.exports = {
  completeProfile,
  getPatientProfile,
  getAllPatients,
  createPatient,
  deletePatient,
};
