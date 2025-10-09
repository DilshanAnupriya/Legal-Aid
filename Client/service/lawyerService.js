import axios from "axios";

// Change this to your backend URL (localhost or LAN IP)
const API_URL = "http://localhost:3000/api/auth/lawyers"; // Web
const API_URL_LAWYER_PROFILE = "http://localhost:3000/api/lawyers";




// Get all lawyers with category and pagination
export const getAllLawyers = async (searchText = "", page = 1, limit = 10, category = "" ) => {
  console.log("service called : ")
  try {
    const params = {
      category: category || undefined,
      page,
      size: limit, // Backend uses 'size' not 'limit'
      searchText: searchText || undefined, // Add searchText parameter
    };

    console.log("params : ", params);

    
    // Remove undefined values to clean up the URL
    Object.keys(params).forEach(key => 
      params[key] === undefined && delete params[key]
    );
    
    console.log("API Request params:", params); // Debug log
    
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

// Save or update a lawyer's profile
export const saveLawyerProfile = async (lawyerId, profileData) => {
  try {
    console.log("lawyer id in service : ",lawyerId)
    const response = await axios.post(`${API_URL_LAWYER_PROFILE}/AddprofileDetails`, {
      lawyerId: lawyerId,
      ...profileData,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving lawyer profile:", error.response?.data || error.message);
    throw error;
  }
};

// Fetch a lawyer's profile by ID
export const getLawyerProfile = async (lawyerId) => {
  try {
    const response = await axios.get(`${API_URL_LAWYER_PROFILE}/AddprofileDetails/${lawyerId}`);
    console.log("lawyer profile data : ",response.data.profile)
    return response.data.profile;
  } catch (error) {
    console.error("Error fetching lawyer profile:", error.response?.data || error.message);
    throw error;
  }
};

// Rate or review a lawyer
export const rateLawyer = async (lawyerId, ratingData, token) => {
  try {
    console.log("lawyer id : ",lawyerId)
    const response = await axios.post(
      `${API_URL_LAWYER_PROFILE}/${lawyerId}/review`,
      ratingData,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include JWT token for auth
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting lawyer review:", error.response?.data || error.message);
    throw error;
  }
};

export const getLawyerReviews = async (lawyerId) => {
  const response = await axios.get(`${API_URL_LAWYER_PROFILE}/${lawyerId}/review`);
  return response.data;
};