const Patient = require("../../models/Patient");

class PatientRepository {
  async findById(id) {
    return Patient.findById(id).lean();
  }

  async findActiveById(id) {
    return Patient.findOne({
      _id: id,
      isDeleted: {
        $ne: true,
      },
    }).lean();
  }
}

module.exports = new PatientRepository();
