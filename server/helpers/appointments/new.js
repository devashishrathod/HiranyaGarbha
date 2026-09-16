const mongoose = require("mongoose");

const Appointment = require("../../models/Appointment");

const toObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(String(value))
    : value;

/**
 * Shared filter builder for the admin-wide appointment listing and its counters,
 * so the list and the stat cards can never drift apart.
 */
const buildAdminFilter = ({
  status,
  appointmentType,
  paymentStatus,
  doctorId,
  patientId,
  hospitalId,
  fromDate,
  toDate,
}) => {
  const filter = {};

  if (status) filter.status = status;
  if (appointmentType) filter.appointmentType = appointmentType;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (doctorId) filter.doctorId = toObjectId(doctorId);
  if (patientId) filter.patientId = toObjectId(patientId);
  if (hospitalId) filter.hospitalId = toObjectId(hospitalId);

  if (fromDate || toDate) {
    filter.appointmentDate = {};
    if (fromDate) filter.appointmentDate.$gte = new Date(fromDate);
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      filter.appointmentDate.$lte = end;
    }
  }

  return filter;
};

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
        .populate(
          "patientId",
          "fullName husbandOrParentName profession email phone whatsappNumber image"
        )
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
        .populate(
          "patientId",
          "fullName husbandOrParentName profession email phone whatsappNumber image"
        )
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
        .populate(
          "patientId",
          "fullName husbandOrParentName profession email phone whatsappNumber image"
        )
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
   * Admin-wide appointment listing across every doctor / patient / hospital.
   * Patient and doctor names are joined in so a single search box can hit them.
   */
  async findAllAppointments({
    search,
    page = 1,
    limit = 10,
    sortBy = "appointmentDate",
    sortOrder = "desc",
    ...filters
  }) {
    const filter = buildAdminFilter(filters);

    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "patients",
          localField: "patientId",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      const regex = new RegExp(String(search).trim(), "i");

      pipeline.push({
        $match: {
          $or: [
            { appointmentNumber: regex },
            { "patient.fullName": regex },
            { "patient.husbandOrParentName": regex },
            { "patient.email": regex },
            { "patient.phone": regex },
            { "patient.whatsappNumber": regex },
            { "doctor.fullName": regex },
            { "doctor.specialization": regex },
          ],
        },
      });
    }

    pipeline.push({
      $project: {
        patient: {
          _id: "$patient._id",
          fullName: "$patient.fullName",
          husbandOrParentName: "$patient.husbandOrParentName",
          profession: "$patient.profession",
          email: "$patient.email",
          phone: "$patient.phone",
          whatsappNumber: "$patient.whatsappNumber",
          image: "$patient.image",
        },
        doctor: {
          _id: "$doctor._id",
          fullName: "$doctor.fullName",
          specialization: "$doctor.specialization",
          consultationFee: "$doctor.consultationFee",
          image: "$doctor.image",
        },
        appointmentNumber: 1,
        patientId: 1,
        doctorId: 1,
        hospitalId: 1,
        scheduledBy: 1,
        appointmentDate: 1,
        startTime: 1,
        endTime: 1,
        duration: 1,
        timezone: 1,
        appointmentType: 1,
        status: 1,
        paymentStatus: 1,
        consultationFee: 1,
        symptoms: 1,
        notes: 1,
        meetingLink: 1,
        cancelledBy: 1,
        cancellationReason: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    });

    pipeline.push({
      $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1, startTime: -1 },
    });

    pipeline.push({
      $facet: {
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    });

    const [result] = await Appointment.aggregate(pipeline);

    const rows = result?.data || [];
    const total = result?.totalCount?.[0]?.count || 0;

    /*
     * Reshape to the same populated shape the other endpoints return,
     * so the client can read appointment.patientId.fullName everywhere.
     */
    const data = rows.map(({ patient, doctor, ...rest }) => ({
      ...rest,
      patientId: patient?._id ? patient : rest.patientId,
      doctorId: doctor?._id ? doctor : rest.doctorId,
    }));

    return {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  /**
   * Status-wise counters for the same filter set as findAllAppointments
   */
  async statusCounts(filters = {}) {
    const filter = buildAdminFilter(filters);

    const grouped = await Appointment.aggregate([
      { $match: filter },
      { $group: { _id: "$status", total: { $sum: 1 } } },
    ]);

    return grouped;
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
      .populate("patientId", "fullName phone whatsappNumber")
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
