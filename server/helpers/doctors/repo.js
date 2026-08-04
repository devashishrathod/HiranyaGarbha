const Doctor = require("../../models/Doctor");

class DoctorRepository {
  async findById(id) {
    return Doctor.findById(id).lean();
  }

  async findActiveById(id) {
    return Doctor.findOne({
      _id: id,
      isActive: true,
      isDeleted: false,
    }).lean();
  }

  async findByHospital(hospitalId) {
    return Doctor.find({
      hospital: hospitalId,
      isActive: true,
      isDeleted: false,
    }).lean();
  }

  async findByDepartment(departmentId) {
    return Doctor.find({
      department: departmentId,
      isActive: true,
      isDeleted: false,
    }).lean();
  }
}

module.exports = new DoctorRepository();
