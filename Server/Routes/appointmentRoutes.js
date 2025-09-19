// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const { createAppointment, getUserAppointments } = require('../controllers/appointmentController');

// Create a new appointment
router.post('/create', createAppointment);

// Get appointments of a user
router.get('/user/:userId', getUserAppointments);

module.exports = router;
