import axios from "axios";

// Change this to your backend URL (localhost or LAN IP)
const API_URL = "http://localhost:3000/api/lawyers"; // Web

// Register a lawyer
export const registerAdmin = async (lawyerData) => {
  console.log("Registering lawyer...");
  try {
    const response = await axios.post(API_URL, lawyerData, {
      headers: {
        "Content-Type": "application/json", // Web uses JSON
      },
    });
    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error registering lawyer:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Get all lawyers with category and pagination
export const getAllLawyers = async (category = "", page = 1, limit = 10) => {
  try {
    const params = {
      category: category || undefined,
      page,
      limit,
    };
    const response = await axios.get(API_URL, { params });
    return response;
  } catch (error) {
    console.error("Error fetching lawyers:", error.response?.data || error.message);
    throw error;
  }
};
// Search lawyers by query
export const searchLawyers = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/search`, { params: { q: query } });
    return response.data;
  } catch (error) {
    console.error("Error searching lawyers:", error.response?.data || error.message);
    throw error;
  }
};
