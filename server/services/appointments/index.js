const mongoose = require("mongoose");

const AppointmentRepository = require("../../helpers/appointments/new");
const DoctorRepository = require("../../helpers/doctors/repo");
const PatientRepository = require("../../helpers/doctors/patient");
const DoctorAvailabilityRepository = require("../../helpers/DoctorAvailability/repo");

const {
  isSlotAvailable,
  generateDailySlots,
} = require("../../helpers/appointments/slots");

class AppointmentService {
  /**
   * Generate unique appointment number
   */
  async generateAppointmentNumber() {
    const prefix = "APT";
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const random = Math.floor(100000 + Math.random() * 900000);

    return `${prefix}-${year}${month}${day}-${random}`;
  }

  /**
   * Validate ObjectId
   */
  validateObjectId(id, fieldName) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid ${fieldName}`);
    }
  }

  async bookAppointment(data) {
    const {
      patientId,
      doctorId,
      hospitalId,
      scheduledBy,
      createdBy,
      createdByModel,
      appointmentDate,
      startTime,
      endTime,
      duration = 30,
      timezone = "Asia/Kolkata",
      appointmentType = "CLINIC",
      consultationFee,
      symptoms,
      notes,
    } = data;

    this.validateObjectId(patientId, "patientId");
    this.validateObjectId(doctorId, "doctorId");

    if (hospitalId) {
      this.validateObjectId(hospitalId, "hospitalId");
    }

    const requestedStart = new Date(startTime);

    const requestedEnd = new Date(endTime);

    if (
      Number.isNaN(requestedStart.getTime()) ||
      Number.isNaN(requestedEnd.getTime())
    ) {
      throw new Error("Invalid appointment time");
    }

    if (requestedStart >= requestedEnd) {
      throw new Error("Start time must be before end time");
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      /*
       * --------------------------------------------------
       * 1. Verify Patient
       * --------------------------------------------------
       */

      const patient = await PatientRepository.findById(patientId);

      if (!patient) {
        throw new Error("Patient not found");
      }

      /*
       * --------------------------------------------------
       * 2. Verify Doctor
       * --------------------------------------------------
       */

      const doctor = await DoctorRepository.findActiveById(doctorId);

      if (!doctor) {
        throw new Error("Doctor not found or inactive");
      }

      /*
       * --------------------------------------------------
       * 3. Check Doctor Slot
       * --------------------------------------------------
       */

      const doctorConflict = await AppointmentRepository.findBookedSlot(
        {
          doctorId,
          startTime: requestedStart,
          endTime: requestedEnd,
        },
        session,
      );

      if (doctorConflict) {
        throw new Error("Doctor is already booked during this time");
      }

      /*
       * --------------------------------------------------
       * 4. Check Patient Conflict
       * --------------------------------------------------
       */

      const patientConflict = await AppointmentRepository.findPatientConflict(
        {
          patientId,
          startTime: requestedStart,
          endTime: requestedEnd,
        },
        session,
      );

      if (patientConflict) {
        throw new Error(
          "Patient already has another appointment during this time",
        );
      }

      /*
       * --------------------------------------------------
       * 5. Verify Doctor Availability
       * --------------------------------------------------
       */

      const availability =
        await DoctorAvailabilityRepository.findByDoctorId(doctorId);

      if (!availability) {
        throw new Error("Doctor availability not configured");
      }

      /*
       * --------------------------------------------------
       * 6. Validate Slot
       * --------------------------------------------------
       */

      const slotAvailable = isSlotAvailable({
        availability,
        startTime: requestedStart,
        endTime: requestedEnd,
      });

      if (!slotAvailable) {
        throw new Error("Selected time slot is not available");
      }

      /*
       * --------------------------------------------------
       * 7. Generate Appointment Number
       * --------------------------------------------------
       */

      const appointmentNumber = await this.generateAppointmentNumber();

      /*
       * --------------------------------------------------
       * 8. Create Appointment
       * --------------------------------------------------
       */

      const appointmentData = {
        appointmentNumber,

        patientId,

        doctorId,

        hospitalId: hospitalId || null,

        scheduledBy,

        createdBy: createdBy || null,

        createdByModel: createdByModel || null,

        appointmentDate: new Date(appointmentDate),

        startTime: requestedStart,

        endTime: requestedEnd,

        duration,

        timezone,

        appointmentType,

        status: "PENDING",

        paymentStatus: "PENDING",

        consultationFee: consultationFee ?? Number(doctor.consultationFee || 0),

        symptoms: symptoms || null,

        notes: notes || null,

        prescription: null,

        meetingLink: null,

        cancelledBy: null,

        cancellationReason: null,

        rescheduledFrom: null,
      };

      const appointment = await AppointmentRepository.create(
        appointmentData,
        session,
      );

      /*
       * --------------------------------------------------
       * 9. Commit Transaction
       * --------------------------------------------------
       */

      await session.commitTransaction();

      return appointment;
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(appointmentId) {
    this.validateObjectId(appointmentId, "appointmentId");

    const appointment = await AppointmentRepository.findById(appointmentId);

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    return appointment;
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId, cancelledBy, cancellationReason) {
    const appointment = await this.getAppointmentById(appointmentId);

    if (
      appointment.status === "COMPLETED" ||
      appointment.status === "CANCELLED"
    ) {
      throw new Error(
        `Appointment cannot be cancelled because it is already ${appointment.status}`,
      );
    }

    if (appointment.startTime <= new Date()) {
      throw new Error("Past or ongoing appointment cannot be cancelled");
    }

    const allowedCancelledBy = ["PATIENT", "DOCTOR", "ADMIN"];

    if (!allowedCancelledBy.includes(cancelledBy)) {
      throw new Error("Invalid cancelledBy value");
    }

    const updated = await AppointmentRepository.updateById(appointmentId, {
      status: "CANCELLED",
      cancelledBy,
      cancellationReason,
    });

    return updated;
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(appointmentId, data) {
    const appointment = await this.getAppointmentById(appointmentId);

    if (
      ["COMPLETED", "CANCELLED", "IN_PROGRESS"].includes(appointment.status)
    ) {
      throw new Error(
        `Appointment cannot be rescheduled from ${appointment.status} status`,
      );
    }

    const { appointmentDate, startTime, endTime } = data;

    const newStartTime = new Date(startTime);

    const newEndTime = new Date(endTime);

    const newDate = new Date(appointmentDate);

    if (newStartTime >= newEndTime) {
      throw new Error("Invalid appointment time range");
    }

    if (newStartTime <= new Date()) {
      throw new Error("Cannot reschedule to a past time");
    }

    const availability = await DoctorAvailabilityRepository.findByDoctorId(
      appointment.doctorId,
    );

    if (!availability) {
      throw new Error("Doctor availability not configured");
    }

    const validSlot = isSlotAvailable({
      availability,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
    });

    if (!validSlot) {
      throw new Error("New time slot is not available");
    }

    const bookedSlot = await AppointmentRepository.findBookedSlot({
      doctorId: appointment.doctorId,
      startTime: newStartTime,
      endTime: newEndTime,
    });

    if (bookedSlot && String(bookedSlot._id) !== String(appointmentId)) {
      throw new Error("New time slot is already booked");
    }

    const patientConflict = await AppointmentRepository.findPatientConflict({
      patientId: appointment.patientId,
      startTime: newStartTime,
      endTime: newEndTime,
    });

    if (
      patientConflict &&
      String(patientConflict._id) !== String(appointmentId)
    ) {
      throw new Error(
        "Patient already has another appointment during this time",
      );
    }

    const newAppointmentNumber = await this.generateAppointmentNumber();

    const updated = await AppointmentRepository.updateById(appointmentId, {
      appointmentDate: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      duration: Math.round((newEndTime - newStartTime) / 60000),
      status: "RESCHEDULED",
      rescheduledFrom: appointmentId,
      appointmentNumber: newAppointmentNumber,
    });

    return updated;
  }

  /**
   * Confirm appointment
   */
  async confirmAppointment(appointmentId) {
    const appointment = await this.getAppointmentById(appointmentId);

    if (appointment.status !== "PENDING") {
      throw new Error("Only pending appointment can be confirmed");
    }

    return AppointmentRepository.updateById(appointmentId, {
      status: "CONFIRMED",
    });
  }

  /**
   * Check in patient
   */
  async checkInAppointment(appointmentId) {
    const appointment = await this.getAppointmentById(appointmentId);

    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      throw new Error("Appointment cannot be checked in");
    }

    return AppointmentRepository.updateById(appointmentId, {
      status: "CHECKED_IN",
    });
  }

  /**
   * Start consultation
   */
  async startConsultation(appointmentId) {
    const appointment = await this.getAppointmentById(appointmentId);

    if (!["CONFIRMED", "CHECKED_IN"].includes(appointment.status)) {
      throw new Error("Appointment cannot be started");
    }

    return AppointmentRepository.updateById(appointmentId, {
      status: "IN_PROGRESS",
    });
  }

  /**
   * Complete appointment
   */
  async completeAppointment(appointmentId, data = {}) {
    const appointment = await this.getAppointmentById(appointmentId);

    if (appointment.status !== "IN_PROGRESS") {
      throw new Error("Only in-progress appointment can be completed");
    }

    return AppointmentRepository.updateById(appointmentId, {
      status: "COMPLETED",
      notes: data.notes ?? appointment.notes,
      prescription: data.prescription ?? appointment.prescription,
    });
  }

  /**
   * Mark patient as no-show
   */
  async markNoShow(appointmentId) {
    const appointment = await this.getAppointmentById(appointmentId);

    if (["COMPLETED", "CANCELLED", "NO_SHOW"].includes(appointment.status)) {
      throw new Error("Appointment cannot be marked as no-show");
    }

    return AppointmentRepository.updateById(appointmentId, {
      status: "NO_SHOW",
    });
  }

  /**
   * Get doctor appointments
   */
  async getDoctorAppointments(params) {
    const { doctorId, fromDate, toDate, status, page = 1, limit = 10 } = params;

    this.validateObjectId(doctorId, "doctorId");

    return AppointmentRepository.findDoctorAppointments({
      doctorId,
      fromDate,
      toDate,
      status,
      page: Number(page),
      limit: Number(limit),
    });
  }

  /**
   * Get patient appointments
   */
  async getPatientAppointments(params) {
    const { patientId, status, page = 1, limit = 10 } = params;

    this.validateObjectId(patientId, "patientId");

    return AppointmentRepository.findPatientAppointments({
      patientId,
      status,
      page: Number(page),
      limit: Number(limit),
    });
  }

  /**
   * Get hospital appointments
   */
  async getHospitalAppointments(params) {
    const {
      hospitalId,
      status,
      doctorId,
      departmentId,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
    } = params;

    this.validateObjectId(hospitalId, "hospitalId");

    return AppointmentRepository.findHospitalAppointments({
      hospitalId,
      status,
      doctorId,
      fromDate,
      toDate,
      page: Number(page),
      limit: Number(limit),
    });
  }

  /**
   * Today's appointments
   */
  async getTodayAppointments(doctorId) {
    this.validateObjectId(doctorId, "doctorId");

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return AppointmentRepository.getTodayAppointments(doctorId, start, end);
  }

  /**
   * Dashboard counts
   */
  async getDashboardCounts(hospitalId) {
    this.validateObjectId(hospitalId, "hospitalId");

    return AppointmentRepository.dashboardCounts(
      new mongoose.Types.ObjectId(hospitalId),
    );
  }

  /**
   * Get available slots for doctor
   */
  async getAvailableSlots({ doctorId, appointmentDate }) {
    this.validateObjectId(doctorId, "doctorId");

    const doctor = await DoctorRepository.findActiveById(doctorId);

    if (!doctor) {
      throw new Error("Doctor not found or inactive");
    }

    const availability =
      await DoctorAvailabilityRepository.findByDoctorId(doctorId);

    if (!availability) {
      throw new Error("Doctor availability not configured");
    }

    const date = new Date(appointmentDate);

    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid appointment date");
    }

    /**
     * Generate all slots
     * according to doctor's
     * weekly schedule
     */
    const slots = generateDailySlots({
      availability,
      date,
    });

    /**
     * Get complete day's
     * booked appointments
     *
     * Only ONE DB query
     */
    const startOfDay = new Date(date);

    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);

    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments =
      await AppointmentRepository.findBookedAppointmentsByDoctorAndDate(
        doctorId,
        startOfDay,
        endOfDay,
      );

    /**
     * Compare generated slots
     * with booked appointments
     */
    const availableSlots = slots.map((slot) => {
      const booked = bookedAppointments.some(
        (appointment) =>
          slot.startTime < appointment.endTime &&
          slot.endTime > appointment.startTime,
      );

      return {
        startTime: slot.startTime,

        endTime: slot.endTime,

        duration: slot.duration,

        available: !booked,
      };
    });

    return {
      doctorId,

      appointmentDate: date,

      timezone: availability.timezone || "Asia/Kolkata",

      totalSlots: availableSlots.length,

      availableSlots: availableSlots.filter((slot) => slot.available),

      bookedSlots: availableSlots.filter((slot) => !slot.available),
    };
  }
}

module.exports = new AppointmentService();
