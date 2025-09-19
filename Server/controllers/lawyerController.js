import Lawyer from "../models/Lawyer.js";

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

    // Add search filter (search by firstName, lastName, or specialization)
    if (searchText) {
      filter.$or = [
        { firstName: { $regex: searchText, $options: "i" } },
        { lastName: { $regex: searchText, $options: "i" } },
        { specialization: { $regex: searchText, $options: "i" } },
      ];
    }

    // Add category filter
    if (category) {
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