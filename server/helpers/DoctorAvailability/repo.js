const DoctorAvailability = require("../../models/DoctorAvailability");

class DoctorAvailabilityRepository {
  async findByDoctorId(doctorId) {
    return DoctorAvailability.findOne({
      doctorId,
    }).lean();
  }

  async findById(id) {
    return DoctorAvailability.findById(id).lean();
  }

  async create(data) {
    return DoctorAvailability.create(data);
  }

  async updateByDoctorId(doctorId, data) {
    return DoctorAvailability.findOneAndUpdate(
      { doctorId },
      { $set: data },
      {
        new: true,
        runValidators: true,
      },
    ).lean();
  }

  async deleteByDoctorId(doctorId) {
    return DoctorAvailability.findOneAndDelete({
      doctorId,
    });
  }
}

module.exports = new DoctorAvailabilityRepository();
