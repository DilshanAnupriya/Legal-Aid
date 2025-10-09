// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const { createAppointment, getUserAppointments,getLawyerAppointments ,getRecentAppointmentsForLawyer ,updateAppointmentStatus} = require('../controllers/appointmentController');

// Create a new appointment
router.post('/', createAppointment);

// Get appointments of a user
router.get('/user/:userId', getUserAppointments);

// Get appointments for a lawyer
router.get('/lawyer/:lawyerId',getLawyerAppointments);

// ✅ New route for recent 3 appointments
router.get('/lawyer/:lawyerId/recent', getRecentAppointmentsForLawyer);

// ✅ Update appointment status
router.put("/:appointmentId/status", updateAppointmentStatus)

module.exports = router;
