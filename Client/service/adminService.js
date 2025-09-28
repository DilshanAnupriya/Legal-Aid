import axios from "axios";

// Change this to your backend URL (localhost or LAN IP)
const ADMIN_API_URL = "http://localhost:3000/api/admins"; // Web backend

// Register a new admin
export const registerAdmin = async (adminData) => {
  console.log("Registering admin...");
  try {
    const response = await axios.post(`${ADMIN_API_URL}/register`, adminData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Admin registered:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error registering admin:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Admin login
export const loginAdmin = async (loginData) => {
  console.log("Logging in admin...");
  try {
    const response = await axios.post(`${ADMIN_API_URL}/login`, loginData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Admin login response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error logging in admin:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Get all lawyers (admin only)
export const getAllLawyers = async () => {
  console.log("Fetching all lawyers for admin...");
  try {
    const response = await axios.get(`${ADMIN_API_URL}/lawyers`);
    console.log("Response of lawyers:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching lawyers:", error);
    throw error;
  }
};

// Update lawyer approval status
export const updateLawyerApproval = async (lawyerId, isApproved) => {
  console.log("Updating lawyer approval...");
  try {
    const response = await axios.put(
      `${ADMIN_API_URL}/lawyers/${lawyerId}/approve`,
      { isApproved },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Lawyer approval updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating approval:", error);
    throw error;
  }
};

