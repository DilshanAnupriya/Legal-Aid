// controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const Lawyer = require('../models/Lawyer');

// Create an appointment
exports.createAppointment = async (req, res) => {
  try {
    const { userId, lawyerId, date, time,meetingType,description } = req.body;

    // Optional: check if lawyer exists
    const lawyer = await Lawyer.findById(lawyerId);
    if (!lawyer) return res.status(404).json({ message: 'Lawyer not found' });

    // Optional: check for double booking
    const exists = await Appointment.findOne({ lawyer: lawyerId, date, time });
    if (exists) return res.status(400).json({ message: 'Time slot already booked' });

    const appointment = await Appointment.create({
      user: userId,
      lawyer: lawyerId,
      date,
      time,
      meetingType,
      description
    });

    res.status(201).json({ message: 'Appointment created', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all appointments for a user
exports.getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.params;
    const appointments = await Appointment.find({ user: userId })
      .populate('lawyer', 'firstName specialization email contactNumber')
      .sort({ date: 1 });
    res.json({ appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
