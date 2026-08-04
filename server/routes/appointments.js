const express = require("express");
const router = express.Router();

const appointmentController = require("../controllers/appointments");
const { validateSchema, verifyJwtToken } = require("../middlewares");

const {
  createAppointmentSchema,
  cancelAppointmentSchema,
  rescheduleAppointmentSchema,
  completeAppointmentSchema,
} = require("../validator/appointments");

// Create
router.post(
  "/book",
  verifyJwtToken,
  validateSchema(createAppointmentSchema),
  appointmentController.create,
);

router.get("/slots", verifyJwtToken, appointmentController.availableSlots);

router.get("/:appointmentId", verifyJwtToken, appointmentController.getById);

// Confirm
router.patch(
  "/:appointmentId/confirm",
  verifyJwtToken,
  appointmentController.confirm,
);

// Cancel
router.patch(
  "/:appointmentId/cancel",
  verifyJwtToken,
  validateSchema(cancelAppointmentSchema),
  appointmentController.cancel,
);

// Reschedule
router.patch(
  "/:appointmentId/reschedule",
  verifyJwtToken,
  validateSchema(rescheduleAppointmentSchema),
  appointmentController.reschedule,
);

// Check In
router.patch("/:appointmentId/check-in", appointmentController.checkIn);

// Start
router.patch("/:appointmentId/start", appointmentController.start);

// Complete
router.patch(
  "/:appointmentId/complete",
  verifyJwtToken,
  validateSchema(completeAppointmentSchema),
  appointmentController.complete,
);

// No Show
router.patch(
  "/:appointmentId/no-show",
  verifyJwtToken,
  appointmentController.noShow,
);

// Doctor
router.get(
  "/doctor/:doctorId",
  verifyJwtToken,
  appointmentController.doctorAppointments,
);

// Doctor Today
router.get(
  "/doctor/:doctorId/today",
  verifyJwtToken,
  appointmentController.today,
);

// Patient
router.get(
  "/patient/:patientId",
  verifyJwtToken,
  appointmentController.patientAppointments,
);

// Hospital
router.get(
  "/hospital/:hospitalId",
  verifyJwtToken,
  appointmentController.hospitalAppointments,
);

// Hospital Dashboard
router.get(
  "/hospital/:hospitalId/dashboard",
  verifyJwtToken,
  appointmentController.dashboard,
);

module.exports = router;
