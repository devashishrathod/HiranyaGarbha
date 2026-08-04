const appointmentService = require("../../services/appointments");

class AppointmentController {
  // Create Appointment
  async create(req, res, next) {
    try {
      const appointment = await appointmentService.bookAppointment({
        ...req.body,
        createdBy: req.userId,
        createdByModel: req.role,
      });

      return res.status(201).json({
        success: true,
        message: "Appointment booked successfully",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get Appointment By ID
  async getById(req, res, next) {
    try {
      const appointment = await appointmentService.getAppointmentById(
        req.params.appointmentId,
      );

      return res.status(200).json({
        success: true,
        message: "Appointment fetched successfully",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  // Confirm Appointment
  async confirm(req, res, next) {
    try {
      const appointment = await appointmentService.confirmAppointment(
        req.params.appointmentId,
      );

      return res.status(200).json({
        success: true,
        message: "Appointment confirmed successfully",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  // Cancel Appointment
  async cancel(req, res, next) {
    try {
      const appointment = await appointmentService.cancelAppointment(
        req.params.appointmentId,
        req.body?.cancelledBy || req.role,
        req.body?.cancellationReason,
      );

      return res.status(200).json({
        success: true,
        message: "Appointment cancelled successfully",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  // Reschedule Appointment
  async reschedule(req, res, next) {
    try {
      const appointment = await appointmentService.rescheduleAppointment(
        req.params.appointmentId,
        req.body,
      );

      return res.status(200).json({
        success: true,
        message: "Appointment rescheduled successfully",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  // Check In
  async checkIn(req, res, next) {
    try {
      const appointment = await appointmentService.checkInAppointment(
        req.params.appointmentId,
      );

      return res.status(200).json({
        success: true,
        message: "Patient checked in successfully",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  // Start Consultation
  async start(req, res, next) {
    try {
      const appointment = await appointmentService.startConsultation(
        req.params.appointmentId,
      );

      return res.status(200).json({
        success: true,
        message: "Consultation started successfully",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  // Complete Appointment
  async complete(req, res, next) {
    try {
      const appointment = await appointmentService.completeAppointment(
        req.params.appointmentId,
        req.body,
      );

      return res.status(200).json({
        success: true,
        message: "Appointment completed successfully",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark No Show
  async noShow(req, res, next) {
    try {
      const appointment = await appointmentService.markNoShow(
        req.params.appointmentId,
      );

      return res.status(200).json({
        success: true,
        message: "Appointment marked as no-show",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  // Doctor Appointments
  async doctorAppointments(req, res, next) {
    try {
      const result = await appointmentService.getDoctorAppointments({
        doctorId: req.params.doctorId || req.doctorId,
        fromDate: req.query.fromDate,
        toDate: req.query.toDate,
        status: req.query.status,
        page: req.query.page,
        limit: req.query.limit,
      });

      return res.status(200).json({
        success: true,
        message: "Doctor appointments fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Patient Appointments
  async patientAppointments(req, res, next) {
    try {
      const result = await appointmentService.getPatientAppointments({
        patientId: req.params.patientId || req.patientId,
        status: req.query.status,
        page: req.query.page,
        limit: req.query.limit,
      });

      return res.status(200).json({
        success: true,
        message: "Patient appointments fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Hospital Appointments
  async hospitalAppointments(req, res, next) {
    try {
      const result = await appointmentService.getHospitalAppointments({
        hospitalId: req.params.hospitalId,
        status: req.query.status,
        doctorId: req.query.doctorId,
        departmentId: req.query.departmentId,
        fromDate: req.query.fromDate,
        toDate: req.query.toDate,
        page: req.query.page,
        limit: req.query.limit,
      });

      return res.status(200).json({
        success: true,
        message: "Hospital appointments fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Today's Doctor Appointments
  async today(req, res, next) {
    try {
      const doctorId = req.params.doctorId || req.doctorId;

      const appointments =
        await appointmentService.getTodayAppointments(doctorId);

      return res.status(200).json({
        success: true,
        message: "Today's appointments fetched successfully",
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  // Hospital Dashboard Counts
  async dashboard(req, res, next) {
    try {
      const result = await appointmentService.getDashboardCounts(
        req.params.hospitalId,
      );

      return res.status(200).json({
        success: true,
        message: "Appointment dashboard fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Available Slots
  async availableSlots(req, res, next) {
    try {
      const result = await appointmentService.getAvailableSlots({
        doctorId: req.query.doctorId || req.doctorId,
        appointmentDate: req.query.appointmentDate,
      });

      return res.status(200).json({
        success: true,
        message: "Available slots fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AppointmentController();
