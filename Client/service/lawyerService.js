import axios from "axios";

// Change this to your backend URL (localhost or LAN IP)
const API_URL = "http://localhost:3000/api/auth/lawyers"; // Web


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
