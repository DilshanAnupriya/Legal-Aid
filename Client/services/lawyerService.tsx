import axios from "axios";

// 👇 change to your backend URL
const API_URL = "http://localhost:3000/api/lawyers"; 
// If using device/emulator, use your machine's IP instead of localhost.

export const getAllLawyers = async () => {
  try {
    const response = await axios.get(API_URL);
    console.log("response of lawyeers  : ", response);
    return response.data; // list of lawyers
  } catch (error) {
    console.error("Error fetching lawyers:", error);
    throw error;
  }
};

