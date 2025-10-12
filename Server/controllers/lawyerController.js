import Lawyer from "../models/Lawyer.js";
import User from "../models/User.js";
import  { updateLawyerPointsFromRating, calculateAverageRating } from "../utils/lawyerPoints.js";

import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register new lawyer
// @route   POST /api/lawyers
export const registerLawyer = async (req, res) => {
  try {
    const { firstName,lastName, email, password, contactNumber,licenseNumber,practiceArea,experience } = req.body;

    const lawyerExists = await Lawyer.findOne({ email });
    if (lawyerExists) return res.status(400).json({ message: "Email already exists" });

    const lawyer = await Lawyer.create({
      firstName,
      lastName,
      email,
      password,
      specialization:practiceArea,
      contactNumber,
      licenseNumber,
      experience
    });

    res.status(201).json({
      _id: lawyer._id,
      fullName: lawyer.fullName,
      email: lawyer.email,
      token: generateToken(lawyer._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login lawyer
// @route   POST /api/lawyers/login
export const loginLawyer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const lawyer = await Lawyer.findOne({ email });

    if (lawyer && (await lawyer.matchPassword(password))) {
      res.json({
        _id: lawyer._id,
        fullName: lawyer.fullName,
        email: lawyer.email,
        token: generateToken(lawyer._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get lawyer profile
// @route   GET /api/lawyers/profile
export const getLawyerProfile = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.user.userId).select("-password");
    if (!lawyer) return res.status(404).json({ message: "Lawyer not found" });

    res.json(lawyer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all approved lawyers with optional category & pagination
// @route   GET /api/lawyers

export const getAllLawyers = async (req, res) => {
  try {
    const { searchText = "", page = 1, size = 10, category = "" } = req.query;

    let filter = { isApproved: true }; // Only approved lawyers

    console.log("search text : ", searchText, page, size, category);

    // Handle search and category together
    if (searchText && category) {
      // Search within specific category
      filter.specialization = category;
      filter.$or = [
        { firstName: { $regex: searchText, $options: "i" } },
        { lastName: { $regex: searchText, $options: "i" } }
      ];
    } else if (searchText && !category) {
      // General search across all fields
      filter.$or = [
        { firstName: { $regex: searchText, $options: "i" } },
        { lastName: { $regex: searchText, $options: "i" } },
        { specialization: { $regex: searchText, $options: "i" } }
      ];
    } else if (!searchText && category) {
      // Filter by category only
      filter.specialization = category;
    }

    const total = await Lawyer.countDocuments(filter);

    const lawyers = await Lawyer.find(filter)
      .sort({ createdAt: -1 }) // Newest first
      .skip((page - 1) * size)
      .limit(parseInt(size))
      .select("-password");

    const totalPages = Math.ceil(total / size);

    res.status(200).json({
      message: "list",
      data: lawyers,
      pagination: {
        count: total,
        currentPage: parseInt(page),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "error", error: error.message });
  }
};
// @desc    Search lawyers
// @route   GET /api/lawyers/search
export const searchLawyers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Search query is required" });

    const lawyers = await Lawyer.find({
      isApproved: true,
      $or: [
        { firstName: { $regex: q, $options: "i" } },
        { lastName: { $regex: q, $options: "i" } },
        { specialization: { $regex: q, $options: "i" } },
      ],
    }).select("-password");

    if (!lawyers || lawyers.length === 0) {
      return res.status(404).json({ message: "No lawyers found" });
    }

    res.json({ message: "search", data: lawyers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Submit a review for a lawyer
// @route   POST /api/lawyers/:lawyerId/review
// @access  Private (authenticated users)
export const rateLawyer = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userDetails._id; // assuming auth middleware sets req.userDetails
   
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
      });
    }

    // Find the lawyer
    const lawyer = await User.findById(lawyerId);
    if (!lawyer || lawyer.role !== 'lawyer') {
      return res.status(404).json({ success: false, message: 'Lawyer not found' });
    }

    // Optional: Check if user already reviewed the lawyer
    const existingReviewIndex = lawyer.reviews.findIndex(
      (r) => r.userId && r.userId.toString() === userId.toString()
    );

    if (existingReviewIndex >= 0) {
      // Update existing review
      lawyer.reviews[existingReviewIndex].rating = rating;
      lawyer.reviews[existingReviewIndex].comment = comment || '';
    } else {
      // Add new review
      lawyer.reviews.push({ userId, rating, comment });
    }

    // Update average rating
    lawyer.rating =
      lawyer.reviews.reduce((acc, r) => acc + r.rating, 0) / lawyer.reviews.length;

    await lawyer.save();

    // Update points based on rating
    const pointsResult = await updateLawyerPointsFromRating(lawyerId, rating);
    // Recalculate average rating
    const ratingResult = await calculateAverageRating(lawyerId);

    return res.status(200).json({
      success: true,
      message: 'Review submitted successfully',
      reviews: lawyer.reviews,
      rating: lawyer.rating,
    });
  } catch (error) {
    console.error('Error rating lawyer:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while submitting review',
      error: error.message,
    });
  }
};

// @desc    Get all reviews for a specific lawyer
// @route   GET /api/lawyers/:lawyerId/reviews
// @access  Public
export const getLawyerReviews = async (req, res) => {
  try {
    const { lawyerId } = req.params;

    // Find the lawyer by ID
    const lawyer = await User.findById(lawyerId)
      .select("firstName lastName rating reviews role")
      
    if (!lawyer || lawyer.role !== "lawyer") {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    // Return reviews and average rating
    return res.status(200).json({
      success: true,
      lawyerId: lawyer._id,
      lawyerName: `${lawyer.firstName} ${lawyer.lastName}`,
      rating: lawyer.rating || 0,
      totalReviews: lawyer.reviews.length,
      reviews: lawyer.reviews,
    });
  } catch (error) {
    console.error("Error fetching lawyer reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving reviews",
      error: error.message,
    });
  }
};


// @desc    Get lawyer tier details and total points
// @route   GET /api/lawyers/:lawyerId/tier
// @access  Public or Private depending on your auth
export const getLawyerTier = async (req, res) => {
  try {
    const { lawyerId } = req.params;

    // Find lawyer by ID
    const lawyer = await User.findById(lawyerId).select("firstName lastName tier totalPoints role");

    if (!lawyer || lawyer.role !== "lawyer") {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    return res.status(200).json({
      success: true,
      lawyerId: lawyer._id,
      lawyerName: `${lawyer.firstName} ${lawyer.lastName}`,
      tier: lawyer.tier,
      totalPoints: lawyer.totalPoints,
    });
  } catch (error) {
    console.error("Error fetching lawyer tier:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving tier details",
      error: error.message,
    });
  }
};