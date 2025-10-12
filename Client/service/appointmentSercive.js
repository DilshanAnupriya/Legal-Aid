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

// ✅ Get all appointments for a specific user
export const getUserAppointments = async (userId) => {
  try {
    const res = await axios.get(`${APPOINTMENT_API_URL}/user/${userId}`);
    return res.data.appointments;
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw error.response?.data || { message: "Error fetching user appointments" };
  }
};

// ✅ Get all appointments for a specific lawyer
export const getLawyerAppointments = async (lawyerId) => {
  try {
    const res = await axios.get(`${APPOINTMENT_API_URL}/lawyer/${lawyerId}`);
    return res.data.appointments;
  } catch (error) {
    console.error("Error fetching lawyer appointments:", error);
    throw error.response?.data || { message: "Error fetching lawyer appointments" };
  }
};

// ✅ Get the 3 most recent appointments for a lawyer
export const getRecentAppointmentsForLawyer = async (lawyerId) => {
  try {
    const res = await axios.get(`${APPOINTMENT_API_URL}/lawyer/${lawyerId}/recent`);
    return res.data.recentAppointments;
  } catch (error) {
    console.error("Error fetching recent appointments:", error);
    throw error.response?.data || { message: "Error fetching recent appointments" };
  }
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  const response = await axios.put(`${APPOINTMENT_API_URL}/${appointmentId}/status`, { status });
  return response.data;
};

// ✅ Get all clients for a specific lawyer
export const getClientsForLawyer = async (lawyerId) => {
  try {
    const res = await axios.get(`${APPOINTMENT_API_URL}/${lawyerId}/clients`);
    return res.data.clients;
  } catch (error) {
    console.error("Error fetching clients for lawyer:", error);
    throw error.response?.data || { message: "Error fetching clients" };
  }
};