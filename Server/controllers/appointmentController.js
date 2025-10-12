// controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const Lawyer = require('../models/User');
const { updateLawyerPoints } = require("../utils/lawyerPoints");

// Create an appointment
exports.createAppointment = async (req, res) => {
  try {
    const { userId, lawyerId, date, time,meetingType,description ,contactName,contactEmail,contactPhone} = req.body;

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
      description,
      contactName,
      contactEmail,
      contactPhone
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

// Get all appointments for a lawyer
exports.getLawyerAppointments = async (req, res) => {
  try {
    const { lawyerId } = req.params;

    const appointments = await Appointment.find({ lawyer: lawyerId })
      .populate('user', 'firstName lastName email contactNumber') // show user info
      .sort({ date: 1 });

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found for this lawyer' });
    }

    res.json({ appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get recent 3 appointments for a lawyer
exports.getRecentAppointmentsForLawyer = async (req, res) => {
  try {
    const { lawyerId } = req.params;

    // Find the latest 3 upcoming appointments for the lawyer
    const recentAppointments = await Appointment.find({ lawyer: lawyerId })
      .populate('user', 'firstName lastName email contactNumber')
      .sort({ date: -1, time: -1 }) // Sort by latest date/time
      .limit(3);

    if (!recentAppointments || recentAppointments.length === 0) {
      return res.status(404).json({ message: 'No recent appointments found for this lawyer' });
    }

    res.json({ recentAppointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!["Pending", "Confirmed", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Fetch current appointment first
    const currentAppointment = await Appointment.findById(appointmentId);
    if (!currentAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if this is the first time being confirmed
    let pointsUpdate = null;
    if (status === "Confirmed" && currentAppointment.status !== "Confirmed") {
      // Only increase points if it's the first confirmation
      pointsUpdate = await updateLawyerPoints(
        currentAppointment.lawyer,
        "appointment_held"
      );
    }
    if (status === "Cancelled" && currentAppointment.status !== "Cancelled") {
      // Only increase points if it's the first confirmation
      pointsUpdate = await updateLawyerPoints(
        currentAppointment.lawyer,
        "appointment_cancel"
      );
    }

    // Now update appointment status
    currentAppointment.status = status;
    await currentAppointment.save();

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      appointment: currentAppointment,
      pointsUpdated: !!pointsUpdate,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// Get all unique users (clients) related to a specific lawyer
exports.getClientsForLawyer = async (req, res) => {
  try {
    const { lawyerId } = req.params;

    // Find all appointments for this lawyer and populate user details
    const appointments = await Appointment.find({ lawyer: lawyerId })
      .populate('user', 'firstName lastName email contactNumber')
      .select('user');

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: 'No clients found for this lawyer' });
    }

    // Extract unique users
    const uniqueUsers = [];
    const seen = new Set();

    for (const appt of appointments) {
      const user = appt.user;
      if (user && !seen.has(user._id.toString())) {
        seen.add(user._id.toString());
        uniqueUsers.push(user);
      }
    }

    res.status(200).json({ clients: uniqueUsers });
  } catch (error) {
    console.error("Error fetching clients for lawyer:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
