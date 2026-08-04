const Appointment = require("../../models/Appointment");

class AppointmentRepository {
  async create(data, session = null) {
    if (session) {
      const result = await Appointment.create([data], { session });

      return result[0];
    }

    return Appointment.create(data);
  }

  async findById(id) {
    return (
      Appointment.findById(id)
        .populate("patientId", "fullName email phone")
        .populate("doctorId", "fullName specialization consultationFee")
        // .populate("hospitalId", "name")
        .lean()
    );
  }

  async findOne(filter) {
    return Appointment.findOne(filter).lean();
  }

  async exists(filter) {
    return Appointment.exists(filter);
  }

  async updateById(id, data, session = null) {
    return Appointment.findByIdAndUpdate(
      id,
      { $set: data },
      {
        new: true,
        runValidators: true,
        session,
      },
    );
  }

  async updateOne(filter, data, session = null) {
    return Appointment.updateOne(filter, { $set: data }, { session });
  }

  async count(filter = {}) {
    return Appointment.countDocuments(filter);
  }

  /**
   * Check doctor slot
   */
  // async findBookedSlot({ doctorId, startTime, endTime }) {
  //   return Appointment.findOne({
  //     doctorId,

  //     status: {
  //       $nin: ["CANCELLED", "NO_SHOW"],
  //     },

  //     startTime: {
  //       $lt: endTime,
  //     },

  //     endTime: {
  //       $gt: startTime,
  //     },
  //   }).lean();
  // }

  async findBookedSlot({ doctorId, startTime, endTime }, session = null) {
    return Appointment.findOne({
      doctorId,

      status: {
        $nin: ["CANCELLED", "NO_SHOW"],
      },

      startTime: {
        $lt: endTime,
      },

      endTime: {
        $gt: startTime,
      },
    })
      .session(session)
      .lean();
  }

  /**
   * Check patient overlapping appointment
   */
  async findPatientConflict({ patientId, startTime, endTime }, session = null) {
    return Appointment.findOne({
      patientId,

      status: {
        $nin: ["CANCELLED", "NO_SHOW"],
      },

      startTime: {
        $lt: endTime,
      },

      endTime: {
        $gt: startTime,
      },
    })
      .session(session)
      .lean();
  }

  /**
   * Doctor appointments
   */
  async findDoctorAppointments({
    doctorId,
    fromDate,
    toDate,
    status,
    page = 1,
    limit = 10,
  }) {
    const filter = {
      doctorId,
    };

    if (fromDate || toDate) {
      filter.appointmentDate = {};

      if (fromDate) {
        filter.appointmentDate.$gte = new Date(fromDate);
      }

      if (toDate) {
        filter.appointmentDate.$lte = new Date(toDate);
      }
    }

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Appointment.find(filter)
        .populate("patientId", "fullName email phone")
        // .populate("hospitalId", "name")
        .sort({
          appointmentDate: 1,
          startTime: 1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Appointment.countDocuments(filter),
    ]);

    return {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      data,
    };
  }

  /**
   * Patient appointments
   */
  async findPatientAppointments({ patientId, page = 1, limit = 10, status }) {
    const filter = {
      patientId,
    };

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Appointment.find(filter)
        .populate("doctorId", "fullName specialization")
        // .populate("hospitalId", "name")
        .sort({
          appointmentDate: -1,
          startTime: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Appointment.countDocuments(filter),
    ]);

    return {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      data,
    };
  }

  /**
   * Hospital appointments
   */
  async findHospitalAppointments({
    hospitalId,
    page = 1,
    limit = 10,
    status,
    doctorId,
    fromDate,
    toDate,
  }) {
    const filter = {
      hospitalId,
    };

    if (status) {
      filter.status = status;
    }

    if (doctorId) {
      filter.doctorId = doctorId;
    }

    if (fromDate || toDate) {
      filter.appointmentDate = {};

      if (fromDate) {
        filter.appointmentDate.$gte = new Date(fromDate);
      }

      if (toDate) {
        filter.appointmentDate.$lte = new Date(toDate);
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Appointment.find(filter)
        .populate("doctorId", "fullName specialization")
        .populate("patientId", "fullName email phone")
        .sort({
          appointmentDate: -1,
          startTime: 1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Appointment.countDocuments(filter),
    ]);

    return {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      data,
    };
  }

  /**
   * Today's appointments
   */
  async getTodayAppointments(doctorId, start, end) {
    return Appointment.find({
      doctorId,

      appointmentDate: {
        $gte: start,
        $lte: end,
      },

      status: {
        $nin: ["CANCELLED", "NO_SHOW"],
      },
    })
      .populate("patientId", "fullName phone")
      .sort({
        startTime: 1,
      })
      .lean();
  }

  /**
   * Dashboard
   */
  async dashboardCounts(hospitalId) {
    return Appointment.aggregate([
      {
        $match: {
          hospitalId,
        },
      },

      {
        $group: {
          _id: "$status",

          total: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);
  }

  async findBookedAppointmentsByDoctorAndDate(doctorId, startOfDay, endOfDay) {
    return Appointment.find({
      doctorId,

      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },

      status: {
        $nin: ["CANCELLED", "NO_SHOW"],
      },
    })
      .select("startTime endTime status")
      .lean();
  }
}

module.exports = new AppointmentRepository();
