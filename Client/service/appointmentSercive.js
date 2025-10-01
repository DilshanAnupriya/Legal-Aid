import axios from "axios";

// Change this to your backend URL (localhost or LAN IP)
const APPOINTMENT_API_URL = "http://localhost:3000/api/appointments"; // Backend endpoint

// Create a new appointment
export const createAppointment = async (appointmentData) => {
  try {
    console.log("here in the service")
    console.log("appointment data : ", appointmentData)
    const res = await axios.post(APPOINTMENT_API_URL, appointmentData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Error creating appointment" };
  }
};
