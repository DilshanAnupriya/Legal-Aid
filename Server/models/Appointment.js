// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // assuming you have a User model
    required: true,
  },
  lawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String, // or store as Date if you prefer
    required: true,
  },
  meetingType: {
    type: String,
    enum: ["video", "in-person", "phone"],
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending',
  },
  description:{type:String,required: false},
  contactName:{type:String,required: false},
  contactEmail: {type:String,required: false},
  contactPhone: {type:String,required: false},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
